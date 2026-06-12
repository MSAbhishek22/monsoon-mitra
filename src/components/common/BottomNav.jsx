// src/components/common/BottomNav.jsx — Section 7 spec
import React from 'react';
import { useApp } from '../../context/AppContext';
import { t } from '../../i18n/index';
import { trackEvent, EVENTS } from '../../firebase/analytics';

const NAV_ITEMS = [
  { id: 'home', icon: '🏠', labelKey: 'navHome' },
  { id: 'weather', icon: '🌦️', labelKey: 'navWeather' },
  { id: 'ai', icon: '🤖', labelKey: 'navAI' },
  { id: 'savings', icon: '💰', labelKey: 'navSavings' },
  { id: 'settings', icon: '⚙️', labelKey: 'navSettings' },
];

export default function BottomNav() {
  const { activeTab, setActiveTab, user } = useApp();
  const lang = user.language || 'hi';

  const handleTabChange = (tabId) => {
    if (tabId !== activeTab) {
      setActiveTab(tabId);
      trackEvent(EVENTS.TAB_CHANGED, { tab: tabId });
    }
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E0E0E0] z-[100] safe-bottom"
      style={{ boxShadow: '0 -2px 12px rgba(0,0,0,0.08)', height: '64px' }}
    >
      <div className="flex items-center justify-around h-full max-w-lg mx-auto">
        {NAV_ITEMS.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className="flex flex-col items-center justify-center flex-1 h-full relative tap-feedback"
              style={{ minHeight: '64px' }}
              aria-label={t(lang, item.labelKey)}
              id={`nav-${item.id}`}
              data-testid={`nav-${item.id}`}
            >
              {/* Active indicator pill */}
              {isActive && (
                <div
                  className="absolute top-1 w-6 h-[3px] rounded-full bg-primary-800 animate-scale-in"
                />
              )}

              {/* Icon */}
              <span
                className={`text-2xl transition-opacity duration-200 ${isActive ? 'opacity-100' : 'opacity-50'}`}
                style={{ marginTop: isActive ? '4px' : '0' }}
              >
                {item.icon}
              </span>

              {/* Label */}
              <span
                className={`text-[11px] mt-0.5 transition-colors duration-200 ${
                  isActive
                    ? 'text-primary-800 font-semibold'
                    : 'text-[#757575] font-normal'
                }`}
              >
                {t(lang, item.labelKey)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
