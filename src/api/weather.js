// src/api/weather.js — Enhanced weather API wrapper
import { fetchOpenMeteo } from './providers/openMeteo';

// Get weather emoji based on conditions
export function getWeatherEmoji(rainProb, temp) {
  if (rainProb > 80) return '⛈️';
  if (rainProb > 60) return '🌧️';
  if (rainProb > 40) return '🌦️';
  if (rainProb > 20) return '⛅';
  if (temp > 38) return '🔥';
  if (temp > 30) return '☀️';
  if (temp > 20) return '🌤️';
  return '🌥️';
}

// Get weather condition text in Hindi
export function getWeatherCondition(rainProb, temp, lang = 'hi') {
  const conditions = {
    hi: {
      storm: 'तूफानी बारिश',
      heavyRain: 'भारी बारिश',
      lightRain: 'हल्की बारिश',
      cloudy: 'बादल छाए',
      hot: 'बहुत गर्मी',
      sunny: 'धूप',
      pleasant: 'सुहावना',
      cool: 'ठंडा',
    },
    en: {
      storm: 'Thunderstorm',
      heavyRain: 'Heavy Rain',
      lightRain: 'Light Rain',
      cloudy: 'Cloudy',
      hot: 'Very Hot',
      sunny: 'Sunny',
      pleasant: 'Pleasant',
      cool: 'Cool',
    }
  };

  const c = conditions[lang] || conditions.hi;
  if (rainProb > 80) return c.storm;
  if (rainProb > 60) return c.heavyRain;
  if (rainProb > 40) return c.lightRain;
  if (rainProb > 20) return c.cloudy;
  if (temp > 38) return c.hot;
  if (temp > 30) return c.sunny;
  if (temp > 20) return c.pleasant;
  return c.cool;
}

// Reverse geocode lat/lng to city name
export async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=&latitude=${lat}&longitude=${lng}&count=1&language=en`
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.results?.[0]) {
      return {
        city: data.results[0].name,
        state: data.results[0].admin1,
        country: data.results[0].country,
      };
    }
  } catch {}
  return null;
}

// Get day name in selected language
export function getDayName(dateStr, lang = 'hi') {
  const date = new Date(dateStr);
  const days = {
    hi: ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'],
    en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    bn: ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র', 'শনি'],
    mr: ['रवि', 'सोम', 'मंगळ', 'बुध', 'गुरु', 'शुक्र', 'शनि'],
    pa: ['ਐਤ', 'ਸੋਮ', 'ਮੰਗਲ', 'ਬੁੱਧ', 'ਵੀਰ', 'ਸ਼ੁੱਕਰ', 'ਸ਼ਨੀ'],
  };
  return (days[lang] || days.hi)[date.getDay()];
}

export { fetchOpenMeteo };
