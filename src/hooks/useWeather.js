// src/hooks/useWeather.js
import { useWeatherData } from '../context/WeatherContext';
import { getIrrigationDecision, getAlertLevel } from '../utils/irrigationLogic';
import { useApp } from '../context/AppContext';

export function useWeather() {
  const { weatherData, normalized, loading, lastUpdate, error, refresh } = useWeatherData();
  const { user } = useApp();

  const cropName = user.crops?.[0] || 'default';
  const irrigationDecision = normalized ? getIrrigationDecision(normalized, cropName) : null;
  const alertLevel = normalized ? getAlertLevel(normalized) : null;

  return {
    weatherData,
    normalized,
    loading,
    lastUpdate,
    error,
    refresh,
    irrigationDecision,
    alertLevel,
  };
}
