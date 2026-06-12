import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('https://api.open-meteo.com/*', () => {
    return HttpResponse.json({
      current: { temperature_2m: 34, relative_humidity_2m: 65, wind_speed_10m: 12, weather_code: 61 },
      hourly: {
        time: Array.from({ length: 24 }, (_, i) => `2026-06-12T${String(i).padStart(2,'0')}:00`),
        temperature_2m: Array(24).fill(30),
        precipitation_probability: Array(24).fill(15),
        weather_code: Array(24).fill(1),
      },
      daily: {
        time: ['2026-06-12','2026-06-13','2026-06-14','2026-06-15','2026-06-16','2026-06-17','2026-06-18'],
        temperature_2m_max: [35, 33, 30, 32, 36, 34, 31],
        temperature_2m_min: [24, 22, 21, 23, 25, 23, 22],
        precipitation_probability_max: [10, 70, 90, 45, 15, 20, 60],
        precipitation_sum: [0, 5, 12, 2, 0, 0, 8],
        weather_code: [0, 61, 80, 45, 0, 1, 61],
      }
    });
  }),

  http.post('/api/chat', () => {
    return HttpResponse.json({
      reply: 'आज पानी देना सही रहेगा। अगले 24 घंटे बारिश की संभावना कम है। 💧',
      tokens: 45
    });
  }),

  http.get('https://nominatim.openstreetmap.org/*', () => {
    return HttpResponse.json([{
      display_name: 'Meerut, Uttar Pradesh, India',
      address: { city: 'Meerut', state: 'Uttar Pradesh', country: 'India' }
    }]);
  }),
];
