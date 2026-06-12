// src/components/onboarding/OnboardingWrapper.jsx — Section 6 spec
import React, { useState } from 'react';
import LanguageScreen from './LanguageScreen';
import CropScreen from './CropScreen';
import LocationScreen from './LocationScreen';
import { trackEvent, EVENTS } from '../../firebase/analytics';

export default function OnboardingWrapper({ onComplete }) {
  const [step, setStep] = useState(0);
  const [language, setLanguage] = useState('hi');
  const [crops, setCrops] = useState([]);

  const handleLanguageSelect = (lang) => {
    setLanguage(lang);
    trackEvent(EVENTS.ONBOARDING_LANGUAGE_SELECTED, { language: lang });
  };

  const handleNext = () => {
    if (step === 0 && !language) return;
    if (step === 1 && crops.length === 0) return;
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => Math.max(0, prev - 1));
  };

  const handleLocationComplete = (locationData) => {
    trackEvent(EVENTS.ONBOARDING_COMPLETED);
    onComplete({
      language,
      crops,
      location: locationData.location,
      name: locationData.name,
    });
  };

  const screens = [
    <LanguageScreen selectedLanguage={language} onSelect={handleLanguageSelect} />,
    <CropScreen selectedCrops={crops} onSelect={setCrops} language={language} />,
    <LocationScreen onComplete={handleLocationComplete} language={language} />,
  ];

  return (
    <div className="fixed inset-0 z-[500] bg-white flex flex-col">
      {/* Header with progress dots and back button */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        {/* Back button */}
        <div className="w-14 h-14 flex items-center justify-center">
          {step > 0 && (
            <button
              onClick={handleBack}
              className="w-14 h-14 flex items-center justify-center tap-feedback"
              aria-label="Back"
            >
              <span className="text-2xl text-[#4A4A4A]">←</span>
            </button>
          )}
        </div>

        {/* Progress dots */}
        <div className="flex gap-2 items-center">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === step
                  ? 'w-6 bg-primary-800'
                  : 'w-2 bg-[#E0E0E0]'
              }`}
              style={{ transitionTimingFunction: 'cubic-bezier(0.34,1.56,0.64,1)' }}
            />
          ))}
        </div>

        <div className="w-14" />
      </div>

      {/* Screen content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full animate-slide-in-right" key={step}>
          {screens[step]}
        </div>
      </div>

      {/* Continue button (screens 0 and 1 only) */}
      {step < 2 && (
        <div className="px-6 pb-6 safe-bottom">
          <button
            onClick={handleNext}
            disabled={(step === 0 && !language) || (step === 1 && crops.length === 0)}
            className="w-full h-14 rounded-xl font-semibold text-lg text-white bg-primary-800 shadow-btn tap-feedback disabled:opacity-50 disabled:shadow-none"
            id="onboarding-continue-btn"
          >
            {language === 'hi' || !language ? 'आगे बढ़ें →' : 'Continue →'}
          </button>
        </div>
      )}
    </div>
  );
}
