// src/pages/WeatherPage.jsx — Section 9 complete spec
import React from 'react';
import { useApp } from '../context/AppContext';
import { useWeather } from '../hooks/useWeather';
import { t } from '../i18n/index';
import { getDayName, getWeatherEmoji } from '../api/weather';
import WeatherHeroCard from '../components/weather/WeatherCard';
import IrrigationAdvice from '../components/weather/IrrigationAdvice';
import ForecastStrip from '../components/weather/ForecastStrip';
import { WeatherSkeleton, ForecastSkeleton } from '../components/common/SkeletonCard';

function getBarColor(pct) {
  if (pct > 80) return '#C62828';
  if (pct > 60) return '#FB8C00';
  if (pct > 30) return '#FFB300';
  return '#A5D6A7';
}

export default function WeatherPage() {
  const { user } = useApp();
  const { normalized, irrigationDecision, loading, weatherData } = useWeather();
  const lang = user.language || 'hi';
  const daily = weatherData?.daily || [];

  if (loading && !normalized) return (
    <div className="bg-[#F1F8E9] min-h-screen pb-20 p-4 space-y-4">
      <WeatherSkeleton />
      <ForecastSkeleton />
    </div>
  );

  return (
    <div className="bg-[#F1F8E9] min-h-screen pb-20">
      {/* Weather Hero */}
      <WeatherHeroCard normalized={normalized} city={user.location?.city} state={user.location?.state} language={lang} />
      {/* Irrigation Decision */}
      <IrrigationAdvice decision={irrigationDecision} />

      <div className="px-4 mt-6">
        {/* 7-Day Forecast */}
        <h3 className="text-[17px] font-bold text-[#1A1A1A] mb-3">{t(lang, 'sevenDayForecast')}</h3>
        <div className="space-y-2">
          {daily.map((day, i) => {
            const prob = day.probMax || 0;
            const hasHighRain = prob > 60;
            const hasCriticalRain = prob > 80;
            return (
              <div key={i} className={`h-16 bg-white rounded-xl shadow-card px-4 flex items-center justify-between ${hasHighRain ? 'border-l-4' : ''}`}
                style={hasHighRain ? { borderLeftColor: hasCriticalRain ? '#C62828' : '#0277BD' } : {}}>
                <span className="text-base font-semibold text-[#1A1A1A] w-12">{getDayName(day.date, lang)}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[32px]">{getWeatherEmoji(prob, day.tMax)}</span>
                  {prob > 20 && <span className="text-xs text-sky-500">{prob}%</span>}
                </div>
                <span className="text-base text-[#1A1A1A]">{day.tMax?.toFixed(0)}° <span className="text-[#BDBDBD]">/</span> {day.tMin?.toFixed(0)}°</span>
              </div>
            );
          })}
        </div>

        {/* Rain Probability Bar Chart */}
        <h3 className="text-[17px] font-bold text-[#1A1A1A] mt-6 mb-3">{t(lang, 'rainProbabilityChart')}</h3>
        <div className="h-40 bg-white rounded-2xl shadow-card p-4 flex items-end justify-around">
          {daily.map((day, i) => {
            const prob = day.probMax || 0;
            const barHeight = (prob / 100) * 120;
            return (
              <div key={i} className="flex flex-col items-center gap-1" style={{ animation: `slideUp 600ms ease forwards`, animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}>
                <span className="text-[11px] font-bold" style={{ color: getBarColor(prob) }}>{prob}%</span>
                <div className="w-6 rounded-t" style={{ height: `${barHeight}px`, backgroundColor: getBarColor(prob), minHeight: '4px' }} />
                <span className="text-[11px] text-[#757575]">{getDayName(day.date, lang)}</span>
              </div>
            );
          })}
        </div>

        {/* Hourly Forecast */}
        <div className="mt-6 mb-4">
          <ForecastStrip hourlyData={weatherData?.raw?.hourly} label={t(lang, 'hourlyForecast')} />
        </div>
      </div>
    </div>
  );
}
