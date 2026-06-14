// src/pages/HomePage.jsx — Section 8 complete spec
import React from 'react';
import { useApp } from '../context/AppContext';
import { useWeather } from '../hooks/useWeather';
import { useNotifications } from '../hooks/useNotifications';
import { t } from '../i18n/index';
import { getWeatherEmoji, getWeatherCondition } from '../api/weather';
import FarmerHook from '../components/FarmerHook';
import SavingsTracker from '../components/SavingsTracker';
import ForecastStrip from '../components/weather/ForecastStrip';
import { WeatherCardSkeleton, ForecastStripSkeleton } from '../components/common/LoadingSpinner';

export default function HomePage() {
  const { user, setActiveTab } = useApp();
  const { normalized, irrigationDecision, loading, weatherData } = useWeather();
  const { permission, requestPermission } = useNotifications();
  const lang = user.language || 'hi';
  
  const userName = user.name || '';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'सुप्रभात' : hour < 17 ? 'नमस्ते' : hour < 20 ? 'शुभ संध्या' : 'शुभ रात्रि';
  const greetingEmoji = hour < 12 ? '🌅' : hour < 17 ? '☀️' : hour < 20 ? '🌇' : '🌙';

  const temp = normalized?.temperatureCelsius;
  const rainProb = normalized?.rainProbabilityNext24h || 0;
  const weatherEmoji = getWeatherEmoji(rainProb, temp);
  const condition = getWeatherCondition(rainProb, temp, lang);

  return (
    <div className="min-h-screen bg-[#F1F8E9] pb-20 px-4 pt-4 scroll-container" style={{ paddingBottom: 'max(80px, calc(64px + env(safe-area-inset-bottom)))' }}>
      {/* Top Header */}
      <div className="flex items-center justify-between h-14">
        <span className="text-lg font-bold text-primary-900">🌾 Monsoon Mitra</span>
        <div className="flex items-center gap-2">
          <button 
            onClick={async () => {
              if (permission !== 'granted') {
                const res = await requestPermission();
                if (res) alert('सूचनाएं चालू हो गईं!');
                else alert('सूचनाएं चालू नहीं हो सकीं। सेटिंग्स देखें।');
              } else {
                alert('सूचनाएं पहले से चालू हैं!');
              }
            }}
            className="w-10 h-10 bg-white rounded-full shadow-card flex items-center justify-center tap-feedback relative"
          >
            <span className="text-lg">🔔</span>
            {permission !== 'granted' && <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />}
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
        <p style={{ fontSize: '24px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
          {greeting}{userName ? `, ${userName} जी` : '!'} {greetingEmoji}
        </p>
        <p className="text-[15px] text-white/90 mt-1.5">
          {irrigationDecision ? (irrigationDecision.decision === 'skip' ? 'आज पानी मत दें' : 'आज पानी दें') : ''}
        </p>
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
            { icon: '🤖', emoji: true, title: 'AI से पूछें', sub: 'कोई भी सवाल पूछें', tab: 'ai', color: '#E8F5E9' },
            { icon: '📊', emoji: true, title: '7 दिन मौसम', sub: 'पूरे हफ्ते का हाल', tab: 'weather', color: '#E1F5FE' },
            { icon: '💰', emoji: true, title: 'बचत देखें', sub: 'आपकी कुल बचत', tab: 'savings', color: '#FFF8E1' },
            { icon: '⚙️', emoji: true, title: 'सेटिंग', sub: 'भाषा व फसल बदलें', tab: 'settings', color: '#F3E5F5' },
          ].map(action => (
            <button
              key={action.tab}
              onClick={() => setActiveTab(action.tab)}
              style={{
                height: '80px', background: action.color, borderRadius: '16px',
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.07)',
                padding: '0 16px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '12px',
                textAlign: 'left', width: '100%',
                transition: 'transform 150ms ease, box-shadow 150ms ease',
                WebkitTapHighlightColor: 'transparent'
              }}
              onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.97)'; e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)'; }}
              onTouchEnd={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.07)'; }}
            >
              <span style={{ fontSize: '28px' }}>{action.icon}</span>
              <div>
                <p style={{ fontSize: '15px', fontWeight: 700, color: '#0D1B0D', margin: 0 }}>{action.title}</p>
                <p style={{ fontSize: '12px', color: '#5A7A5A', margin: '2px 0 0' }}>{action.sub}</p>
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
