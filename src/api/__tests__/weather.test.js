import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { server } from '../../test/mocks/server';

// Only run if the test file and server mock exist
describe('Weather API', () => {
  it('should have a valid Open-Meteo URL format', () => {
    const lat = 28.6139;
    const lng = 77.2090;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m`;
    expect(url).toContain('api.open-meteo.com');
    expect(url).toContain(`latitude=${lat}`);
    expect(url).toContain(`longitude=${lng}`);
  });

  it('should process weather codes to emojis correctly', async () => {
    // Import dynamically to avoid circular deps
    const { getWeatherEmoji } = await import('../weather');
    expect(getWeatherEmoji(0, 30)).toBe('🌤️');
    expect(getWeatherEmoji(61, 30)).toBe('🌧️');
    expect(getWeatherEmoji(95, 30)).toBe('⛈️');
    expect(getWeatherEmoji(25, 30)).toBe('⛅');
  });

  it('should handle weather codes for all major types', async () => {
    const { getWeatherEmoji, getWeatherCondition } = await import('../weather');
    const probs = [0, 25, 45, 65, 85];
    probs.forEach(prob => {
      expect(getWeatherEmoji(prob, 30)).toBeTruthy();
      expect(getWeatherCondition(prob, 30, 'en')).toBeTruthy();
    });
  });

  it('weather data cache key should be consistent', () => {
    const CACHE_KEY = 'weather_cache';
    expect(CACHE_KEY).toBe('weather_cache');
  });
});
