import { useState, useRef, useCallback, useEffect } from 'react';

const LANG_CODES = { hi: 'hi-IN', en: 'en-IN', bn: 'bn-BD', mr: 'mr-IN', pa: 'pa-IN' };

export function useVoice(language = 'hi', onResult) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const onResultRef = useRef(onResult);
  const activeRef = useRef(false);

  useEffect(() => { onResultRef.current = onResult; }, [onResult]);

  const isSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const stopListening = useCallback(() => {
    activeRef.current = false;
    try { recognitionRef.current?.abort(); } catch (_) {}
    setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Chrome ब्राउज़र में माइक काम करता है। Chrome इस्तेमाल करें।');
      return;
    }
    if (activeRef.current) { stopListening(); return; }
    setError(null);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = LANG_CODES[language] || 'hi-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => { activeRef.current = true; setIsListening(true); };

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim();
      activeRef.current = false;
      setIsListening(false);
      if (transcript) setTimeout(() => onResultRef.current?.(transcript), 50);
    };

    recognition.onerror = (event) => {
      activeRef.current = false;
      setIsListening(false);
      const msgs = {
        'not-allowed': '🎤 माइक की अनुमति दें — ब्राउज़र में Allow करें',
        'no-speech': '🔇 आवाज़ नहीं सुनी — फिर कोशिश करें',
        'network': '📶 नेटवर्क समस्या',
        'audio-capture': '🎤 माइक नहीं मिला',
      };
      if (msgs[event.error]) setError(msgs[event.error]);
    };

    recognition.onend = () => { activeRef.current = false; setIsListening(false); };

    recognitionRef.current = recognition;
    try { recognition.start(); } catch (e) {
      activeRef.current = false;
      setIsListening(false);
      setError('माइक शुरू नहीं हुआ। पेज रिफ्रेश करें।');
    }
  }, [isSupported, language, stopListening]);

  const speak = useCallback((text) => {
    if (!('speechSynthesis' in window) || !text) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = LANG_CODES[language] || 'hi-IN';
    u.rate = 0.85; u.pitch = 1; u.volume = 1;
    window.speechSynthesis.speak(u);
  }, [language]);

  return { isListening, isSupported, error, startListening, stopListening, speak };
}
