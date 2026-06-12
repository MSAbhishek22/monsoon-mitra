// src/firebase/config.js — Firebase initialization with graceful fallback
let analytics = null;
let messaging = null;
let logEvent = () => {};
let app = null;

try {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  if (apiKey && apiKey !== 'your_firebase_api_key') {
    const { initializeApp } = await import('firebase/app');
    const firebaseConfig = {
      apiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
    };
    app = initializeApp(firebaseConfig);

    try {
      const analyticsModule = await import('firebase/analytics');
      analytics = analyticsModule.getAnalytics(app);
      logEvent = analyticsModule.logEvent;
    } catch {}

    try {
      const messagingModule = await import('firebase/messaging');
      messaging = messagingModule.getMessaging(app);
    } catch {}
  }
} catch (e) {
  if (import.meta.env.DEV) console.warn('Firebase init skipped:', e.message);
}

export { analytics, messaging, logEvent };
export default app;
