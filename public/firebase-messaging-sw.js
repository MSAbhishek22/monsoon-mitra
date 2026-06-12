importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// NOTE: These FCM config values are intentionally public — FCM service workers
// are served publicly by design. The actual auth/security happens server-side.
// Do NOT put GEMINI_API_KEY here. Only Firebase web config values.
firebase.initializeApp({
  apiKey: self.__FIREBASE_CONFIG?.apiKey || "PLACEHOLDER",
  authDomain: self.__FIREBASE_CONFIG?.authDomain || "PLACEHOLDER",
  projectId: self.__FIREBASE_CONFIG?.projectId || "PLACEHOLDER",
  storageBucket: self.__FIREBASE_CONFIG?.storageBucket || "PLACEHOLDER",
  messagingSenderId: self.__FIREBASE_CONFIG?.messagingSenderId || "PLACEHOLDER",
  appId: self.__FIREBASE_CONFIG?.appId || "PLACEHOLDER"
});

let messaging = null;
try {
  messaging = firebase.messaging();
} catch (e) {
  console.warn('[firebase-messaging-sw] Firebase init error — push notifications disabled:', e);
}

// ─── Background message handler ──────────────────────────────────────────────
if (messaging) {
  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw] Background message received:', payload);

    const alertType = payload.data?.type || 'general';
    const notificationTitle = payload.notification?.title || 'Monsoon Mitra Alert';
    const notificationBody = payload.notification?.body || 'नई जानकारी उपलब्ध है';

    // Critical flood alert: max vibration + require interaction
    const isFlood = alertType === 'flood_warning';
    const isDrought = alertType === 'drought_warning';

    const options = {
      body: notificationBody,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: isFlood ? [500, 200, 500, 200, 500] : [200, 100, 200],
      data: {
        ...payload.data,
        url: payload.data?.url || '/',
        clickedAt: Date.now(),
      },
      tag: alertType,
      renotify: true,
      requireInteraction: isFlood || isDrought,
      silent: false,
      timestamp: Date.now(),
      actions: isFlood || isDrought
        ? [
            { action: 'view', title: '👀 विवरण देखें' },
            { action: 'dismiss', title: '✕ बाद में' },
          ]
        : [
            { action: 'view', title: '🌾 ऐप खोलें' },
          ],
    };

    return self.registration.showNotification(notificationTitle, options);
  });
}

// ─── Notification click handler ───────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw] Notification clicked:', event.action, event.notification.tag);
  event.notification.close();

  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing app window if open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.postMessage({
            type: 'NOTIFICATION_CLICKED',
            data: event.notification.data,
            action: event.action,
          });
          return;
        }
      }
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// ─── Direct push event handler (fallback for some Android browsers) ───────────
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.notification?.title || '🌾 Monsoon Mitra';
    const body = data.notification?.body || 'नई जानकारी उपलब्ध है';
    const alertType = data.data?.type || 'general';

    event.waitUntil(
      self.registration.showNotification(title, {
        body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: alertType,
        data: data.data || {},
        vibrate: alertType === 'flood_warning' ? [500, 200, 500] : [200, 100, 200],
        requireInteraction: alertType === 'flood_warning',
      })
    );
  } catch (e) {
    console.error('[firebase-messaging-sw] Push parse error:', e);
  }
});

// ─── Service worker lifecycle ─────────────────────────────────────────────────
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
