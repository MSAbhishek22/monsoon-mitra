import React, { useState, useMemo, useEffect } from 'react'
import { askGemini } from './gemini'
import { startListening } from '../../utils/speech'
import { speakHi } from '../../utils/tts'
import { t } from '../../i18n/strings'
import { addHistory, getLast, toggleFavorite, getFavorites, getSoundEnabled, setSoundEnabled } from '../../state/aiHistory'
import { getFAQs, addFAQ } from '../../state/faq'
import { generateOfflineAnswer } from './offline'

function formatAnswer(raw) {
  if (!raw) return { conclusion: '', bullets: [], raw }
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean)
  const conclusion = lines[0] || ''
  const bullets = lines.slice(1).map(l => l.replace(/^[-•*]\s?/, ''))
  return { conclusion, bullets, raw }
}

function getDefaultFAQs(language) {
  if (language === 'HI') {
    return [
      'क्या आज सिंचाई करूं?',
      'कल बारिश होगी?',
      'फसल में कीटनाशक कब डालूं?',
      'पानी कितना दूं?',
      'कौन सी फसल बोऊं?'
    ]
  }
  return [
    'Should I irrigate today?',
    'Will it rain tomorrow?',
    'When to apply pesticides?',
    'How much water to give?',
    'Which crop to sow?'
  ]
}

