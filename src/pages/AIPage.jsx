import { useState, useRef, useEffect, useCallback } from 'react';
import { useApp, useT } from '../context/AppContext';
import { useVoice } from '../hooks/useVoice';
import { storage } from '../utils/storage';
import { trackEvent, EVENTS } from '../firebase/analytics';

const CHIPS = {
  hi: [
    '💧 आज पानी देना चाहिए?',
    '🌦️ अगले 7 दिन मौसम कैसा है?',
    '🐛 फसल को कीड़ों से कैसे बचाएं?',
    '🌱 गेहूं में खाद कब डालें?',
    '📋 PM-KISAN योजना क्या है?',
    '💊 फसल की बीमारी कैसे पहचानें?',
  ],
  en: [
    '💧 Should I irrigate today?',
    '🌦️ 7-day weather forecast?',
    '🐛 How to protect crops from pests?',
    '🌱 When to apply fertilizer to wheat?',
    '📋 What is PM-KISAN scheme?',
    '💊 How to identify crop disease?',
  ],
  bn: [
    '💧 আজ সেচ দেওয়া উচিত?',
    '🌦️ আগামী ৭ দিনের আবহাওয়া?',
    '🐛 ফসলকে পোকা থেকে কীভাবে রক্ষা করবেন?',
  ],
  mr: [
    '💧 आज पाणी द्यावे का?',
    '🌦️ पुढचे ७ दिवस हवामान कसे असेल?',
    '🐛 पिकाला कीडीपासून कसे वाचवायचे?',
  ],
  pa: [
    '💧 ਅੱਜ ਪਾਣੀ ਦੇਣਾ ਚਾਹੀਦਾ ਹੈ?',
    '🌦️ ਅਗਲੇ 7 ਦਿਨ ਮੌਸਮ ਕਿਵੇਂ ਰਹੇਗਾ?',
  ],
};



