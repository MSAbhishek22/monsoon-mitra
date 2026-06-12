// src/components/alerts/AlertBanner.jsx — Complete implementation per spec
import React, { useState, useEffect } from 'react';

const ALERT_CONFIG = {
  flood: {
    bg: '#C62828',
    icon: '🚨',
    title: '⚠️ बाढ़ की चेतावनी!',
    subtitle: 'भारी बारिश की संभावना',
    pulse: true,
  },
  drought: {
    bg: '#E64A19',
    icon: '🌡️',
    title: '☀️ सूखे की चेतावनी',
    subtitle: 'लंबे समय तक बारिश नहीं',
    pulse: false,
  },
  harvest: {
    bg: '#E65100',
    icon: '🌾',
    title: '🌾 कटाई — बारिश का ध्यान रखें',
    subtitle: 'कटी फसल को ढक कर रखें',
    pulse: false,
  },
};

export default function AlertBanner({ alert, onDismiss, onDetails }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(t);
  }, []);

  if (!alert) return null;
  const c = ALERT_CONFIG[alert.type] || ALERT_CONFIG.flood;

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => onDismiss && onDismiss(), 400);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        background: c.bg,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 16px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        transform: visible ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      {/* Pulsing icon */}
      <span
        style={{
          fontSize: '22px',
          flexShrink: 0,
          animation: c.pulse ? 'pulse 1s ease-in-out infinite' : 'none',
        }}
      >
        {c.icon}
      </span>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#FFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {c.title}
        </p>
        <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.85)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {c.subtitle}
        </p>
      </div>

      {/* Details button */}
      <button
        onClick={onDetails}
        style={{
          background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '8px',
          padding: '5px 10px', color: '#FFF', fontSize: '12px', fontWeight: '600',
          cursor: 'pointer', whiteSpace: 'nowrap', minHeight: '32px', flexShrink: 0,
        }}
      >
        विवरण
      </button>

      {/* Dismiss */}
      <button
        onClick={handleDismiss}
        style={{
          background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)',
          fontSize: '22px', cursor: 'pointer', minWidth: '32px', minHeight: '32px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          lineHeight: 1,
        }}
        aria-label="बंद करें"
      >
        ×
      </button>
    </div>
  );
}
