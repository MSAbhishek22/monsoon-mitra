// src/api/notifications.js — Notification helpers

export function isNotificationSupported() {
  return 'Notification' in window;
}

export function getNotificationPermission() {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
}

export async function requestNotificationPermission() {
  if (!isNotificationSupported()) return 'denied';
  try {
    return await Notification.requestPermission();
  } catch {
    return 'denied';
  }
}

export function showLocalNotification(title, options = {}) {
  if (getNotificationPermission() !== 'granted') return;
  try {
    new Notification(title, {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [200, 100, 200],
      ...options,
    });
  } catch {}
}
