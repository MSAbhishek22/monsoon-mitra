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
    const loc = storage.get('user_location');
    const lat = loc?.lat ?? 28.6139;
    const lng = loc?.lng ?? 77.2090;

    // Check cache
    if (!forceRefresh) {
      const cached = storage.get('weather_cache');
      const cacheTime = storage.get('weather_cache_time');
      if (cached && cacheTime && Date.now() - cacheTime < CACHE_TTL) {
        setWeatherData(cached);
        setLastUpdated(cacheTime);
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    setError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const url = [
        'https://api.open-meteo.com/v1/forecast',
        `?latitude=${lat}&longitude=${lng}`,
        '&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,precipitation,apparent_temperature,surface_pressure',
        '&hourly=temperature_2m,precipitation_probability,weather_code,wind_speed_10m',
        '&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,weather_code,sunrise,sunset',
        '&timezone=Asia%2FKolkata',
        '&forecast_days=7',
        '&wind_speed_unit=kmh',
      ].join('');

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`Weather API: ${res.status}`);
      const raw = await res.json();
      const processed = processWeatherData(raw, lat, lng);

      setWeatherData(processed);
      setLastUpdated(Date.now());
      storage.set('weather_cache', processed);
      storage.set('weather_cache_time', Date.now());

      trackEvent(EVENTS.WEATHER_LOADED, {
        city: loc?.city || 'unknown',
        rain_alert: processed.rainProbabilityNext24h > 80,
        temp: processed.current.temperature,
      });

    } catch (err) {
      clearTimeout(timeoutId);
      // Always fall back to cache, even stale
      const stale = storage.get('weather_cache');
      if (stale) {
        setWeatherData(stale);
        setError('cached'); // Signal that data is stale but usable
      } else {
        // Last resort: dummy data so UI doesn't break
        setWeatherData(getDummyWeather());
        setError('offline');
      }
      trackEvent(EVENTS.WEATHER_LOAD_FAILED, { reason: err.message });
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

function processWeatherData(raw, lat, lng) {
  const c = raw.current ?? {};
  const d = raw.daily ?? {};
  const h = raw.hourly ?? {};

  const temp = c.temperature_2m ?? c.temperature ?? 30;
  const humidity = c.relative_humidity_2m ?? c.relativehumidity_2m ?? 60;
  const wind = c.wind_speed_10m ?? c.windspeed_10m ?? c.wind_speed ?? 0;
  const code = c.weather_code ?? c.weathercode ?? 0;
  const rainProb = d.precipitation_probability_max?.[0] ?? 0;
  const rainfall = d.precipitation_sum?.[0] ?? 0;

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
    expectedRainfallMm: rainfall,
    temperatureCelsius: temp,
    humidityPercent: humidity,
    windSpeedKmh: wind,
    isFloodRisk: rainProb > 80,
    isDroughtRisk: temp > 40 && rainProb < 10,
    daily: {
      dates: d.time ?? [],
      maxTemps: (d.temperature_2m_max ?? []).map(v => Math.round(v)),
      minTemps: (d.temperature_2m_min ?? []).map(v => Math.round(v)),
      rainProbabilities: d.precipitation_probability_max ?? [],
      rainfallMm: d.precipitation_sum ?? [],
      weatherCodes: d.weather_code ?? d.weathercode ?? [],
      sunrises: d.sunrise ?? [],
      sunsets: d.sunset ?? [],
    },
    hourly: {
      times: (h.time ?? []).slice(0, 24),
      temperatures: (h.temperature_2m ?? []).slice(0, 24).map(v => Math.round(v)),
      rainProbabilities: (h.precipitation_probability ?? []).slice(0, 24),
      weatherCodes: (h.weather_code ?? h.weathercode ?? []).slice(0, 24),
      windSpeeds: (h.wind_speed_10m ?? h.windspeed_10m ?? []).slice(0, 24),
    },
    location: {
      lat,
      lng,
      city: storage.get('user_location')?.city || 'आपका क्षेत्र',
      state: storage.get('user_location')?.state || '',
    }
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
