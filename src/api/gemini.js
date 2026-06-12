// src/api/gemini.js — Frontend API client for Vercel serverless proxy
// Does NOT contain any API key — calls /api/chat serverless function

export async function sendMessage({ message, language, crop, weatherContext, conversationHistory }) {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: message.slice(0, 1000),
        language: language || 'hi',
        crop: crop || [],
        weatherContext: weatherContext || '',
        conversationHistory: (conversationHistory || []).slice(-10),
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      if (errData.fallback) {
        return { reply: null, fallback: true };
      }
      throw new Error(errData.error || 'AI service error');
    }

    const data = await res.json();
    return { reply: data.reply, tokens: data.tokens, fallback: false };
  } catch (error) {
    if (import.meta.env.DEV) console.warn('Gemini API error:', error);
    return { reply: null, fallback: true, error: error.message };
  }
}

// Build weather context string for the AI prompt
export function buildWeatherContext(normalized) {
  if (!normalized) return 'Weather data not available';
  const { temperatureCelsius, humidityPercent, rainProbabilityNext24h, expectedRainfallMm, windSpeedKmh } = normalized;
  return [
    `Temperature: ${temperatureCelsius?.toFixed(1) ?? 'N/A'}°C`,
    `Humidity: ${humidityPercent?.toFixed(0) ?? 'N/A'}%`,
    `Rain probability (24h): ${rainProbabilityNext24h ?? 'N/A'}%`,
    `Expected rainfall: ${expectedRainfallMm?.toFixed(1) ?? 'N/A'}mm`,
    windSpeedKmh ? `Wind: ${windSpeedKmh.toFixed(1)} km/h` : '',
  ].filter(Boolean).join(', ');
}
