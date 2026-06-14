// src/api/providers/openMeteo.js
export async function fetchOpenMeteo({ lat, lon }) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    hourly: [
      "precipitation_probability",
      "precipitation",
      "rain",
      "relative_humidity_2m",
      "temperature_2m",
      "wind_speed_10m"
    ].join(","),
    daily: [
      "precipitation_probability_max",
      "precipitation_sum",
      "rain_sum",
      "temperature_2m_max",
      "temperature_2m_min"
    ].join(","),
    forecast_days: "7",
    timezone: "auto"
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Weather fetch failed");
  const data = await res.json();

  // Normalize for your UI
  const nowIndex = 0;
  const hourly = data.hourly || {};
  const daily = data.daily || {};

  const current = {
    tempC: hourly.temperature_2m?.[nowIndex] ?? null,
    humidity: hourly.relative_humidity_2m?.[nowIndex] ?? null,
    rainProb: hourly.precipitation_probability?.[nowIndex] ?? null,
  };

  const next24h = (() => {
    const slice = (arr) => (arr ? arr.slice(0, 24) : []);
    const probs = slice(hourly.precipitation_probability || []);
    const rain = slice(hourly.rain || []);
    return {
      maxProb: probs.length ? Math.max(...probs) : null,
      totalRainMm: rain.reduce((a, b) => a + (b || 0), 0)
    };
  })();

  const dailyArr = (daily.time || []).map((date, i) => ({
    date,
    probMax: daily.precipitation_probability_max?.[i] ?? null,
    rainSum: daily.rain_sum?.[i] ?? null,
    precipSum: daily.precipitation_sum?.[i] ?? null,
    tMax: daily.temperature_2m_max?.[i] ?? null,
    tMin: daily.temperature_2m_min?.[i] ?? null
  }));

  return { current, next24h, daily: dailyArr, raw: data };
}
