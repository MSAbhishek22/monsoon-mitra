// src/context/WeatherContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchOpenMeteo } from '../api/providers/openMeteo';
import { getCachedWeather, setCachedWeather } from '../api/cache';
import { useApp } from './AppContext';
import { useNotifications } from '../hooks/useNotifications';
import { storage } from '../utils/storage';

const WeatherContext = createContext(null);

export function WeatherProvider({ children }) {
  const { user, isOnline, addAlert, dismissAlert } = useApp();
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(null);

  const fetchWeather = useCallback(async () => {
    const { lat, lng } = user.location || {};
    if (!lat || !lng) return;

    // Try cache first
    const cached = getCachedWeather(lat, lng || user.location.lon, 30);
    if (cached) {
      setWeatherData(cached);
      setLastUpdate(new Date());
    }

    if (!isOnline) return;

    try {
      setLoading(true);
      setError(null);
      const data = await fetchOpenMeteo({ lat, lon: lng });
      setWeatherData(data);
      setLastUpdate(new Date());
      setCachedWeather(lat, lng, data);
    } catch (e) {
      setError(e.message);
      if (!cached) setWeatherData(null);
    } finally {
      setLoading(false);
    }
  }, [user.location, isOnline]);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  // Auto-refresh every 30 minutes
  useEffect(() => {
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchWeather]);

  // Normalized weather data for components
  const normalized = weatherData ? {
    temperatureCelsius: weatherData.current?.tempC ?? null,
    humidityPercent: weatherData.current?.humidity ?? null,
    rainProbabilityNext24h: weatherData.next24h?.maxProb ?? 0,
    expectedRainfallMm: weatherData.next24h?.totalRainMm ?? 0,
    windSpeedKmh: weatherData.raw?.hourly?.wind_speed_10m?.[0] ?? null,
    uvIndex: weatherData.raw?.hourly?.uv_index?.[0] ?? null,
    daily: weatherData.daily || [],
    hourly: weatherData.raw?.hourly || {},
  } : null;

  const { sendLocalWeatherAlert, permission } = useNotifications();

  useEffect(() => {
    if (!normalized) return;

    const today = new Date().toDateString();
    const rainProb = normalized.rainProbabilityNext24h ?? 0;
    const temp = normalized.temperatureCelsius ?? 30;

    if (rainProb > 80) {
      addAlert({ type: 'flood', message: `${rainProb}% बारिश की संभावना — फसल सुरक्षित करें`, severity: 'high' });
      const lastFlood = storage.get('last_flood_alert_date');
      if (permission === 'granted' && sendLocalWeatherAlert && lastFlood !== today) {
        sendLocalWeatherAlert('flood', `${rainProb}% बारिश की संभावना। फसल और सामान सुरक्षित करें।`);
        storage.set('last_flood_alert_date', today);
      }
    } else {
      dismissAlert('flood');
    }

    if (temp > 40 && rainProb < 10) {
      addAlert({ type: 'drought', message: 'तापमान बहुत अधिक — अभी सिंचाई करें', severity: 'medium' });
      const lastDrought = storage.get('last_drought_alert_date');
      if (permission === 'granted' && sendLocalWeatherAlert && lastDrought !== today) {
        sendLocalWeatherAlert('drought');
        storage.set('last_drought_alert_date', today);
      }
    } else {
      dismissAlert('drought');
    }
  }, [normalized, permission, sendLocalWeatherAlert, addAlert, dismissAlert]);

  const value = {
    weatherData,
    normalized,
    loading,
    lastUpdate,
    error,
    refresh: fetchWeather,
  };

  return <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>;
}

export function useWeatherData() {
  const ctx = useContext(WeatherContext);
  if (!ctx) throw new Error('useWeatherData must be used within WeatherProvider');
  return ctx;
}
