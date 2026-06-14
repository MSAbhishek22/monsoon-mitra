// src/components/weather/ForecastStrip.jsx — Horizontal scrolling hourly forecast
import React from 'react';
import { getWeatherEmoji } from '../../api/weather';

export default function ForecastStrip({ hourlyData, label }) {
  if (!hourlyData?.time) return null;
  const now = new Date();
  const currentHour = now.getHours();
  const slots = [];

  for (let i = currentHour; i < Math.min(currentHour + 24, hourlyData.time.length); i++) {
    slots.push({
      time: new Date(hourlyData.time[i]).toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }),
      temp: hourlyData.temperature_2m?.[i],
      rainProb: hourlyData.precipitation_probability?.[i] || 0,
    });
  }

  return (
    <div>
      {label && <h3 className="text-[17px] font-bold text-[#1A1A1A] mb-3">{label}</h3>}
      <div className="flex gap-2 overflow-x-auto scroll-hidden hide-scrollbar pb-2">
        {slots.slice(0, 24).map((slot, i) => (
          <div
            key={i}
            className="min-w-[64px] h-[88px] bg-white rounded-[10px] shadow-card flex flex-col items-center justify-center p-2 flex-shrink-0"
          >
            <span className="text-[11px] text-[#757575]">{slot.time}</span>
            <span className="text-[22px] my-1">{getWeatherEmoji(slot.rainProb, slot.temp)}</span>
            <span className="text-sm font-bold text-[#1A1A1A]">{slot.temp?.toFixed(0)}°</span>
            {slot.rainProb > 15 && (
              <span className="text-[11px] text-sky-500">💧{slot.rainProb}%</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
