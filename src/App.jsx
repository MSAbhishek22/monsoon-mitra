// src/App.jsx
import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from './context/AppContext';
import { useNotifications } from './hooks/useNotifications';
import { useWeather } from './hooks/useWeather';
import { trackEvent, EVENTS } from './firebase/analytics';

// Components
import SplashScreen from './components/common/SplashScreen';
import BottomNav from './components/common/BottomNav';
import OnboardingWrapper from './components/onboarding/OnboardingWrapper';
import AlertBanner from './components/alerts/AlertBanner';
import AlertModal from './components/alerts/AlertModal';
import { seedDemoData } from './utils/demoSeed';

// Pages
import HomePage from './pages/HomePage';
import WeatherPage from './pages/WeatherPage';
import AIPage from './pages/AIPage';
import SavingsPage from './pages/SavingsPage';
import SettingsPage from './pages/SettingsPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

function MainAppFlow() {
  const { activeTab, alerts, dismissAlert, user } = useApp();
  const [selectedAlert, setSelectedAlert] = useState(null);
  
  // Render active tab content
  const renderTab = () => {
    switch (activeTab) {
      case 'home': return <HomePage />;
      case 'weather': return <WeatherPage />;
      case 'ai': return <AIPage />;
      case 'savings': return <SavingsPage />;
      case 'settings': return <SettingsPage />;
      default: return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F8E9]">
      {/* Alert Banners */}
      {alerts.map((alert) => (
        <AlertBanner
          key={alert.type}
          alert={alert}
          onDismiss={() => dismissAlert(alert.type)}
          onDetails={() => setSelectedAlert(alert)}
        />
      ))}

      {/* Main Content Area */}
      <div className="pb-[64px]">
        {renderTab()}
      </div>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <AlertModal
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
        />
      )}
    </div>
  );
}

function AppShell() {
  const { onboardingComplete, completeOnboarding, addAlert, notificationSettings } = useApp();
  const { alertLevel } = useWeather();
  const { scheduleWeatherAlert } = useNotifications();
  const [showSplash, setShowSplash] = useState(true);
  const location = useLocation();
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);

  React.useEffect(() => {
    // Demo seed
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('demo') === 'true' || import.meta.env.DEV) {
      seedDemoData();
    }

    // SW update listener
    const swHandler = () => setShowUpdateBanner(true);
    window.addEventListener('sw_update_available', swHandler);

    // Install prompt listener
    const installHandler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      const hasUsedAI = localStorage.getItem('ai_message_count');
      if (hasUsedAI && parseInt(hasUsedAI) >= 2) {
        setShowInstallBanner(true);
      }
      trackEvent('pwa_install_prompted');
    };
    window.addEventListener('beforeinstallprompt', installHandler);
    window.addEventListener('appinstalled', () => {
      trackEvent('pwa_installed');
      setShowInstallBanner(false);
    });

    return () => {
      window.removeEventListener('sw_update_available', swHandler);
      window.removeEventListener('beforeinstallprompt', installHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') trackEvent('pwa_installed');
    setInstallPrompt(null);
    setShowInstallBanner(false);
  };

  // Check for alerts when weather updates
  React.useEffect(() => {
    if (!alertLevel) return;
    
    const alert = {
      type: alertLevel,
      title: alertLevel === 'flood' ? '⚠️ बाढ़ की चेतावनी!' : '🌡️ सूखे की चेतावनी',
      severity: 'high'
    };
    
    // Only show if setting is enabled
    if (notificationSettings[alertLevel]) {
      addAlert(alert);
      trackEvent(EVENTS.ALERT_VIEWED, { alert_type: alertLevel });
      // Schedule native notification
      scheduleWeatherAlert({
        isFloodRisk: alertLevel === 'flood',
        isDroughtRisk: alertLevel === 'drought'
      });
    }
  }, [alertLevel, addAlert, notificationSettings, scheduleWeatherAlert]);

  // Track app open
  React.useEffect(() => {
    trackEvent(EVENTS.APP_OPENED);
  }, []);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  // Handle standalone routes first
  if (location.pathname === '/privacy') return <PrivacyPolicy />;
  if (location.pathname === '/terms') return <TermsOfService />;

  // Require onboarding for main app
  if (!onboardingComplete) {
    trackEvent(EVENTS.ONBOARDING_STARTED);
    return <OnboardingWrapper onComplete={completeOnboarding} />;
  }

  // Main app with tabs
  return (
    <>
      {showUpdateBanner && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 500,
          background: '#2E7D32', color: '#fff',
          padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <span style={{ fontSize: '14px' }}>🌾 नया अपडेट उपलब्ध है!</span>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#fff', color: '#2E7D32', border: 'none',
              borderRadius: '8px', padding: '6px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer'
            }}
          >
            अपडेट करें
          </button>
        </div>
      )}
      <MainAppFlow />
      {showInstallBanner && (
        <div style={{
          position: 'fixed', bottom: '72px', left: '16px', right: '16px', zIndex: 400,
          background: '#FFFFFF', border: '2px solid #2E7D32',
          borderRadius: '16px', padding: '16px',
          boxShadow: '0 4px 20px rgba(46,125,50,0.2)',
          display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <span style={{ fontSize: '32px' }}>📲</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '15px', fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
              ऐप इंस्टॉल करें
            </p>
            <p style={{ fontSize: '13px', color: '#757575', margin: '2px 0 0' }}>
              बिना इंटरनेट भी काम करेगा
            </p>
          </div>
          <button onClick={handleInstall} style={{
            background: '#2E7D32', color: '#fff', border: 'none',
            borderRadius: '10px', padding: '10px 16px', fontSize: '14px', fontWeight: 600, cursor: 'pointer'
          }}>
            इंस्टॉल
          </button>
          <button onClick={() => setShowInstallBanner(false)} style={{
            background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#BDBDBD'
          }}>×</button>
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="*" element={<AppShell />} />
    </Routes>
  );
}