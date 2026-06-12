// src/pages/HomePage.jsx — Section 8 complete spec
import React from 'react';
import { useApp } from '../context/AppContext';
import { useWeather } from '../hooks/useWeather';
import { t } from '../i18n/index';
import { getWeatherEmoji, getWeatherCondition } from '../api/weather';
import FarmerHook from '../components/FarmerHook';
import SavingsTracker from '../components/SavingsTracker';
import ForecastStrip from '../components/weather/ForecastStrip';
import { WeatherCardSkeleton, ForecastStripSkeleton } from '../components/common/LoadingSpinner';

function getGreeting(lang) {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return { text: t(lang, 'goodMorning'), emoji: '🌅' };
  if (h >= 12 && h < 17) return { text: t(lang, 'goodAfternoon'), emoji: '☀️' };
  if (h >= 17 && h < 20) return { text: t(lang, 'goodEvening'), emoji: '🌇' };
  return { text: t(lang, 'goodNight'), emoji: '🌙' };
}

export default function HomePage() {
  const { user, setActiveTab } = useApp();
  const { normalized, irrigationDecision, loading, weatherData } = useWeather();
  const lang = user.language || 'hi';
  const greeting = getGreeting(lang);

  const temp = normalized?.temperatureCelsius;
  const rainProb = normalized?.rainProbabilityNext24h || 0;
  const weatherEmoji = getWeatherEmoji(rainProb, temp);
  const condition = getWeatherCondition(rainProb, temp, lang);

  return (
    <div className="min-h-screen bg-[#F1F8E9] pb-20 px-4 pt-4">
      {/* Top Header */}
      <div className="flex items-center justify-between h-14">
        <span className="text-lg font-bold text-primary-900">🌾 Monsoon Mitra</span>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 bg-white rounded-full shadow-card flex items-center justify-center tap-feedback">
            <span className="text-lg">🔔</span>
          </button>
          {user.name && (
            <div className="w-8 h-8 rounded-full bg-primary-800 flex items-center justify-center">
              <span className="text-sm font-bold text-white">{user.name.charAt(0).toUpperCase()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Greeting Card */}
      <div
        className="mt-4 rounded-[20px] p-5 animate-slide-down"
        style={{ background: 'linear-gradient(135deg, #2E7D32 0%, #388E3C 50%, #1B5E20 100%)', boxShadow: '0 8px 24px rgba(46,125,50,0.3)' }}
      >
        <p className="text-[22px] font-bold text-white">{greeting.text} {greeting.emoji}</p>
        {user.name && (
          <p className="text-[15px] text-white/90 mt-1.5">
            {user.name} जी, {irrigationDecision ? (irrigationDecision.decision === 'skip' ? 'आज पानी मत दें' : 'आज पानी दें') : ''}
          </p>
        )}
        <div className="flex items-center justify-between mt-4">
          <div>
            <span className="text-4xl font-extrabold text-white">{temp?.toFixed(0) ?? '--'}°C</span>
            <p className="text-sm text-white/85 mt-1">{condition}</p>
          </div>
          <span className="text-5xl">{weatherEmoji}</span>
        </div>
      </div>

      {/* Farmer Hook Card */}
      <div className="mt-4">
        {loading ? <WeatherCardSkeleton /> : <FarmerHook irrigationDecision={irrigationDecision} language={lang} />}
      </div>

      {/* Today's Forecast Strip */}
      <div className="mt-4">
        {loading ? <ForecastStripSkeleton /> : (
          <ForecastStrip hourlyData={weatherData?.raw?.hourly} label={t(lang, 'todayForecast')} />
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-5">
        <h3 className="text-base font-bold text-[#1A1A1A] mb-3">{t(lang, 'quickHelp')}</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: '🤖', label: t(lang, 'askAI'), sub: t(lang, 'askAISub'), tab: 'ai' },
            { icon: '📊', label: t(lang, 'sevenDayWeather'), sub: t(lang, 'sevenDayWeatherSub'), tab: 'weather' },
            { icon: '💰', label: t(lang, 'viewSavings'), sub: t(lang, 'viewSavingsSub'), tab: 'savings' },
            { icon: '⚙️', label: t(lang, 'settingsLabel'), sub: t(lang, 'settingsSub'), tab: 'settings' },
          ].map((action, i) => (
            <button key={i} onClick={() => setActiveTab(action.tab)} className="h-20 bg-white rounded-2xl shadow-card p-4 flex items-center gap-3 tap-feedback text-left">
              <span className="text-[32px]">{action.icon}</span>
              <div>
                <p className="text-sm font-semibold text-[#1A1A1A]">{action.label}</p>
                <p className="text-xs text-[#757575]">{action.sub}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Savings Snapshot */}
      <div className="mt-5">
        <SavingsTracker language={lang} onNavigate={setActiveTab} />
      </div>
    </div>
  );
}
