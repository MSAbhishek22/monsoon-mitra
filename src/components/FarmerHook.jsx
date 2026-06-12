// src/components/FarmerHook.jsx — Section 8 "Friend or Foe" card
import React from 'react';
import { t } from '../i18n/index';

export default function FarmerHook({ irrigationDecision, language }) {
  if (!irrigationDecision) return null;
  const { decision, reason, icon } = irrigationDecision;
  const isSkip = decision === 'skip';

  return (
    <div className="bg-white rounded-[20px] p-5 shadow-card border-l-4 border-amber-500">
      <h3 className="text-[17px] font-bold text-[#1A1A1A]">
        {t(language, 'todayWeather')}
      </h3>
      {/* Decision Box */}
      <div
        className={`mt-4 rounded-xl p-4 border-2 ${
          isSkip ? 'bg-sky-50 border-sky-500' : 'bg-primary-50 border-primary-500'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="text-[32px]">{icon}</span>
          <div>
            <p className={`text-xl font-bold ${isSkip ? 'text-sky-500' : 'text-primary-900'}`}>
              {isSkip ? t(language, 'dontGiveWater') : t(language, 'giveWater')}
            </p>
            <p className="text-sm text-[#4A4A4A] mt-1">{reason}</p>
          </div>
        </div>
      </div>
      {/* Benefit Chips */}
      <div className="flex flex-wrap gap-2 mt-4">
        {[t(language, 'chipWhenWater'), t(language, 'chipTomorrowWeather'), t(language, 'chipCropSafety'), t(language, 'chipSaveMoney')].map((chip, i) => (
          <span key={i} className="px-3.5 py-2 bg-[#F1F8E9] border border-primary-200 rounded-[20px] text-[13px] font-medium text-primary-800">
            {chip}
          </span>
        ))}
      </div>
      {/* Savings Highlight */}
      <div className="mt-4 bg-amber-50 rounded-lg p-3">
        <p className="text-sm font-semibold text-amber-700">{t(language, 'savingsOnce')}</p>
      </div>
    </div>
  );
}
