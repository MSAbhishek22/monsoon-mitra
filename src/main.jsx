// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

// Context Providers
import { AppProvider } from './context/AppContext';
import { WeatherProvider } from './context/WeatherContext';

// Error Boundary
import ErrorBoundary from './components/common/ErrorBoundary';
import { measureCoreWebVitals } from './utils/performance';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppProvider>
        <WeatherProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </WeatherProvider>
      </AppProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);

measureCoreWebVitals();

// Detect when a new service worker is available
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then((registration) => {
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New version available — show update banner
          window.dispatchEvent(new CustomEvent('sw_update_available'));
        }
      });
    });
  });
}