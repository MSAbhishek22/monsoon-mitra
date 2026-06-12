// src/components/alerts/AlertModal.jsx — Complete implementation per spec
import React, { useState, useEffect } from 'react';

const ALERT_CONTENT = {
  flood: {
    emoji: '🌊',
    title: 'बाढ़ की चेतावनी',
    severity: 'गंभीर',
    severityColor: '#C62828',
    severityBg: '#FFEBEE',
    description:
      'आपके क्षेत्र में अगले 24 घंटों में बहुत भारी बारिश होने की संभावना है। यह आपकी फसल और खेत के लिए खतरनाक हो सकता है।',
    actions: [
      '💧 खेत में पानी निकासी की व्यवस्था करें',
      '🌾 कटी हुई फसल को सुरक्षित जगह रखें',
      '⚡ बिजली के उपकरण बंद कर दें',
      '🐄 पशुओं को सुरक्षित स्थान पर ले जाएं',
      '📞 नजदीकी कृषि केंद्र से संपर्क करें',
      '🚫 आज सिंचाई बिल्कुल न करें',
    ],
  },
  drought: {
    emoji: '☀️',
    title: 'सूखे की चेतावनी',
    severity: 'मध्यम',
    severityColor: '#E64A19',
    severityBg: '#FBE9E7',
    description:
      'अगले 7+ दिनों में बारिश की कोई संभावना नहीं है। तापमान अधिक है। सिंचाई की सावधानीपूर्वक योजना बनाएं।',
    actions: [
      '💧 ड्रिप इरिगेशन या स्प्रिंकलर से पानी दें',
      '🌅 सुबह जल्दी या शाम को सिंचाई करें',
      '🌿 मल्चिंग करें — मिट्टी की नमी बनी रहेगी',
      '💊 फसल को stress से बचाने वाली दवाई डालें',
      '💰 पानी बचाएं — बाद में काम आएगा',
    ],
  },
  harvest: {
    emoji: '🌾',
    title: 'कटाई का समय — सावधान रहें',
    severity: 'ध्यान दें',
    severityColor: '#E65100',
    severityBg: '#FBE9E7',
    description: 'कटाई के समय बारिश होने की संभावना है। कटी हुई फसल को भीगने से बचाएं।',
    actions: [
      '⚡ जल्दी से जल्दी कटाई पूरी करें',
      '🏠 कटी फसल को तुरंत ढक दें या अंदर रखें',
      '📊 मंडी में जल्दी बेचने की योजना बनाएं',
    ],
  },
};

export default function AlertModal({ alert, weatherData, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  if (!alert) return null;

  const content = ALERT_CONTENT[alert.type] || ALERT_CONTENT.flood;

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => onClose && onClose(), 350);
  };

  return (
    <div
      onClick={handleClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        background: visible ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0)',
        backdropFilter: visible ? 'blur(4px)' : 'none',
        transition: 'all 300ms ease',
        display: 'flex',
        alignItems: 'flex-end',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          background: '#FFFFFF',
          borderRadius: '24px 24px 0 0',
          padding: '20px 20px 40px',
          boxShadow: '0 -8px 32px rgba(0,0,0,0.2)',
          transform: visible ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 350ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          maxHeight: '85vh',
          overflowY: 'auto',
        }}
      >
        {/* Handle bar */}
        <div style={{ width: 48, height: 4, background: '#E0E0E0', borderRadius: 2, margin: '0 auto 16px' }} />

        {/* Emoji */}
        <div style={{ textAlign: 'center', fontSize: 56, marginBottom: 12 }}>{content.emoji}</div>

        {/* Severity badge */}
        <div style={{ textAlign: 'center', marginBottom: 10 }}>
          <span style={{
            background: content.severityBg,
            color: content.severityColor,
            border: `2px solid ${content.severityColor}`,
            borderRadius: 20,
            padding: '4px 16px',
            fontSize: 13,
            fontWeight: 700,
          }}>
            {content.severity}
          </span>
        </div>

        {/* Title */}
        <h2 style={{ textAlign: 'center', fontSize: 22, fontWeight: 800, color: '#1A1A1A', margin: '0 0 12px' }}>
          {content.title}
        </h2>

        {/* Live weather context */}
        {weatherData && (
          <div style={{
            background: '#F1F8E9', borderRadius: 12, padding: '12px 16px',
            marginBottom: 14, display: 'flex', justifyContent: 'space-around',
          }}>
            {[
              { val: `${weatherData.rainProbabilityNext24h ?? '--'}%`, label: 'बारिश संभावना' },
              { val: `${weatherData.temperatureCelsius?.toFixed(0) ?? '--'}°C`, label: 'तापमान' },
              { val: `${weatherData.humidityPercent?.toFixed(0) ?? '--'}%`, label: 'नमी' },
            ].map((item, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#2E7D32' }}>{item.val}</p>
                <p style={{ margin: 0, fontSize: 11, color: '#757575' }}>{item.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Description */}
        <p style={{ fontSize: 15, color: '#4A4A4A', lineHeight: 1.75, marginBottom: 16 }}>
          {content.description}
        </p>

        {/* Action list */}
        <p style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A', marginBottom: 10 }}>अभी ये करें:</p>
        {content.actions.map((action, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              padding: '10px 0',
              borderBottom: i < content.actions.length - 1 ? '1px solid #F5F5F5' : 'none',
            }}
          >
            <span style={{ fontSize: 20, flexShrink: 0 }}>{action.split(' ')[0]}</span>
            <p style={{ fontSize: 14, color: '#1A1A1A', margin: 0, lineHeight: 1.6, fontWeight: 500 }}>
              {action.substring(action.indexOf(' ') + 1)}
            </p>
          </div>
        ))}

        {/* Close button */}
        <button
          onClick={handleClose}
          style={{
            width: '100%', height: 56,
            background: '#2E7D32', color: '#FFFFFF',
            border: 'none', borderRadius: 14,
            fontSize: 17, fontWeight: 700,
            cursor: 'pointer', marginTop: 22,
            boxShadow: '0 4px 12px rgba(46,125,50,0.3)',
          }}
          id="alert-modal-close"
        >
          समझ गया ✓
        </button>
      </div>
    </div>
  );
}
