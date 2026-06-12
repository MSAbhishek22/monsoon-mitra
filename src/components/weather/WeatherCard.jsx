// src/components/weather/WeatherCard.jsx (new, for weather page hero)
import React from 'react';
import { getWeatherEmoji, getWeatherCondition } from '../../api/weather';

export default function WeatherHeroCard({ normalized, city, state, language }) {
  if (!normalized) return null;
  const { temperatureCelsius, humidityPercent, windSpeedKmh, uvIndex, rainProbabilityNext24h } = normalized;
  const emoji = getWeatherEmoji(rainProbabilityNext24h, temperatureCelsius);
  const condition = getWeatherCondition(rainProbabilityNext24h, temperatureCelsius, language);

  return (
    <div className="rounded-b-[32px] px-5 pt-6 pb-8" style={{ background: 'linear-gradient(180deg, #0277BD 0%, #01579B 100%)' }}>
      <p className="text-[15px] text-white/85 flex items-center gap-1">📍 {city || 'Location'}{state ? `, ${state}` : ''}</p>
      <div className="text-center mt-4">
        <p className="text-[72px] font-extrabold text-white leading-none">{temperatureCelsius?.toFixed(0) ?? '--'}°C</p>
        <div className="text-[64px] mt-2">{emoji}</div>
        <p className="text-lg text-white/90 mt-1">{condition}</p>
      </div>
      <div className="flex justify-around mt-6 pt-4 border-t border-white/20">
        <div className="text-center">
          <p className="text-xs text-white/70">💧</p>
          <p className="text-base font-bold text-white">{humidityPercent?.toFixed(0) ?? '--'}%</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-white/70">💨</p>
          <p className="text-base font-bold text-white">{windSpeedKmh?.toFixed(0) ?? '--'} km/h</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-white/70">☀️</p>
          <p className="text-base font-bold text-white">{uvIndex?.toFixed(0) ?? '--'}</p>
        </div>
      </div>
    </div>
  );
}
