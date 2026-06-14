// src/pages/WeatherPage.jsx — Full 5-section weather page
import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useWeather } from '../hooks/useWeather';
import { t } from '../i18n/index';
import { getDayName, getWeatherEmoji } from '../api/weather';
import ForecastStrip from '../components/weather/ForecastStrip';
import { WeatherSkeleton, ForecastSkeleton } from '../components/common/SkeletonCard';
import { trackEvent, EVENTS } from '../firebase/analytics';

function getBarColor(pct) {
  if (pct > 80) return '#C62828';
  if (pct > 60) return '#FB8C00';
  if (pct > 30) return '#FFB300';
  return '#A5D6A7';
}

export default function WeatherPage() {
  const { user, setActiveTab } = useApp();
  const { normalized, irrigationDecision, loading, weatherData, refresh, lastUpdate } = useWeather();
  const lang = user.language || 'hi';
  const daily = weatherData?.daily || [];
  const [barsVisible, setBarsVisible] = useState(false);

  useEffect(() => {
    trackEvent(EVENTS.WEATHER_PAGE_VIEWED || 'weather_page_viewed');
    const t = setTimeout(() => setBarsVisible(true), 400);
    return () => clearTimeout(t);
  }, []);

  if (loading && !normalized) return (
    <div className="bg-[#F1F8E9] min-h-screen pb-20 p-4 space-y-4">
      <WeatherSkeleton />
      <ForecastSkeleton />
    </div>
  );

  const temp = normalized?.temperatureCelsius;
  const humidity = normalized?.humidityPercent;
  const windSpeed = normalized?.windSpeedKmh;
  const rainProb = normalized?.rainProbabilityNext24h ?? 0;
  const emoji = getWeatherEmoji(rainProb, temp);
  const city = user.location?.city || 'Delhi';
  const state = user.location?.state || '';

  return (
    <div className="bg-[#F1F8E9] min-h-screen pb-20 scroll-container" style={{ paddingBottom: 'max(80px, calc(64px + env(safe-area-inset-bottom)))' }}>
      {/* SECTION 1 — Weather Hero */}
      <div style={{
        background: 'linear-gradient(180deg, #0277BD 0%, #01579B 100%)',
        borderRadius: '0 0 32px 32px',
        padding: '24px 20px 32px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.85)', margin: 0 }}>
            📍 {city}{state ? `, ${state}` : ''}
          </p>
          <button onClick={refresh} disabled={loading} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '16px', padding: '4px 12px', color: '#fff', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className={loading ? 'animate-spin' : ''} style={{ display: 'inline-block' }}>🔄</span> {lang === 'hi' ? 'रिफ्रेश' : 'Refresh'}
          </button>
        </div>
        {lastUpdate && <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', margin: '0 0 12px 0' }}>{lang === 'hi' ? 'अंतिम अपडेट:' : 'Last updated:'} {lastUpdate.toLocaleTimeString(lang === 'hi' ? 'hi-IN' : 'en-IN', { hour: '2-digit', minute: '2-digit' })}</p>}
        {loading && !normalized ? (
          <div className="skeleton" style={{ height: '72px', width: '120px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px' }} />
        ) : (
          <>
            <p style={{ fontSize: '72px', fontWeight: 900, color: '#FFFFFF', lineHeight: 1, margin: 0 }}>
              {temp != null ? `${Math.round(temp)}°C` : '--°C'}
            </p>
            <p style={{ fontSize: '56px', margin: '8px 0', lineHeight: 1 }}>{emoji}</p>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
              {[
                { label: '💧 नमी', value: humidity != null ? `${humidity}%` : '--' },
                { label: '💨 हवा', value: windSpeed != null ? `${Math.round(windSpeed)} km/h` : '--' },
                { label: '🌧️ बारिश', value: `${rainProb}%` },
              ].map(item => (
                <div key={item.label} style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>{item.label}</p>
                  <p style={{ fontSize: '17px', fontWeight: 700, color: '#FFFFFF', margin: '4px 0 0' }}>{item.value}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* SECTION 2 — Irrigation Decision Card (overlapping hero) */}
      {irrigationDecision && (
        <div style={{
          margin: '-16px 16px 0',
          background: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          padding: '20px',
          position: 'relative',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '28px' }}>{irrigationDecision.icon}</span>
              <span style={{ fontSize: '17px', fontWeight: 700, color: irrigationDecision.color }}>
                {irrigationDecision.decision === 'skip' ? 'बारिश आ रही है 🌧️' : 'आज पानी दें 💧'}
              </span>
            </div>
            <span style={{
              background: irrigationDecision.decision === 'skip' ? '#E3F2FD' : '#E8F5E9',
              color: irrigationDecision.color,
              borderRadius: '20px',
              padding: '6px 14px',
              fontSize: '13px',
              fontWeight: 600
            }}>
              {rainProb}%
            </span>
          </div>
          <p style={{ fontSize: '14px', color: '#4A4A4A', marginTop: '8px' }}>
            {irrigationDecision.reason}
          </p>
          <button onClick={() => setActiveTab('savings')} style={{ width: '100%', marginTop: '16px', padding: '12px', background: irrigationDecision.decision === 'skip' ? '#0288D1' : '#2E7D32', color: '#fff', borderRadius: '12px', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
            <span>📝</span> {lang === 'hi' ? 'सिंचाई निर्णय दर्ज करें' : 'Log Irrigation Decision'}
          </button>
        </div>
      )}

      <div className="px-4" style={{ marginTop: irrigationDecision ? '20px' : '8px' }}>
        {/* SECTION 3 — 7-Day Forecast */}
        <h3 className="text-[17px] font-bold text-[#1A1A1A] mb-3">{t(lang, 'sevenDayForecast')}</h3>
        <div className="space-y-2">
          {daily.map((day, i) => {
            const prob = day.probMax || 0;
            const hasHighRain = prob > 60;
            const hasCriticalRain = prob > 80;
            return (
              <div
                key={i}
                className="h-16 bg-white rounded-xl shadow-card px-4 flex items-center justify-between"
                style={hasHighRain ? { borderLeft: `4px solid ${hasCriticalRain ? '#C62828' : '#0277BD'}` } : {}}
              >
                <span className="text-base font-semibold text-[#1A1A1A] w-12">
                  {i === 0 ? 'आज' : getDayName(day.date, lang)}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[32px]">{getWeatherEmoji(prob, day.tMax)}</span>
                  {prob > 20 && <span className="text-xs text-sky-500 font-semibold">{prob}%</span>}
                </div>
                <span className="text-base text-[#1A1A1A]">
                  {day.tMax?.toFixed(0)}° <span className="text-[#BDBDBD]">/</span> {day.tMin?.toFixed(0)}°
                </span>
              </div>
            );
          })}
        </div>

        {/* SECTION 4 — Rain Probability Bar Chart (animated) */}
        <h3 className="text-[17px] font-bold text-[#1A1A1A] mt-6 mb-3">{t(lang, 'rainProbabilityChart')}</h3>
        <div className="bg-white rounded-2xl shadow-card p-4" style={{ height: '180px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '140px' }}>
            {daily.map((day, i) => {
              const prob = day.probMax || 0;
              const barHeight = (prob / 100) * 120;
              const color = getBarColor(prob);
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '13%' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color, marginBottom: '4px' }}>{prob}%</span>
                  <div style={{
                    width: '100%',
                    background: color,
                    borderRadius: '4px 4px 0 0',
                    height: barsVisible ? `${barHeight}px` : '0px',
                    transition: `height 600ms cubic-bezier(0.4,0,0.2,1) ${i * 80}ms`,
                    minHeight: '2px'
                  }} />
                  <span style={{ fontSize: '11px', color: '#757575', marginTop: '4px' }}>
                    {i === 0 ? 'आज' : getDayName(day.date, lang)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 5 — Hourly Forecast */}
        <div className="mt-6 mb-4">
          <ForecastStrip hourlyData={weatherData?.raw?.hourly} label={t(lang, 'hourlyForecast')} />
        </div>
      </div>
    </div>
  );
}
