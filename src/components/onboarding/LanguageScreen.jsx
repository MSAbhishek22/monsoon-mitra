// src/components/onboarding/LanguageScreen.jsx — Section 6, Screen 1
import React from 'react';
import { LANGUAGE_OPTIONS } from '../../i18n/index';
import { trackEvent, EVENTS } from '../../firebase/analytics';

export default function LanguageScreen({ selectedLanguage, onSelect }) {
  const handleSelect = (code) => {
    onSelect(code);
    trackEvent(EVENTS.ONBOARDING_LANGUAGE_SELECTED, { language: code });
  };
  return (
    <div className="flex flex-col h-full">
      {/* Top section */}
      <div className="text-center pt-8 pb-6">
        <div className="text-[56px] animate-scale-in" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>🌍</div>
        <h2 className="text-2xl font-bold text-[#1A1A1A] mt-4 animate-slide-up" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
          भाषा चुनें / Choose Language
        </h2>
        <p className="text-[15px] text-[#757575] mt-2 animate-slide-up" style={{ animationDelay: '300ms', animationFillMode: 'both', lineHeight: 1.75 }}>
          आप किस भाषा में बात करना पसंद करते हैं?
        </p>
      </div>

      {/* Language Grid */}
      <div className="grid grid-cols-2 gap-3 px-4 flex-1">
        {LANGUAGE_OPTIONS.map(lang => {
          const isSelected = selectedLanguage === lang.code;
          return (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 shadow-card tap-feedback transition-all duration-200 ${
                isSelected
                  ? 'border-primary-800 bg-primary-50 scale-[1.02]'
                  : 'border-[#E0E0E0] bg-white'
              }`}
              style={{ minHeight: '72px' }}
              id={`lang-${lang.code}`}
            >
              <span className="text-lg font-bold text-[#1A1A1A]">{lang.native}</span>
              <span className="text-xs text-[#757575] mt-1">{lang.english}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
