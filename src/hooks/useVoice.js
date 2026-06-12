// src/hooks/useVoice.js
import { useState, useCallback } from 'react';
import { startListening } from '../utils/speech';
import { speakHi } from '../utils/tts';

export function useVoice(language = 'hi') {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const startRecording = useCallback((onResult) => {
    setIsListening(true);
    const stop = startListening(
      (transcript) => {
        setIsListening(false);
        if (onResult) onResult(transcript);
      },
      () => {
        setIsListening(false);
      }
    );
    // Auto-stop after 8 seconds
    setTimeout(() => {
      try { stop && stop(); } catch {}
      setIsListening(false);
    }, 8000);

    return stop;
  }, []);

  const stopRecording = useCallback(() => {
    setIsListening(false);
  }, []);

  const speak = useCallback((text) => {
    if (!text) return;
    setIsSpeaking(true);

    const langMap = {
      hi: 'hi-IN',
      en: 'en-IN',
      bn: 'bn-IN',
      mr: 'mr-IN',
      pa: 'pa-IN',
    };

    try {
      if (window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = langMap[language] || 'hi-IN';
        utterance.rate = 0.9;
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      } else {
        speakHi(text);
        setIsSpeaking(false);
      }
    } catch {
      setIsSpeaking(false);
    }
  }, [language]);

  const stopSpeaking = useCallback(() => {
    try {
      window.speechSynthesis?.cancel();
    } catch {}
    setIsSpeaking(false);
  }, []);

  return {
    isListening,
    isSpeaking,
    startRecording,
    stopRecording,
    speak,
    stopSpeaking,
  };
}
