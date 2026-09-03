import { useState, useEffect, Suspense, lazy } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import SplashScreen from './components/common/SplashScreen';
import OnboardingWrapper from './components/onboarding/OnboardingWrapper';
import BottomNav from './components/common/BottomNav';
import AlertBanner from './components/alerts/AlertBanner';
import { storage } from './utils/storage';
import { measureCoreWebVitals } from './utils/performance';


// Lazy load pages for faster initial load
const HomePage = lazy(() => import('./pages/HomePage'));
const WeatherPage = lazy(() => import('./pages/WeatherPage'));
const AIPage = lazy(() => import('./pages/AIPage'));
const SavingsPage = lazy(() => import('./pages/SavingsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));

function AppShell() {
  const { activeTab, setActiveTab, user, completeOnboarding } = useApp();
  const [currentPage, setCurrentPage] = useState('app'); // 'app' | 'privacy' | 'terms'
  const [showSplash, setShowSplash] = useState(true);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  const onboardingDone = !!storage.get('onboarding_complete');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('demo') === 'true') {
      import('./utils/demoSeed').then(({ seedDemoData }) => {
        localStorage.removeItem('demo_seeded');
        seedDemoData();
      });
    }
  }, []);

  // PWA install prompt
  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setShowInstallBanner(false));
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Service worker update detection
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(reg => {
        reg.addEventListener('updatefound', () => {
          const w = reg.installing;
          w?.addEventListener('statechange', () => {
            if (w.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
            }
          });
        });
      });
    }
  }, []);

  // Handle browser back button for /privacy and /terms
  useEffect(() => {
    const handlePopState = () => setCurrentPage('app');
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Performance monitoring
  useEffect(() => { measureCoreWebVitals(); }, []);

  const navigateTo = (page) => {
    if (page === 'privacy' || page === 'terms') {
      window.history.pushState({ page }, '', `/${page}`);
      setCurrentPage(page);
    } else {
      setCurrentPage('app');
    }
  };

  const goBack = () => {
    setCurrentPage('app');
    setActiveTab('settings');
    window.history.pushState({}, '', '/');
  };

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (!onboardingDone) {
    return (
      <OnboardingWrapper
        onComplete={(userData) => {
          // Persist user data then mark onboarding complete
          if (userData.language) localStorage.setItem('user_language', userData.language);
          if (userData.crops) localStorage.setItem('user_crops', JSON.stringify(userData.crops));
          if (userData.name) localStorage.setItem('user_name', userData.name);
          if (userData.location) localStorage.setItem('user_location', JSON.stringify(userData.location));
          completeOnboarding(userData);
        }}
      />
    );
  }

  const isLegalPage = currentPage === 'privacy' || currentPage === 'terms';

  return (
    <div style={{
      maxWidth: '430px',
      margin: '0 auto',
      minHeight: '100dvh',
      background: '#F0F7F0',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Update banner */}
      {updateAvailable && (
        <div style={{
          position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: '430px',
          background: 'linear-gradient(135deg, #1B5E20, #2E7D32)',
          padding: '12px 16px', zIndex: 600,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <span style={{ fontSize: '14px', color: '#FFFFFF', fontWeight: 600 }}>
            🌾 नया अपडेट उपलब्ध है!
          </span>
          <button onClick={() => window.location.reload()} style={{
            background: '#FFFFFF', color: '#1B5E20', border: 'none',
            borderRadius: '8px', padding: '6px 14px', fontSize: '13px',
            fontWeight: 700, cursor: 'pointer'
          }}>
            अपडेट करें
          </button>
        </div>
      )}

      {/* Alert banner */}
      <AlertBanner />

      {/* Page content */}
      <div
        key={isLegalPage ? currentPage : activeTab}
        style={{
          flex: 1, overflowY: 'auto', overflowX: 'hidden',
          paddingBottom: isLegalPage ? '24px' : 'calc(72px + env(safe-area-inset-bottom))',
          animation: 'pageFadeIn 280ms ease forwards',
          WebkitOverflowScrolling: 'touch',
        }}
        className="hide-scrollbar"
      >
        <Suspense fallback={<PageSkeleton />}>
          {isLegalPage ? (
            currentPage === 'privacy'
              ? <PrivacyPolicy onBack={goBack} />
              : <TermsOfService onBack={goBack} />
          ) : (
            <>
              {activeTab === 'home' && <HomePage />}
              {activeTab === 'weather' && <WeatherPage />}
              {activeTab === 'ai' && <AIPage />}
              {activeTab === 'savings' && <SavingsPage />}
              {activeTab === 'settings' && <SettingsPage onNavigate={navigateTo} />}
            </>
          )}
        </Suspense>
      </div>

      {/* Bottom nav — hidden on legal pages */}
      {!isLegalPage && <BottomNav />}

      {/* PWA install banner */}
      {showInstallBanner && installPrompt && (
        <div style={{
          position: 'fixed', bottom: 'calc(72px + env(safe-area-inset-bottom) + 12px)',
          left: '50%', transform: 'translateX(-50%)',
          width: 'calc(100% - 32px)', maxWidth: '430px',
          background: '#FFFFFF', border: '2px solid #2E7D32',
          borderRadius: '16px', padding: '16px',
          boxShadow: '0 8px 24px rgba(27,94,32,0.2)',
          display: 'flex', alignItems: 'center', gap: '12px',
          zIndex: 50, animation: 'slideUpFade 300ms ease'
        }}>
          <span style={{ fontSize: '32px' }}>📲</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '15px', fontWeight: 700, color: '#0D1B0D', margin: 0 }}>
              ऐप इंस्टॉल करें
            </p>
            <p style={{ fontSize: '13px', color: '#5A7A5A', margin: '2px 0 0' }}>
              बिना इंटरनेट भी काम करेगा
            </p>
          </div>
          <button onClick={async () => {
            installPrompt.prompt();
            const { outcome } = await installPrompt.userChoice;
            setInstallPrompt(null);
            setShowInstallBanner(false);
          }} style={{
            background: 'linear-gradient(135deg, #1B5E20, #2E7D32)',
            color: '#FFFFFF', border: 'none', borderRadius: '10px',
            padding: '10px 16px', fontSize: '14px', fontWeight: 700, cursor: 'pointer'
          }}>
            इंस्टॉल
          </button>
          <button onClick={() => setShowInstallBanner(false)} style={{
            background: 'none', border: 'none', fontSize: '22px',
            cursor: 'pointer', color: '#BDBDBD', padding: '4px',
            lineHeight: 1, position: 'relative'
          }}>×</button>
        </div>
      )}
    </div>
  );
}

function PageSkeleton() {
  return (
    <div style={{ padding: '20px 16px' }}>
      {[1, 2, 3].map(i => (
        <div key={i} className="skeleton" style={{ height: '100px', borderRadius: '16px', marginBottom: '16px', background: '#e0e0e0' }} />
      ))}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}