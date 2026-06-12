// src/components/weather/IrrigationAdvice.jsx — Decision card
import React, { useEffect } from 'react';
import { trackEvent, EVENTS } from '../../firebase/analytics';

export default function IrrigationAdvice({ decision }) {
  useEffect(() => {
    if (!decision) return;
    trackEvent(EVENTS.IRRIGATION_DECISION, {
      decision: decision.decision,
      rain_probability: decision.confidence,
    });
  }, [decision]);

  if (!decision) return null;
  const { decision: d, reason, icon, color } = decision;
  const isSkip = d === 'skip';

  return (
    <div
      className="mx-4 -mt-4 bg-white rounded-2xl p-5 relative z-10"
      style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-lg font-bold" style={{ color }}>
            {isSkip ? 'बारिश आ रही है 🌧️' : 'आज पानी दें 💧'}
          </span>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-sm text-[#4A4A4A] mt-2">{reason}</p>
    </div>
  );
}