const AISahayak = ({ language = 'HI', theme = 'light' }) => {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [listening, setListening] = useState(false)
  const [sound, setSound] = useState(getSoundEnabled())
  const [faqs, setFaqs] = useState(getFAQs(8))
  const [messages, setMessages] = useState([])

  const [recent, setRecent] = useState(getLast(3))
  const [favs, setFavs] = useState(getFavorites())

  useEffect(() => {
    const current = getFAQs(1)
    if (!current || current.length === 0) {
      getDefaultFAQs(language).forEach(addFAQ)
      setFaqs(getFAQs(8))
    }
  }, [language])

  useEffect(() => {
    setRecent(getLast(3))
    setFavs(getFavorites())
    setFaqs(getFAQs(8))
  }, [messages.length])

  useEffect(() => {
    const handleExternalAsk = (e) => {
      const q = (e && e.detail) || ''
      if (q) onAsk(q)
    }
    window.addEventListener('ai-ask', handleExternalAsk)
    return () => window.removeEventListener('ai-ask', handleExternalAsk)
  }, [])

  const playDing = () => {
    if (!sound) return
    const audio = new Audio('/sounds/notify.mp3')
    audio.volume = 0.5
    audio.play().catch(() => {})
  }

  const pushMessage = (sender, text) => {
    setMessages((prev) => [...prev, { sender, text, ts: Date.now() }])
  }

  const onAsk = async (qText) => {
    const question = (qText ?? query).trim()
    if (!question) return

    setLoading(true)
    pushMessage('user', question)
    addFAQ(question)

    let res = ''
    if (!navigator.onLine) {
      res = generateOfflineAnswer(question, language)
    } else {
      res = await askGemini(question)
      if (!res || /त्रुटि|error|उपलब्ध नहीं/i.test(res)) {
        // Fallback to offline format
        res = generateOfflineAnswer(question, language)
      }
    }

    pushMessage('bot', res)

    addHistory({ q: question, a: res })
    setRecent(getLast(3))
    setFaqs(getFAQs(8))
    playDing()
    setLoading(false)
    setQuery('')
  }

  const onMicClick = () => {
    try {
      setListening(true)
      const stop = startListening(
        (transcript) => {
          setListening(false)
          setQuery(transcript || '')
        },
        (error) => {
          setListening(false)
          alert(`🎤 Mic Error: ${error.message || error}`)
        }
      )
      setTimeout(() => { try { stop && stop() } catch {} }, 8000)
    } catch (e) {
      setListening(false)
      alert(`🎤 Mic Error: ${e.message}`)
    }
  }

  const onToggleSound = () => {
    const next = !sound
    setSound(next)
    setSoundEnabled(next)
  }

  const onToggleFav = () => {
    // Save last bot message
    const lastBot = [...messages].reverse().find(m => m.sender === 'bot')
    if (!lastBot) return
    toggleFavorite({ q: '', a: lastBot.text })
    setFavs(getFavorites())
  }

  const BotBubble = ({ text }) => {
    const f = formatAnswer(text)
    return (
      <div className={`max-w-[85%] rounded-2xl px-3 py-2 mb-2 chat-bubble-bot mr-auto`}>
        <div className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold mb-2 badge-conclusion`}>{f.conclusion}</div>
        {f.bullets.length > 0 ? (
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {f.bullets.map((b, i) => (<li key={i}>{b}</li>))}
          </ul>
        ) : (
          <div className="text-sm">{f.raw}</div>
        )}
      </div>
    )
  }

  const UserBubble = ({ text }) => (
    <div className={`max-w-[85%] rounded-2xl px-3 py-2 mb-2 chat-bubble-user ml-auto`}>{text}</div>
  )

  return (
    <div className={`farmer-card transition-colors duration-300 ${ theme === 'light' ? 'bg-white' : 'bg-gray-800 border-gray-700' }`}>
      <div className="farmer-header bg-farmer-amber flex items-center justify-between">
        <span>🤖 {t(language, 'askAI')}</span>
        <div className="flex items-center gap-2">
          <button onClick={() => { const lastBot = [...messages].reverse().find(m => m.sender==='bot'); if(lastBot) speakHi(formatAnswer(lastBot.text).raw) }} className={`px-2 py-1 rounded text-xs ${ theme === 'light' ? 'bg-amber-100 text-amber-700' : 'bg-amber-900/30 text-amber-300' }`}>🔊</button>
          <button onClick={onToggleSound} className={`px-2 py-1 rounded text-xs ${ theme === 'light' ? 'bg-gray-100' : 'bg-gray-700 text-white' }`}>{sound ? '🔊' : '🔇'}</button>
          <button onClick={onToggleFav} className={`px-2 py-1 rounded text-xs ${ theme === 'light' ? 'bg-yellow-100 text-yellow-700' : 'bg-yellow-900/30 text-yellow-300' }`}>⭐</button>
        </div>
      </div>

      <div className="mobile-card space-y-4">
        {/* Chat window */}
        <div className={`p-3 rounded-lg border ${ theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-gray-700 border-gray-600' }`} style={{ maxHeight: 300, overflowY: 'auto' }}>
          {messages.length === 0 && (
            <div className={`text-sm ${ theme === 'light' ? 'text-gray-700' : 'text-gray-200' } font-medium`}>
              {language === 'HI' ? 'यहां आपकी बातचीत दिखेगी। हिंदी/English/Hinglish में पूछें।' : 'Your chat will appear here. Ask in Hindi/English/Hinglish.'}
            </div>
          )}
          {messages.map((m, i) => m.sender === 'user' ? <UserBubble key={i} text={m.text}/> : <BotBubble key={i} text={m.text}/>)}
          {loading && (<div className={`text-sm ${ theme === 'light' ? 'text-gray-600' : 'text-gray-300' }`}>⏳ {language === 'HI' ? 'AI सोच रहा है...' : 'AI is thinking...'}</div>)}
        </div>

        {/* FAQs */}
        {faqs.length > 0 && (
          <div>
            <div className={`font-semibold mb-2 ${ theme === 'light' ? 'text-gray-900' : 'text-gray-100' }`}>❓ {language === 'HI' ? 'अक्सर पूछे जाने वाले सवाल' : 'FAQs'}</div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
              {faqs.map((f, idx) => (
                <button key={idx} onClick={() => onAsk(f)} className={`text-left px-3 py-3 rounded-lg focus-ring ${ theme === 'light' ? 'bg-white hover:bg-gray-100 border border-gray-200 text-gray-800' : 'bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-100' }`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Single input + controls */}
        <div>
          <textarea rows={3} value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t(language, 'askPlaceholder')} className={`w-full farmer-input ${ theme === 'light' ? 'border-gray-200' : 'border-gray-600 bg-gray-700 text-white' }`} />
          <div className="flex items-center space-x-3 mt-3">
            <button onClick={onMicClick} className={`min-h-[64px] min-w-[64px] h-16 w-16 rounded-full flex items-center justify-center font-bold focus-ring btn-green`} title="Mic">{listening ? '🎙…' : '🎤'}</button>
            <button onClick={() => onAsk()} className={`min-h-[56px] min-w-[56px] px-5 py-3 rounded-lg font-semibold focus-ring btn-green`}>👉 {t(language, 'ask')}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AISahayak
