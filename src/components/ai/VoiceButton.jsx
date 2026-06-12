// src/components/ai/VoiceButton.jsx — Section 10 voice button
import React from 'react';

export default function VoiceButton({ isListening, onPress }) {
  return (
    <button
      onClick={onPress}
      className={`w-12 h-12 rounded-3xl border-2 flex items-center justify-center tap-feedback transition-all duration-200 ${
        isListening
          ? 'bg-danger-50 border-danger-700 animate-pulse'
          : 'bg-[#F1F8E9] border-[#E0E0E0]'
      }`}
      aria-label={isListening ? 'Stop recording' : 'Start recording'}
      id="voice-btn"
    >
      <span className="text-xl">{isListening ? '⏹️' : '🎤'}</span>
    </button>
  );
}
