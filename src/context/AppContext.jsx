// src/context/AppContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { storage } from '../utils/storage';
import { trackEvent } from '../firebase/analytics';
import { t } from '../i18n/translations';

const AppContext = createContext(null);

const DEFAULT_USER = {
  name: '',
  crops: [],
  language: 'hi',
  location: { lat: 28.6139, lng: 77.2090, city: 'Delhi', state: 'Delhi' }
};

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return {
        name: localStorage.getItem('user_name') || '',
        crops: JSON.parse(localStorage.getItem('user_crops') || '[]'),
        language: localStorage.getItem('user_language') || 'hi',
        location: JSON.parse(localStorage.getItem('user_location') || 'null') || { lat: 28.6139, lng: 77.2090, city: 'Delhi', state: 'Delhi' },
        onboardingDate: localStorage.getItem('onboarding_date') || null
      };
    } catch(e) {
      return DEFAULT_USER;
    }
  });
  const [activeTab, setActiveTab] = useState('home');
  const [alerts, setAlerts] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [onboardingComplete, setOnboardingComplete] = useState(() => {
    return storage.get('onboarding_complete', false);
  });
  const [notificationSettings, setNotificationSettings] = useState(() => {
    return storage.get('notification_settings', {
      flood: true,
      drought: true,
      irrigation: true,
      weather: true
    });
  });



  // Online/Offline detection
  useEffect(() => {
    const handleOnline = () => { setIsOnline(true); trackEvent('online_mode_restored'); };
    const handleOffline = () => { setIsOnline(false); trackEvent('offline_mode_entered'); };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const updateUser = useCallback((updates) => {
    setUser(prev => ({ ...prev, ...updates }));
    // Persist each field
    if (updates.name !== undefined) localStorage.setItem('user_name', updates.name);
    if (updates.language !== undefined) localStorage.setItem('user_language', updates.language);
    if (updates.crops !== undefined) localStorage.setItem('user_crops', JSON.stringify(updates.crops));
    if (updates.location !== undefined) localStorage.setItem('user_location', JSON.stringify(updates.location));
  }, []);

  const completeOnboarding = useCallback((userData) => {
    setUser(prev => ({ ...prev, ...userData }));
    storage.set('onboarding_complete', true);
    storage.set('onboarding_date', new Date().toISOString());
    setOnboardingComplete(true);
  }, []);

  const updateNotificationSettings = useCallback((key, value) => {
    setNotificationSettings(prev => {
      const updated = { ...prev, [key]: value };
      storage.set('notification_settings', updated);
      return updated;
    });
  }, []);

  const addAlert = useCallback((alert) => {
    setAlerts(prev => {
      if (prev.find(a => a.type === alert.type)) return prev;
      return [...prev, alert];
    });
  }, []);

  const dismissAlert = useCallback((type) => {
    setAlerts(prev => {
      if (!prev.some(a => a.type === type)) return prev;
      return prev.filter(a => a.type !== type);
    });
  }, []);

  const clearAllData = useCallback(() => {
    storage.clear();
    setUser(DEFAULT_USER);
    setOnboardingComplete(false);
    setAlerts([]);
    setActiveTab('home');
  }, []);

  const value = {
    user,
    updateUser,
    activeTab,
    setActiveTab,
    alerts,
    addAlert,
    dismissAlert,
    isOnline,
    onboardingComplete,
    completeOnboarding,
    notificationSettings,
    updateNotificationSettings,
    clearAllData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function useT() {
  const { user } = useApp();
  const lang = user?.language || 'hi';
  return (key) => t(lang, key);
}
