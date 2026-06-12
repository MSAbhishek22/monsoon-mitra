// src/firebase/analytics.js — Analytics wrapper
import { analytics, logEvent } from './config';

export const trackEvent = (eventName, params = {}) => {
  try {
    if (!analytics) return;
    logEvent(analytics, eventName, {
      ...params,
      timestamp: new Date().toISOString(),
      app_version: '1.0.0'
    });
  } catch (e) {
    if (import.meta.env.DEV) console.warn('Analytics error:', e);
  }
};

export const EVENTS = {
  ONBOARDING_STARTED: 'onboarding_started',
  ONBOARDING_LANGUAGE_SELECTED: 'onboarding_language_selected',
  ONBOARDING_CROP_SELECTED: 'onboarding_crop_selected',
  ONBOARDING_LOCATION_GRANTED: 'onboarding_location_granted',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  APP_OPENED: 'app_opened',
  TAB_CHANGED: 'tab_changed',
  AI_MESSAGE_SENT: 'ai_message_sent',
  AI_VOICE_USED: 'ai_voice_used',
  AI_RESPONSE_READ_ALOUD: 'ai_response_read_aloud',
  WEATHER_PAGE_VIEWED: 'weather_page_viewed',
  IRRIGATION_ADVICE_VIEWED: 'irrigation_advice_viewed',
  IRRIGATION_DECISION: 'irrigation_decision',
  SAVINGS_VIEWED: 'savings_viewed',
  SAVINGS_UPDATED: 'savings_updated',
  ALERT_VIEWED: 'alert_viewed',
  ALERT_TYPE: 'alert_type',
  NOTIFICATION_PERMISSION_GRANTED: 'notification_permission_granted',
  NOTIFICATION_PERMISSION_DENIED: 'notification_permission_denied',
  NOTIFICATION_RECEIVED: 'notification_received',
  NOTIFICATION_TAPPED: 'notification_tapped',
};
