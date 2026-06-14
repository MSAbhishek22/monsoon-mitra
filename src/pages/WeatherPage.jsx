import { useState, useEffect } from 'react';
import { useWeather, getWeatherEmoji } from '../hooks/useWeather';
import { useApp } from '../context/AppContext';
import { getIrrigationDecision } from '../utils/irrigationLogic';
import { trackEvent, EVENTS } from '../firebase/analytics';

function Skeleton({ width = '100%', height = '20px', radius = '8px', style = {} }) {
  return (
    <div className="skeleton" style={{ width, height, borderRadius: radius, background: '#e0e0e0', ...style }} />
  );
}

export default function WeatherPage() {
  const { user, setActiveTab } = useApp();
  const { weatherData, loading, error, lastUpdated, refetch } = useWeather();
  const [barsVisible, setBarsVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    trackEvent(EVENTS.WEATHER_PAGE_VIEWED);
    const t = setTimeout(() => setBarsVisible(true), 500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (weatherData) setBarsVisible(true);
  }, [weatherData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setBarsVisible(false);
    await refetch();
    setRefreshing(false);
    setTimeout(() => setBarsVisible(true), 300);
  };

  const irrigationDecision = weatherData
    ? getIrrigationDecision(weatherData, user.crops?.[0] || 'गेहूं')
    : null;

  const loc = weatherData?.location || {};
  const city = loc.city || user.location?.city || 'आपका क्षेत्र';
  const state = loc.state || user.location?.state || '';

  const lastUpdatedStr = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    : '';

  const DAY_NAMES_HI = ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'];

  return (
    <div style={{ background: '#F0F7F0', minHeight: '100%' }}>

      {/* HERO — Current Weather */}
      <div style={{
        background: 'linear-gradient(160deg, #0D47A1 0%, #0277BD 40%, #01579B 100%)',
        padding: '20px 20px 40px',
        borderRadius: '0 0 32px 32px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute', top: '-30px', right: '-30px',
          width: '150px', height: '150px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)'
        }} />
        <div style={{
          position: 'absolute', bottom: '-20px', left: '-20px',
          width: '100px', height: '100px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)'
        }} />

        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.85)', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
              📍 {city}{state ? `, ${state}` : ''}
            </p>
            {lastUpdatedStr && (
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)', margin: '3px 0 0' }}>
                अंतिम अपडेट: {lastUpdatedStr}
              </p>
            )}
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '20px', padding: '8px 14px', color: '#FFFFFF',
              fontSize: '13px', cursor: 'pointer', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '6px',
              transition: 'all 200ms ease',
              opacity: refreshing ? 0.7 : 1,
            }}
          >
            <span style={{ display: 'inline-block', animation: refreshing ? 'spin 1s linear infinite' : 'none' }}>🔄</span>
            {refreshing ? 'लोड हो रहा है...' : 'ताज़ा करें'}
          </button>
        </div>

        {/* Error banner */}
        {error && error !== 'cached' && (
          <div style={{
            background: 'rgba(255,243,224,0.15)', border: '1px solid rgba(255,183,77,0.4)',
            borderRadius: '10px', padding: '10px 14px', marginBottom: '16px'
          }}>
            <p style={{ fontSize: '13px', color: '#FFE082', margin: 0 }}>
              📴 ऑफलाइन — पुराना डेटा दिखाया जा रहा है
            </p>
          </div>
        )}

        {/* Main temperature */}
        {loading ? (
          <div>
            <Skeleton width="140px" height="72px" radius="12px" style={{ background: 'rgba(255,255,255,0.2)', marginBottom: '16px' }} />
            <Skeleton width="200px" height="20px" radius="8px" style={{ background: 'rgba(255,255,255,0.15)' }} />
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                <span style={{ fontSize: '72px', fontWeight: 900, color: '#FFFFFF', lineHeight: 1, letterSpacing: '-3px' }}>
                  {weatherData?.current?.temperature ?? '--'}
                </span>
                <span style={{ fontSize: '28px', fontWeight: 400, color: 'rgba(255,255,255,0.8)', marginTop: '8px' }}>°C</span>
              </div>
              <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.9)', margin: '4px 0 0', fontWeight: 500 }}>
                {weatherData?.current?.description}
              </p>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', margin: '4px 0 0' }}>
                महसूस होता है {weatherData?.current?.feelsLike ?? '--'}°C
              </p>
            </div>
            <span style={{ fontSize: '72px', lineHeight: 1, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>
              {weatherData?.current?.emoji}
            </span>
          </div>
        )}

        {/* Stats row */}
        <div style={{
          display: 'flex', justifyContent: 'space-around',
          marginTop: '20px', paddingTop: '16px',
          borderTop: '1px solid rgba(255,255,255,0.2)'
        }}>
          {[
            { icon: '💧', label: 'नमी', value: loading ? '--' : `${weatherData?.current?.humidity ?? '--'}%` },
            { icon: '💨', label: 'हवा', value: loading ? '--' : `${weatherData?.current?.windSpeed ?? '--'} km/h` },
            { icon: '🌡️', label: 'दबाव', value: loading ? '--' : `${weatherData?.current?.pressure ?? '--'} hPa` },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', margin: '0 0 4px' }}>{stat.icon} {stat.label}</p>
              <p style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* IRRIGATION DECISION CARD — overlaps hero */}
      <div style={{ margin: '-20px 16px 0', position: 'relative', zIndex: 10 }}>
        {loading ? (
          <Skeleton height="80px" radius="16px" style={{ background: '#FFFFFF', boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }} />
        ) : irrigationDecision && (
          <div style={{
            background: '#FFFFFF', borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
            padding: '16px 20px',
            borderLeft: `5px solid ${irrigationDecision.color}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '28px' }}>{irrigationDecision.icon}</span>
                <div>
                  <p style={{ fontSize: '17px', fontWeight: 800, color: irrigationDecision.color, margin: 0 }}>
                    {irrigationDecision.decision === 'skip' ? 'पानी मत दें' : 'आज पानी दें'}
                  </p>
                  <p style={{ fontSize: '13px', color: '#5A7A5A', margin: '2px 0 0' }}>
                    {irrigationDecision.reason}
                  </p>
                </div>
              </div>
              <div style={{
                background: irrigationDecision.decision === 'skip' ? '#E3F2FD' : '#E8F5E9',
                borderRadius: '12px', padding: '8px 12px', textAlign: 'center'
              }}>
                <p style={{ fontSize: '22px', fontWeight: 900, color: irrigationDecision.color, margin: 0 }}>
                  {weatherData?.rainProbabilityNext24h ?? 0}%
                </p>
                <p style={{ fontSize: '10px', color: '#5A7A5A', margin: 0 }}>बारिश</p>
              </div>
            </div>
            <button onClick={() => setActiveTab('savings')} style={{
              width: '100%', marginTop: '12px', height: '44px',
              background: 'linear-gradient(135deg, #1B5E20, #2E7D32)',
              color: '#FFFFFF', border: 'none', borderRadius: '10px',
              fontSize: '14px', fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(27,94,32,0.3)'
            }}>
              💰 इस निर्णय को लॉग करें और बचत देखें →
            </button>
          </div>
        )}
      </div>

      {/* 7-DAY FORECAST */}
      <div style={{ padding: '24px 16px 0' }}>
        <p style={{ fontSize: '17px', fontWeight: 800, color: '#0D1B0D', marginBottom: '12px' }}>
          📅 7 दिन का पूर्वानुमान
        </p>
        {loading ? (
          Array(7).fill(0).map((_, i) => (
            <Skeleton key={i} height="60px" radius="12px" style={{ marginBottom: '8px' }} />
          ))
        ) : (
          (weatherData?.daily?.dates || []).map((date, idx) => {
            const d = new Date(date + 'T00:00:00');
            const dayName = idx === 0 ? 'आज' : idx === 1 ? 'कल' : DAY_NAMES_HI[d.getDay()];
            const rain = weatherData.daily.rainProbabilities[idx] ?? 0;
            const max = weatherData.daily.maxTemps[idx] ?? '--';
            const min = weatherData.daily.minTemps[idx] ?? '--';
            const emoji = getWeatherEmoji(weatherData.daily.weatherCodes[idx] ?? 0);

            const borderColor = rain > 80 ? '#C62828' : rain > 60 ? '#0277BD' : rain > 30 ? '#FF8F00' : 'transparent';

            return (
              <div key={date} style={{
                background: '#FFFFFF', borderRadius: '12px',
                padding: '0 16px', height: '60px', marginBottom: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                borderLeft: `4px solid ${borderColor}`,
                transition: 'transform 150ms ease',
              }}>
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#0D1B0D', width: '52px' }}>
                  {dayName}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '26px' }}>{emoji}</span>
                  {rain > 15 && (
                    <span style={{
                      fontSize: '12px', fontWeight: 700,
                      color: rain > 60 ? '#C62828' : rain > 30 ? '#0277BD' : '#FF8F00',
                      background: rain > 60 ? '#FFEBEE' : rain > 30 ? '#E1F5FE' : '#FFF8E1',
                      padding: '2px 8px', borderRadius: '10px'
                    }}>
                      {rain}%
                    </span>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: '#0D1B0D' }}>{max}°</span>
                  <span style={{ fontSize: '13px', color: '#9E9E9E', margin: '0 4px' }}>/</span>
                  <span style={{ fontSize: '15px', color: '#5A7A5A' }}>{min}°</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* RAIN PROBABILITY CHART */}
      <div style={{ padding: '20px 16px' }}>
        <p style={{ fontSize: '17px', fontWeight: 800, color: '#0D1B0D', marginBottom: '16px' }}>
          🌧️ बारिश की संभावना (7 दिन)
        </p>
        <div style={{
          background: '#FFFFFF', borderRadius: '16px', padding: '20px 12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #E8F5E9'
        }}>
          <div style={{ height: '140px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', gap: '4px' }}>
            {loading
              ? Array(7).fill(0).map((_, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Skeleton width="100%" height="60px" radius="4px 4px 0 0" style={{ marginBottom: '4px' }} />
                    <Skeleton width="24px" height="10px" radius="4px" />
                  </div>
                ))
              : (weatherData?.daily?.rainProbabilities || Array(7).fill(0)).map((prob, idx) => {
                  const date = weatherData?.daily?.dates?.[idx];
                  const d = date ? new Date(date + 'T00:00:00') : null;
                  const dayLabel = idx === 0 ? 'आज' : idx === 1 ? 'कल' : d ? DAY_NAMES_HI[d.getDay()] : `D${idx + 1}`;
                  const barH = Math.max((prob / 100) * 110, 4);
                  const color = prob <= 20 ? '#81C784' : prob <= 50 ? '#FFB300' : prob <= 75 ? '#FB8C00' : '#E53935';
                  return (
                    <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color, marginBottom: '4px' }}>{prob}%</span>
                      <div style={{
                        width: '100%', background: color, borderRadius: '6px 6px 2px 2px',
                        height: barsVisible ? `${barH}px` : '4px',
                        transition: `height 700ms cubic-bezier(0.34,1.56,0.64,1) ${idx * 70}ms`,
                        boxShadow: `0 2px 8px ${color}40`,
                      }} />
                      <span style={{ fontSize: '10px', color: '#9E9E9E', marginTop: '6px' }}>{dayLabel}</span>
                    </div>
                  );
                })
            }
          </div>
        </div>
      </div>

      {/* HOURLY FORECAST */}
      <div style={{ padding: '0 16px 20px' }}>
        <p style={{ fontSize: '17px', fontWeight: 800, color: '#0D1B0D', marginBottom: '12px' }}>
          🕐 आज का घंटेवार मौसम
        </p>
        <div style={{ display: 'flex', overflowX: 'auto', gap: '10px', paddingBottom: '8px' }} className="hide-scrollbar">
          {loading
            ? Array(8).fill(0).map((_, i) => (
                <div key={i} className="skeleton" style={{ minWidth: '68px', height: '96px', borderRadius: '12px', flexShrink: 0, background: '#e0e0e0' }} />
              ))
            : (weatherData?.hourly?.times || [])
                .filter((_, i) => i % 3 === 0)
                .slice(0, 8)
                .map((time, idx) => {
                  const actualIdx = idx * 3;
                  const temp = weatherData.hourly.temperatures[actualIdx];
                  const rain = weatherData.hourly.rainProbabilities[actualIdx];
                  const code = weatherData.hourly.weatherCodes[actualIdx];
                  const timeStr = new Date(time).toLocaleTimeString('hi-IN', {
                    hour: '2-digit', minute: '2-digit', hour12: true
                  });
                  const isNow = actualIdx === 0;
                  return (
                    <div key={time} style={{
                      minWidth: '72px', height: '96px', background: isNow ? 'linear-gradient(135deg, #E8F5E9, #C8E6C9)' : '#FFFFFF',
                      borderRadius: '14px', padding: '10px 6px', textAlign: 'center', flexShrink: 0,
                      boxShadow: isNow ? '0 4px 12px rgba(46,125,50,0.2)' : '0 2px 8px rgba(0,0,0,0.06)',
                      border: isNow ? '2px solid #4CAF50' : '1px solid #E8F5E9',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between'
                    }}>
                      <span style={{ fontSize: '11px', color: isNow ? '#1B5E20' : '#9E9E9E', fontWeight: isNow ? 700 : 400 }}>
                        {isNow ? 'अभी' : timeStr}
                      </span>
                      <span style={{ fontSize: '24px' }}>{getWeatherEmoji(code ?? 0)}</span>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: '#0D1B0D' }}>{temp ?? '--'}°</span>
                      {rain > 15 && (
                        <span style={{ fontSize: '11px', color: '#0277BD', fontWeight: 600 }}>{rain}%</span>
                      )}
                    </div>
                  );
                })
          }
        </div>
      </div>
    </div>
  );
}
