// src/pages/AIPage.jsx — Section 10 complete spec
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useWeather } from '../hooks/useWeather';
import { useVoice } from '../hooks/useVoice';
import { t } from '../i18n/index';
import { sendMessage, buildWeatherContext } from '../api/gemini';
import { getOfflineResponse } from '../data/offlineResponses';
import { UserBubble, AIBubble, TypingIndicator } from '../components/ai/ChatBubble';
import { ChatSkeleton } from '../components/common/SkeletonCard';
import VoiceButton from '../components/ai/VoiceButton';
import OfflineFallback from '../components/ai/OfflineFallback';
import { addHistory } from '../state/aiHistory';
import { trackEvent, EVENTS } from '../firebase/analytics';

export default function AIPage() {
  const { user, isOnline } = useApp();
  const { normalized } = useWeather();
  const lang = user.language || 'hi';
  const { isListening, startRecording, speak } = useVoice(lang);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    // Simulate initial AI load for realistic feel or fetch history
    const t = setTimeout(() => setIsInitialLoad(false), 800);
    return () => clearTimeout(t);
  }, []);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, isLoading]);

  const handleSend = async (text) => {
    const msg = (text || input).trim();
    if (!msg || isLoading) return;

    const userMsg = { role: 'user', content: msg, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    trackEvent(EVENTS.AI_MESSAGE_SENT);

    let reply = '';
    if (!isOnline) {
      reply = getOfflineResponse(msg, lang);
    } else {
      const weatherCtx = buildWeatherContext(normalized);
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      
      try {
        const result = await sendMessage({ message: msg, language: lang, crop: user.crops, weatherContext: weatherCtx, conversationHistory: history });
        if (result.status === 429) {
          reply = `⏳ बहुत जल्दी सवाल पूछे। 60 सेकंड बाद फिर कोशिश करें।`;
        } else if (result.reply) {
          reply = result.reply;
        } else {
          reply = getOfflineResponse(msg, lang);
        }
      } catch (err) {
        if (err.message?.includes('429')) {
          reply = `⏳ बहुत जल्दी सवाल पूछे। कुछ समय बाद फिर कोशिश करें।`;
        } else {
          reply = getOfflineResponse(msg, lang);
        }
      }
    }

    const aiMsg = { role: 'model', content: reply, timestamp: Date.now() };
    setMessages(prev => [...prev, aiMsg]);
    addHistory({ q: msg, a: reply });
    setIsLoading(false);
  };

  const handleVoice = () => {
    trackEvent(EVENTS.AI_VOICE_USED);
    startRecording((transcript) => {
      if (transcript) { setInput(transcript); handleSend(transcript); }
    });
  };

  const handleListen = (text) => {
    trackEvent(EVENTS.AI_RESPONSE_READ_ALOUD);
    speak(text);
  };

  const suggestions = [t(lang, 'suggestWheat'), t(lang, 'suggestWeather'), t(lang, 'suggestPest'), t(lang, 'suggestFertilizer'), t(lang, 'suggestSchemes')];

  return (
    <div className="flex flex-col h-screen bg-[#F8F8F8]">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 flex-shrink-0" style={{ background: 'linear-gradient(135deg, #2E7D32, #388E3C)' }}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          <span className="text-lg font-bold text-white">{t(lang, 'aiSahayak')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-[#BDBDBD]'}`} />
          <span className="text-xs text-white">{isOnline ? t(lang, 'online') : t(lang, 'offline')}</span>
        </div>
      </div>

      {!isOnline && <OfflineFallback language={lang} />}

      {/* Chat Area */}
      <div ref={chatRef} className="flex-1 overflow-y-auto p-4">
        {isInitialLoad ? (
          <ChatSkeleton />
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <span className="text-5xl mb-3">🤖</span>
            <h2 className="text-xl font-bold text-primary-800">{t(lang, 'aiWelcome')}</h2>
            <p className="text-[15px] text-[#757575] mt-2" style={{ lineHeight: 1.75 }}>{t(lang, 'aiWelcomeSub')}</p>
            <div className="flex flex-wrap gap-2 mt-6 justify-center">
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => handleSend(s)} className="px-4 py-2.5 bg-white border-2 border-primary-200 rounded-[20px] text-sm text-primary-800 shadow-card tap-feedback">
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) =>
              msg.role === 'user' ? (
                <UserBubble key={i} text={msg.content} timestamp={msg.timestamp} />
              ) : (
                <AIBubble key={i} text={msg.content} timestamp={msg.timestamp} onListen={() => handleListen(msg.content)} onSave={() => {}} />
              )
            )}
            {isLoading && <TypingIndicator />}
          </>
        )}
      </div>

      {/* Input Bar */}
      <div className="bg-white border-t border-[#E0E0E0] px-4 py-3 flex-shrink-0 safe-bottom">
        <div className="flex items-center gap-2.5">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder={t(lang, 'askQuestion')}
            className="flex-1 min-h-[48px] bg-[#F1F8E9] border-2 border-[#E0E0E0] rounded-3xl px-4 py-3 text-[15px] text-[#1A1A1A] focus:border-primary-800 transition-colors duration-200"
            id="ai-input"
          />
          <VoiceButton isListening={isListening} onPress={handleVoice} />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className={`w-12 h-12 rounded-3xl flex items-center justify-center tap-feedback ${input.trim() ? 'bg-primary-800 shadow-btn' : 'bg-[#E0E0E0]'}`}
            id="ai-send-btn"
          >
            <span className="text-white text-xl">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
