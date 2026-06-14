import { useState, useRef, useCallback, useEffect } from 'react';

const LANG_CODES = {
  hi: 'hi-IN', en: 'en-IN', bn: 'bn-BD', mr: 'mr-IN', pa: 'pa-IN'
};

export function useVoice(language = 'hi', onResult) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported] = useState(() =>
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
  );
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const onResultRef = useRef(onResult);
  const mountedRef = useRef(true);

  // Keep onResult ref current without re-creating recognition
  useEffect(() => { onResultRef.current = onResult; }, [onResult]);
  useEffect(() => () => { mountedRef.current = false; }, []);

  const stopListening = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch (_) {}
    if (mountedRef.current) setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Voice not supported in this browser. Use Chrome on Android.');
      return;
    }
    if (isListening) { stopListening(); return; }

    setError(null);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = LANG_CODES[language] || 'hi-IN';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      if (mountedRef.current) setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim();
      if (transcript && onResultRef.current) {
        onResultRef.current(transcript);
      }
      if (mountedRef.current) setIsListening(false);
    };

    recognition.onerror = (event) => {
      const errorMessages = {
        'not-allowed': 'माइक की अनुमति दें। ब्राउज़र सेटिंग में Microphone allow करें।',
        'no-speech': 'आवाज़ नहीं मिली। फिर कोशिश करें।',
        'network': 'नेटवर्क समस्या। इंटरनेट जांचें।',
        'aborted': null,
      };
      const msg = errorMessages[event.error];
      if (msg && mountedRef.current) setError(msg);
      if (mountedRef.current) setIsListening(false);
    };

    recognition.onend = () => {
      if (mountedRef.current) setIsListening(false);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (e) {
      setIsListening(false);
      setError('माइक शुरू नहीं हुआ। पेज रिफ्रेश करें।');
    }
  }, [isSupported, isListening, language, stopListening]);

  const speak = useCallback((text, lang = language) => {
    if (!('speechSynthesis' in window) || !text) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = LANG_CODES[lang] || 'hi-IN';
    u.rate = 0.88;
    u.pitch = 1.0;
    u.volume = 1.0;
    window.speechSynthesis.speak(u);
  }, [language]);

  const cancelSpeak = useCallback(() => {
    window.speechSynthesis?.cancel();
  }, []);

  return { isListening, isSupported, error, startListening, stopListening, speak, cancelSpeak };
}
