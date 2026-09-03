import { useState, useEffect, useCallback } from 'react';
import { storage } from '../utils/storage';
import { trackEvent, EVENTS } from '../firebase/analytics';

const CACHE_TTL = 2 * 60 * 60 * 1000; // 2 hours

export function useWeather() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchWeather = useCallback(async (forceRefresh = false) => {
    const locRaw = localStorage.getItem('user_location');
    const loc = locRaw ? JSON.parse(locRaw) : null;
    const lat = loc?.lat ?? 28.6139;
    const lng = loc?.lng ?? 77.2090;

    if (!forceRefresh) {
      try {
        const cachedRaw = localStorage.getItem('weather_cache');
        const cacheTimeRaw = localStorage.getItem('weather_cache_time');
        if (cachedRaw && cacheTimeRaw) {
          const age = Date.now() - parseInt(cacheTimeRaw, 10);
          if (age < 7200000) {
            const cached = JSON.parse(cachedRaw);
            if (cached?.current?.temperature != null) {
              setWeatherData(cached);
              setLastUpdated(parseInt(cacheTimeRaw, 10));
              setLoading(false);
              return;
            }
          }
        }
      } catch (_) {}
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        latitude: lat.toFixed(4),
        longitude: lng.toFixed(4),
        current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,precipitation,apparent_temperature,surface_pressure',
        hourly: 'temperature_2m,precipitation_probability,weather_code',
        daily: 'temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,weather_code',
        timezone: 'Asia/Kolkata',
        forecast_days: '7',
        wind_speed_unit: 'kmh',
      });

      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?${params}`,
        { signal: AbortSignal.timeout(12000) }
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const raw = await response.json();
      if (!raw.current) throw new Error('No data');

      const processed = processWeatherData(raw, lat, lng, loc);
      processed.raw = raw; // Preserve raw for ForecastStrip and other consumers
      setWeatherData(processed);
      setLastUpdated(Date.now());
      setError(null);
      localStorage.setItem('weather_cache', JSON.stringify(processed));
      localStorage.setItem('weather_cache_time', Date.now().toString());
    } catch (err) {
      try {
        const staleRaw = localStorage.getItem('weather_cache');
        if (staleRaw) {
          const stale = JSON.parse(staleRaw);
          if (stale?.current?.temperature != null) {
            setWeatherData(stale);
            setError('stale');
            setLoading(false);
            return;
          }
        }
      } catch (_) {}
      setWeatherData({
        current: { temperature: 32, feelsLike: 34, humidity: 65, windSpeed: 12, weatherCode: 1, description: 'आंशिक बादल', emoji: '⛅', precipitation: 0 },
        rainProbabilityNext24h: 20, expectedRainfallMm: 0, temperatureCelsius: 32,
        humidityPercent: 65, windSpeedKmh: 12, isFloodRisk: false, isDroughtRisk: false,
        daily: { dates: [], maxTemps: [], minTemps: [], rainProbabilities: [], rainfallMm: [], weatherCodes: [] },
        hourly: { times: [], temperatures: [], rainProbabilities: [], weatherCodes: [] },
        location: { lat, lng, city: loc?.city || 'आपका क्षेत्र', state: loc?.state || '' },
      });
      setError('offline');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchWeather(); }, [fetchWeather]);

  // Auto-refresh when app comes back online
  useEffect(() => {
    const handleOnline = () => fetchWeather(true);
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [fetchWeather]);

  return {
    weatherData,
    loading,
    error,
    lastUpdated,
    refetch: () => fetchWeather(true)
  };
}

function processWeatherData(raw, lat, lng, loc) {
  const c = raw.current || {};
  const d = raw.daily || {};
  const h = raw.hourly || {};

  const temp = c.temperature_2m ?? c.temperature ?? 30;
  const humidity = c.relative_humidity_2m ?? c.relativehumidity_2m ?? 60;
  const wind = c.wind_speed_10m ?? c.windspeed_10m ?? 0;
  const code = c.weather_code ?? c.weathercode ?? 0;
  const rainProb = (d.precipitation_probability_max ?? [])[0] ?? 0;

  return {
    current: {
      temperature: Math.round(temp),
      feelsLike: Math.round(c.apparent_temperature ?? temp - 2),
      humidity: Math.round(humidity),
      windSpeed: Math.round(wind),
      pressure: Math.round(c.surface_pressure ?? 1013),
      weatherCode: code,
      description: getWeatherDescription(code),
      emoji: getWeatherEmoji(code),
      precipitation: c.precipitation ?? 0,
    },
    rainProbabilityNext24h: rainProb,
    expectedRainfallMm: (d.precipitation_sum ?? [])[0] ?? 0,
    temperatureCelsius: temp,
    humidityPercent: humidity,
    windSpeedKmh: wind,
    isFloodRisk: rainProb > 80,
    isDroughtRisk: temp > 40 && rainProb < 10,
    daily: {
      dates: d.time ?? [],
      maxTemps: (d.temperature_2m_max ?? []).map(v => Math.round(v ?? 0)),
      minTemps: (d.temperature_2m_min ?? []).map(v => Math.round(v ?? 0)),
      rainProbabilities: d.precipitation_probability_max ?? [],
      rainfallMm: d.precipitation_sum ?? [],
      weatherCodes: d.weather_code ?? d.weathercode ?? [],
    },
    hourly: {
      times: (h.time ?? []).slice(0, 24),
      temperatures: (h.temperature_2m ?? []).slice(0, 24).map(v => Math.round(v ?? 0)),
      rainProbabilities: (h.precipitation_probability ?? []).slice(0, 24),
      weatherCodes: (h.weather_code ?? h.weathercode ?? []).slice(0, 24),
    },
    location: { lat, lng, city: loc?.city || 'आपका क्षेत्र', state: loc?.state || '' },
  };
}

function getDummyWeather() {
  return {
    current: { temperature: 32, feelsLike: 35, humidity: 65, windSpeed: 12, pressure: 1010, weatherCode: 1, description: 'आंशिक बादल', emoji: '⛅', precipitation: 0 },
    rainProbabilityNext24h: 20, expectedRainfallMm: 0, temperatureCelsius: 32, humidityPercent: 65, windSpeedKmh: 12,
    isFloodRisk: false, isDroughtRisk: false,
    daily: { dates: [], maxTemps: [], minTemps: [], rainProbabilities: [], rainfallMm: [], weatherCodes: [], sunrises: [], sunsets: [] },
    hourly: { times: [], temperatures: [], rainProbabilities: [], weatherCodes: [], windSpeeds: [] },
    location: { lat: 28.61, lng: 77.20, city: storage.get('user_location')?.city || 'Delhi', state: '' }
  };
}

export function getWeatherEmoji(code) {
  if (code === 0) return '☀️';
  if (code <= 2) return '⛅';
  if (code <= 3) return '☁️';
  if (code <= 48) return '🌫️';
  if (code <= 57) return '🌦️';
  if (code <= 65) return '🌧️';
  if (code <= 67) return '🌨️';
  if (code <= 77) return '❄️';
  if (code <= 82) return '🌦️';
  if (code <= 86) return '🌨️';
  if (code <= 99) return '⛈️';
  return '🌤️';
}

export function getWeatherDescription(code) {
  if (code === 0) return 'साफ आसमान';
  if (code <= 2) return 'आंशिक बादल';
  if (code <= 3) return 'बादल छाए हैं';
  if (code <= 48) return 'कोहरा';
  if (code <= 57) return 'हल्की बारिश';
  if (code <= 65) return 'बारिश';
  if (code <= 67) return 'ओस बारिश';
  if (code <= 77) return 'बर्फबारी';
  if (code <= 82) return 'बौछार';
  if (code <= 86) return 'भारी बौछार';
  if (code <= 99) return 'आंधी-तूफान';
  return 'अज्ञात';
}
