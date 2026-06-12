// src/components/onboarding/LocationScreen.jsx — With notification permission per spec
import React, { useState } from 'react';
import { useLocation } from '../../hooks/useLocation';
import { useNotifications } from '../../hooks/useNotifications';
import { t } from '../../i18n/index';
import { trackEvent, EVENTS } from '../../firebase/analytics';

export default function LocationScreen({ onComplete, language }) {
  const { location, loading, error, requestLocation } = useLocation();
  const { requestPermission, isFCMSupported } = useNotifications();
  const [cityName, setCityName] = useState('');
  const [userName, setUserName] = useState('');
  const [locationGranted, setLocationGranted] = useState(false);
  const [locationMethod, setLocationMethod] = useState(null);
  const [notificationGranted, setNotificationGranted] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);

  const handleLocationRequest = async () => {
    try {
      const loc = await requestLocation();
      if (loc) {
        setLocationGranted(true);
        setLocationMethod('gps');
        trackEvent(EVENTS.ONBOARDING_LOCATION_GRANTED, { method: 'gps' });
      }
    } catch {
      // Error shown via hook state
    }
  };

  const handleNotificationPermission = async () => {
    setNotifLoading(true);
    const result = await requestPermission();
    if (result) {
      setNotificationGranted(true);
      trackEvent(EVENTS.NOTIFICATION_PERMISSION_GRANTED);
    }
    setNotifLoading(false);
  };

  const handleComplete = () => {
    const locationData = locationGranted && location
      ? { lat: location.lat, lng: location.lng, city: location.city || cityName || 'Delhi', state: location.state || '' }
      : { lat: 28.6139, lng: 77.2090, city: cityName.trim() || 'Delhi', state: 'Delhi' };

    if (!locationGranted && cityName.trim()) {
      setLocationMethod('manual');
      trackEvent(EVENTS.ONBOARDING_LOCATION_GRANTED, { method: 'manual' });
    }

    trackEvent(EVENTS.ONBOARDING_COMPLETED, {
      location_method: locationMethod || 'default',
      notification_granted: notificationGranted,
    });

    onComplete({ location: locationData, name: userName.trim() });
  };

  const canProceed = locationGranted || cityName.trim().length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="text-center pt-6 pb-4 px-4">
        <div className="text-[48px]" style={{ animation: 'bounce 2s ease-in-out infinite' }}>📍🌾</div>
        <h2 className="text-2xl font-bold text-[#1A1A1A] mt-4">{t(language, 'whereField')}</h2>
        <p className="text-[15px] text-[#757575] mt-2" style={{ lineHeight: 1.75 }}>
          {t(language, 'whereFieldSub')}
        </p>
      </div>

      <div className="flex-1 px-4 space-y-4 overflow-y-auto">
        {/* GPS Button */}
        <button
          onClick={handleLocationRequest}
          disabled={loading || locationGranted}
          className="w-full h-14 rounded-xl font-semibold text-lg tap-feedback transition-all duration-300"
          style={{
            background: locationGranted ? '#4CAF50' : '#2E7D32',
            color: '#FFF',
            boxShadow: locationGranted ? 'none' : '0 4px 12px rgba(46,125,50,0.3)',
            border: 'none',
          }}
          id="location-gps-btn"
        >
          {loading
            ? <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : locationGranted
              ? t(language, 'locationFound')
              : t(language, 'giveLocation')}
        </button>

        {locationGranted && location?.city && (
          <p className="text-sm text-primary-500 text-center animate-scale-in">
            📍 {location.city}{location.state ? `, ${location.state}` : ''}
          </p>
        )}

        {error && !locationGranted && (
          <div className="p-3 rounded-lg border-2 border-danger-500 bg-danger-50 text-sm text-[#4A4A4A]" style={{ lineHeight: 1.75 }}>
            {t(language, 'locationDenied')}
            <button onClick={handleLocationRequest} className="block mt-2 text-danger-700 font-semibold tap-feedback">
              {t(language, 'tryAgainLocation')}
            </button>
          </div>
        )}

        {/* OR divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[#E0E0E0]" />
          <span className="text-sm text-[#757575]">{t(language, 'orDivider')}</span>
          <div className="flex-1 h-px bg-[#E0E0E0]" />
        </div>

        {/* City input */}
        <div>
          <label className="text-sm text-[#4A4A4A] font-medium">{t(language, 'typeCityName')}</label>
          <input
            type="text"
            value={cityName}
            onChange={e => setCityName(e.target.value)}
            placeholder={t(language, 'cityPlaceholder')}
            className="w-full mt-1 px-4 py-3.5 border-2 border-[#BDBDBD] rounded-lg text-base"
            id="city-input"
          />
        </div>

        {/* Name input */}
        <div>
          <label className="text-sm text-[#4A4A4A] font-medium">{t(language, 'yourName')}</label>
          <input
            type="text"
            value={userName}
            onChange={e => setUserName(e.target.value)}
            placeholder={t(language, 'namePlaceholder')}
            className="w-full mt-1 px-4 py-3.5 border-2 border-[#BDBDBD] rounded-lg text-base"
            id="name-input"
          />
        </div>

        {/* Notification permission block */}
        {isFCMSupported && (
          <div style={{
            background: '#FFF8E1',
            border: '2px solid #FFB300',
            borderRadius: 12,
            padding: 16,
          }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#1A1A1A', margin: '0 0 6px' }}>
              🔔 बाढ़ और सूखे की चेतावनी पाएं
            </p>
            <p style={{ fontSize: 13, color: '#4A4A4A', margin: '0 0 12px', lineHeight: 1.6 }}>
              खतरे से पहले अलर्ट पाएं — बिल्कुल मुफ्त
            </p>
            <button
              onClick={handleNotificationPermission}
              disabled={notifLoading || notificationGranted}
              style={{
                width: '100%',
                height: 48,
                background: notificationGranted ? '#E8F5E9' : '#FF8F00',
                color: notificationGranted ? '#2E7D32' : '#FFFFFF',
                border: notificationGranted ? '2px solid #4CAF50' : 'none',
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 600,
                cursor: notificationGranted ? 'default' : 'pointer',
              }}
              id="notification-permission-btn"
            >
              {notifLoading
                ? <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : notificationGranted
                  ? '✅ सूचनाएं चालू हैं'
                  : '🔔 सूचनाएं चालू करें'}
            </button>
          </div>
        )}
      </div>

      {/* Get Started CTA */}
      <div className="px-4 pb-6 pt-4 safe-bottom">
        <button
          onClick={handleComplete}
          disabled={!canProceed}
          className="w-full h-14 rounded-xl font-bold text-lg text-white tap-feedback disabled:opacity-50"
          style={{
            background: canProceed ? 'linear-gradient(135deg, #2E7D32, #388E3C)' : '#E0E0E0',
            boxShadow: canProceed ? '0 6px 20px rgba(46,125,50,0.4)' : 'none',
            border: 'none',
          }}
          id="get-started-btn"
        >
          {t(language, 'getStarted')}
        </button>
      </div>
    </div>
  );
}
