// src/components/onboarding/CropScreen.jsx — Section 6, Screen 2
import React, { useState } from 'react';
import { CROPS, getCropName } from '../../utils/cropData';
import { t } from '../../i18n/index';

export default function CropScreen({ selectedCrops, onSelect, customCrop, onCustomCropChange, language }) {
  const showCustomInput = selectedCrops.includes('other');

  const toggleCrop = (cropId) => {
    if (selectedCrops.includes(cropId)) {
      onSelect(selectedCrops.filter(c => c !== cropId));
    } else {
      onSelect([...selectedCrops, cropId]);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="text-center pt-6 pb-4 px-4">
        <h2 className="text-2xl font-bold text-[#1A1A1A]">{t(language, 'whatCrop')}</h2>
        <p className="text-[15px] text-[#757575] mt-2" style={{ lineHeight: 1.75 }}>
          {t(language, 'whatCropSub')}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 px-4 flex-1 overflow-y-auto pb-4">
        {CROPS.map(crop => {
          const isSelected = selectedCrops.includes(crop.id);
          return (
            <button
              key={crop.id}
              onClick={() => toggleCrop(crop.id)}
              className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 shadow-card tap-feedback transition-all duration-200 ${
                isSelected
                  ? 'border-primary-800 bg-primary-50'
                  : 'border-[#E0E0E0] bg-white'
              }`}
              style={{ minHeight: '100px' }}
              id={`crop-${crop.id}`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary-800 flex items-center justify-center animate-scale-in">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
              <span className="text-[32px]">{crop.emoji}</span>
              <span className="text-base font-semibold text-[#1A1A1A] mt-1">
                {getCropName(crop.id, language)}
              </span>
              {language !== 'hi' && language !== 'en' && (
                <span className="text-xs text-[#757575]">{crop.hi}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Custom crop input */}
      {showCustomInput && (
        <div className="px-4 pb-4 animate-slide-down">
          <input
            type="text"
            value={customCrop}
            onChange={(e) => onCustomCropChange(e.target.value)}
            placeholder={t(language, 'typeCropName')}
            className="w-full px-4 py-3 border-2 border-primary-800 rounded-lg text-base"
            id="custom-crop-input"
          />
        </div>
      )}
    </div>
  );
}