export default function AIPage() {
  const { user } = useApp();
  const t = useT();
  const lang = user?.language || 'hi';
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const isUnmounted = useRef(false);

  useEffect(() => () => { isUnmounted.current = true; }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Pick up voice query from global FAB
  useEffect(() => {
    const pending = storage.get('pending_voice_query');
    if (pending) {
      storage.remove('pending_voice_query');
      setTimeout(() => sendMessage(pending), 500);
    }
  }, []);

  const { isListening, isSupported, error: micError, startListening, stopListening, speak } = useVoice(
    lang,
    (transcript) => {
      if (transcript) sendMessage(transcript);
    }
  );

  useEffect(() => {
    if (micError) { setVoiceError(micError); setTimeout(() => setVoiceError(''), 4000); }
  }, [micError]);

  const sendMessage = useCallback(async (textOverride) => {
    const text = (typeof textOverride === 'string' ? textOverride : inputText).trim();
    if (!text || isLoading) return;

    if (!isUnmounted.current) {
      setInputText('');
      if (inputRef.current) { inputRef.current.style.height = '48px'; }
    }

    const userMsg = { id: `u_${Date.now()}`, role: 'user', content: text };
    if (!isUnmounted.current) setMessages(prev => [...prev, userMsg]);
    if (!isUnmounted.current) setIsLoading(true);

    trackEvent(EVENTS.AI_MESSAGE_SENT, { len: text.length, lang });

    // Build context
    const weatherCache = storage.get('weather_cache');
    const weatherCtx = weatherCache
      ? `आज का मौसम: ${weatherCache.current?.temperature}°C, ${weatherCache.current?.description}, बारिश की संभावना: ${weatherCache.rainProbabilityNext24h}%`
      : 'मौसम डेटा उपलब्ध नहीं';

    const history = messages.slice(-8).map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      content: m.content
    }));

    try {
      if (!navigator.onLine) throw new Error('offline');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: text,
          language: lang,
          crop: Array.isArray(user?.crops) ? user.crops : ['गेहूं'],
          weatherContext: weatherCtx,
          conversationHistory: history,
        }),
      });

      clearTimeout(timeoutId);

      if (res.status === 429) {
        const d = await res.json().catch(() => ({}));
        const retryMsg = { id: `s_${Date.now()}`, role: 'ai', content: `⏳ ${d.error || 'थोड़ी देर बाद कोशिश करें।'}`, isSystem: true };
        if (!isUnmounted.current) setMessages(prev => [...prev, retryMsg]);
        return;
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        if (errData.error) {
          throw new Error(`API_ERROR:${errData.error}`);
        }
        throw new Error(`HTTP_${res.status}`);
      }

      const data = await res.json();
      if (!data?.reply) throw new Error('empty_reply');

      const aiMsg = { id: `a_${Date.now()}`, role: 'ai', content: data.reply };
      if (!isUnmounted.current) setMessages(prev => [...prev, aiMsg]);
      trackEvent(EVENTS.AI_RESPONSE_RECEIVED, { tokens: data.tokens || 0 });

    } catch (err) {
      if (err.message.startsWith('API_ERROR:')) {
        const errorText = err.message.substring(10);
        const errMsg = { id: `e_${Date.now()}`, role: 'ai', content: `⚠️ सर्वर त्रुटि (Server Error):\n${errorText}` };
        if (!isUnmounted.current) setMessages(prev => [...prev, errMsg]);
      } else {
        const { getOfflineResponse } = await import('../data/offlineResponses.js');
        const fallback = getOfflineResponse(text, lang);
        const label = err.message === 'offline' ? '📴 ऑफलाइन — ' : err.name === 'AbortError' ? '⏱️ समय सीमा — ' : '⚠️ (Network Error) ';
        const errMsg = { id: `e_${Date.now()}`, role: 'ai', content: `${label}${fallback}` };
        if (!isUnmounted.current) setMessages(prev => [...prev, errMsg]);
      }
    } finally {
      if (!isUnmounted.current) setIsLoading(false);
    }
  }, [inputText, isLoading, lang, messages, user]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#F8FAF8' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1B5E20, #2E7D32)',
        padding: '16px 20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '24px' }}>🤖</span>
          <span style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF' }}>AI सहायक</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: navigator.onLine ? '#69F0AE' : '#BDBDBD' }} />
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)' }}>
              {navigator.onLine ? 'ऑनलाइन' : 'ऑफलाइन'}
            </span>
          </div>
          {messages.length > 0 && (
            <button onClick={() => setMessages([])} style={{
              background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '8px',
              padding: '6px 10px', color: '#FFFFFF', cursor: 'pointer', fontSize: '16px'
            }}>🗑️</button>
          )}
        </div>
      </div>

      {/* Voice Error banner */}
      {voiceError && (
        <div style={{ background: '#FFEBEE', borderBottom: '2px solid #E53935', padding: '10px 16px' }}>
          <p style={{ fontSize: '13px', color: '#C62828', margin: 0 }}>⚠️ {voiceError}</p>
        </div>
      )}

      {/* Offline banner */}
      {!navigator.onLine && (
        <div style={{ background: '#FFF3E0', borderBottom: '2px solid #FFB300', padding: '10px 16px' }}>
          <p style={{ fontSize: '13px', color: '#E65100', margin: 0 }}>⚠️ ऑफलाइन मोड — सीमित जवाब मिलेंगे</p>
        </div>
      )}

      {/* Chat area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }} className="hide-scrollbar">
        {messages.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '300px' }}>
            <span style={{ fontSize: '56px', marginBottom: '16px' }}>🤖</span>
            <p style={{ fontSize: '20px', fontWeight: 700, color: '#1B5E20', marginBottom: '8px', textAlign: 'center' }}>
              {lang === 'hi' ? t('aiWelcome') : lang === 'en' ? 'Hello! I am AI Sahayak' : t('aiWelcome')}
            </p>
            <p style={{ fontSize: '15px', color: '#5A7A5A', marginBottom: '24px', textAlign: 'center', lineHeight: 1.6 }}>
              {lang === 'hi' ? 'खेती के बारे में कुछ भी पूछें' : 'Ask me anything about farming'}
            </p>
            <div style={{ display: 'flex', overflowX: 'auto', gap: '10px', width: '100%', paddingBottom: '8px' }} className="hide-scrollbar">
              {(CHIPS[lang] || CHIPS.hi).map(chip => (
                <button key={chip} onClick={() => sendMessage(chip)} style={{
                  background: '#FFFFFF', border: '2px solid #A5D6A7', borderRadius: '20px',
                  padding: '10px 16px', fontSize: '14px', color: '#1B5E20', fontWeight: 500,
                  cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)', WebkitTapHighlightColor: 'transparent'
                }}>
                  {chip}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map(msg => (
              <div key={msg.id} style={{
                display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: '16px', alignItems: 'flex-end', gap: '8px'
              }}>
                {msg.role === 'ai' && <span style={{ fontSize: '24px', flexShrink: 0, alignSelf: 'flex-start' }}>🤖</span>}
                <div style={{ maxWidth: '82%' }}>
                  <div style={{
                    padding: '12px 16px', lineHeight: 1.7,
                    borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: msg.role === 'user'
                      ? 'linear-gradient(135deg, #2E7D32, #388E3C)'
                      : msg.isSystem ? '#FFF8E1' : '#FFFFFF',
                    color: msg.role === 'user' ? '#FFFFFF' : '#0D1B0D',
                    fontSize: '15px',
                    boxShadow: msg.role === 'user' ? '0 4px 12px rgba(46,125,50,0.3)' : '0 2px 8px rgba(0,0,0,0.08)',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {msg.content}
                  </div>
                  {msg.role === 'ai' && !msg.isSystem && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <button onClick={() => speak(msg.content)} style={{
                        background: '#E8F5E9', color: '#1B5E20', border: 'none',
                        borderRadius: '8px', padding: '6px 12px', fontSize: '12px',
                        fontWeight: 600, cursor: 'pointer'
                      }}>{t('listen')}</button>
                      <button onClick={() => {
                        const saved = storage.get('saved_messages') || [];
                        storage.set('saved_messages', [...saved, msg]);
                      }} style={{
                        background: '#FFF8E1', color: '#F57F17', border: 'none',
                        borderRadius: '8px', padding: '6px 12px', fontSize: '12px',
                        fontWeight: 600, cursor: 'pointer'
                      }}>{t('save')}</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '24px' }}>🤖</span>
                <div style={{ background: '#FFFFFF', borderRadius: '18px 18px 18px 4px', padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', gap: '6px', alignItems: 'center' }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#A5D6A7', animation: 'bounce 1.2s infinite', animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input bar */}
      <div style={{
        background: '#FFFFFF', borderTop: '2px solid #E8F5E9',
        padding: '12px 16px',
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
        display: 'flex', gap: '10px', alignItems: 'flex-end', flexShrink: 0
      }}>
        {isSupported && (
          <button onClick={isListening ? stopListening : startListening} style={{
            width: '48px', height: '48px', borderRadius: '24px', border: 'none',
            background: isListening ? '#FFEBEE' : '#F1F8E9',
            outline: `2px solid ${isListening ? '#C62828' : '#C8E6C9'}`,
            fontSize: '20px', cursor: 'pointer', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: isListening ? 'pulse 1s infinite' : 'none'
          }}>
            {isListening ? '⏹️' : '🎤'}
          </button>
        )}
        <textarea
          ref={inputRef}
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          onInput={e => { e.target.style.height = '48px'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }}
          placeholder={t('chatPlaceholder')}
          rows={1}
          style={{
            flex: 1, minHeight: '48px', maxHeight: '120px',
            background: '#F0F7F0', border: '2px solid #C8E6C9',
            borderRadius: '24px', padding: '12px 16px',
            fontSize: '15px', color: '#0D1B0D', resize: 'none',
            outline: 'none', fontFamily: 'inherit', lineHeight: 1.5,
            overflowY: 'auto'
          }}
          onFocus={e => e.target.style.border = '2px solid #2E7D32'}
          onBlur={e => e.target.style.border = '2px solid #C8E6C9'}
        />
        <button
          onClick={() => sendMessage()}
          disabled={!inputText.trim() || isLoading}
          style={{
            width: '48px', height: '48px', borderRadius: '24px', border: 'none',
            background: inputText.trim() && !isLoading
              ? 'linear-gradient(135deg, #1B5E20, #2E7D32)'
              : '#E0E0E0',
            color: '#FFFFFF', fontSize: '20px', cursor: inputText.trim() ? 'pointer' : 'default',
            flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: inputText.trim() ? '0 4px 12px rgba(27,94,32,0.4)' : 'none',
            transition: 'all 200ms ease'
          }}
        >
          {isLoading ? '⏳' : '➤'}
        </button>
      </div>
    </div>
  );
}
