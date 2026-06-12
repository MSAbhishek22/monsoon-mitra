// src/hooks/useNotifications.js — Complete FCM + local notification implementation
import { useState, useEffect, useCallback } from 'react';
import { trackEvent, EVENTS } from '../firebase/analytics';
import { storage } from '../utils/storage';

const isFCMSupported = () =>
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window;

export function useNotifications() {
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [fcmToken, setFcmToken] = useState(() => storage.get('fcm_token', null));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // ─── Request notification permission ───────────────────────────────────────
  const requestPermission = useCallback(async () => {
    if (!isFCMSupported()) {
      setError('इस ब्राउज़र में notifications support नहीं है');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        trackEvent(EVENTS.NOTIFICATION_PERMISSION_GRANTED);

        // Try getting FCM token (optional — works without Firebase config)
        try {
          const { getToken } = await import('firebase/messaging');
          const { messaging } = await import('../firebase/config');

          if (messaging) {
            const swReg = await navigator.serviceWorker.ready;
            const token = await getToken(messaging, {
              vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
              serviceWorkerRegistration: swReg,
            });

            if (token) {
              setFcmToken(token);
              storage.set('fcm_token', token);
              storage.set('fcm_token_timestamp', Date.now());
              console.log('[Notifications] FCM token registered ✓');
              return token;
            }
          }
        } catch (fcmErr) {
          // Firebase not configured — local notifications still work
          console.warn('[Notifications] FCM unavailable, using local-only mode:', fcmErr.message);
          return 'local_only';
        }

        return 'local_only';
      } else {
        trackEvent(EVENTS.NOTIFICATION_PERMISSION_DENIED);
        return null;
      }
    } catch (err) {
      setError('Permission request failed');
      console.error('[Notifications] Permission error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ─── Listen for foreground FCM messages ────────────────────────────────────
  useEffect(() => {
    if (permission !== 'granted') return;
    let unsubscribe = null;

    const setupFCMListener = async () => {
      try {
        const { onMessage } = await import('firebase/messaging');
        const { messaging } = await import('../firebase/config');
        if (!messaging) return;

        unsubscribe = onMessage(messaging, (payload) => {
          console.log('[Notifications] Foreground FCM message:', payload);
          trackEvent(EVENTS.NOTIFICATION_RECEIVED, { type: payload.data?.type || 'unknown' });

          // Dispatch to App for in-app alert banner
          window.dispatchEvent(
            new CustomEvent('fcm_foreground_message', {
              detail: payload,
              bubbles: true,
            })
          );
        });
      } catch (e) {
        console.warn('[Notifications] FCM listener setup failed:', e.message);
      }
    };

    setupFCMListener();
    return () => { if (unsubscribe) unsubscribe(); };
  }, [permission]);

  // ─── Schedule weather alert notifications ──────────────────────────────────
  const scheduleWeatherAlert = useCallback(async (weatherData) => {
    if (permission !== 'granted' || !weatherData) return;

    const settings = storage.get('notification_settings', {
      flood: true,
      drought: true,
      irrigation: true,
      weather: false,
    });

    const { rainProbabilityNext24h = 0, temperatureCelsius = 30 } = weatherData;
    const isFloodRisk = rainProbabilityNext24h > 80;
    const isDroughtRisk = rainProbabilityNext24h < 10 && temperatureCelsius > 38;

    try {
      const swReg = await navigator.serviceWorker.ready;

      if (isFloodRisk && settings.flood) {
        await swReg.showNotification('⚠️ बाढ़ की चेतावनी!', {
          body: `अगले 24 घंटे में ${rainProbabilityNext24h}% बारिश। अपनी फसल सुरक्षित करें।`,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          tag: 'flood_warning',
          requireInteraction: true,
          vibrate: [500, 200, 500, 200, 500],
          data: { type: 'flood_warning', url: '/?tab=weather' },
          actions: [
            { action: 'view', title: '🌦️ मौसम देखें' },
            { action: 'dismiss', title: '✕ बाद में' },
          ],
        });
        trackEvent(EVENTS.ALERT_VIEWED, { type: 'flood' });
      }

      if (isDroughtRisk && settings.drought) {
        await swReg.showNotification('🌡️ सूखे की चेतावनी', {
          body: 'लंबे समय तक बारिश नहीं। सिंचाई की योजना बनाएं।',
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          tag: 'drought_warning',
          requireInteraction: false,
          vibrate: [200, 100, 200],
          data: { type: 'drought_warning', url: '/?tab=weather' },
        });
        trackEvent(EVENTS.ALERT_VIEWED, { type: 'drought' });
      }

      // Daily irrigation reminder between 7–9 AM
      if (settings.irrigation) {
        const lastReminder = storage.get('last_irrigation_reminder_date', null);
        const today = new Date().toDateString();
        const hour = new Date().getHours();

        if (lastReminder !== today && hour >= 7 && hour <= 9) {
          await swReg.showNotification('🌾 सुप्रभात! आज का मौसम देखें', {
            body: 'क्या आज सिंचाई करनी है? AI सहायक से पूछें।',
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            tag: 'irrigation_reminder',
            data: { type: 'irrigation_reminder', url: '/?tab=home' },
          });
          storage.set('last_irrigation_reminder_date', today);
        }
      }
    } catch (err) {
      console.warn('[Notifications] scheduleWeatherAlert error:', err.message);
    }
  }, [permission]);

  return {
    permission,
    fcmToken,
    isLoading,
    error,
    requestPermission,
    scheduleWeatherAlert,
    isFCMSupported: isFCMSupported(),
  };
}
