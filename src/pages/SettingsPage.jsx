// src/pages/SettingsPage.jsx — Section 15 spec
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { t, getLanguageName, LANGUAGE_OPTIONS } from '../i18n/index';
import { SettingsRow } from '../components/SettingsPanel';
import { getCropName } from '../utils/cropData';
import { trackEvent, EVENTS } from '../firebase/analytics';
import { storage } from '../utils/storage';
import { useLocation as useGeoLocation } from '../hooks/useLocation';

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      aria-checked={value}
      role="switch"
      style={{
        width: '44px', height: '24px', borderRadius: '12px',
        background: value ? '#2E7D32' : '#BDBDBD',
        border: 'none', cursor: 'pointer', position: 'relative',
        transition: 'background 200ms ease', padding: 0,
        flexShrink: 0
      }}
    >
      <div style={{
        width: '20px', height: '20px', borderRadius: '50%',
        background: '#FFFFFF', position: 'absolute', top: '2px',
        left: value ? '22px' : '2px',
        transition: 'left 200ms ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
      }} />
    </button>
  );
}

export default function SettingsPage() {
  const { user, updateUser, notificationSettings, updateNotificationSettings, clearAllData, onboardingComplete } = useApp();
  const lang = user.language || 'hi';
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [cityInput, setCityInput] = useState('');
  const { requestLocation } = useGeoLocation();
  
  const [notifPrefs, setNotifPrefs] = useState(
    () => storage.get('notification_prefs') || { flood: true, drought: true, irrigation: false, weather: false }
  );

  const toggleNotif = (key) => {
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(updated);
    storage.set('notification_prefs', updated);
    trackEvent(EVENTS.SETTINGS_NOTIFICATION_TOGGLED, { key, value: updated[key] });
  };

  const handleShare = async () => {
    trackEvent(EVENTS.APP_SHARED);
    const data = {
      title: 'Monsoon Mitra — किसान का डिजिटल साथी',
      text: 'खेती के लिए AI सहायक। मौसम, सिंचाई, फसल सुरक्षा — हिंदी में। मुफ्त!',
      url: 'https://monsoonmitra.vercel.app'
    };
    if (navigator.share) {
      try { await navigator.share(data); } catch (e) { if (e.name !== 'AbortError') navigator.clipboard?.writeText(data.url); }
    } else {
      navigator.clipboard?.writeText(data.url);
    }
  };

  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const handleDelete = () => {
    if (!deleteConfirm) { setDeleteConfirm(true); setTimeout(() => setDeleteConfirm(false), 4000); return; }
    trackEvent(EVENTS.SETTINGS_DATA_CLEARED);
    localStorage.clear();
    window.location.reload();
  };

  const joinDate = user.onboardingDate || new Date().toISOString();
  const joinMonth = new Date(joinDate).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { month: 'long', year: 'numeric' });

  return (
    <div className="bg-[#F1F8E9] min-h-screen scroll-container" style={{ paddingBottom: 'max(80px, calc(64px + env(safe-area-inset-bottom)))' }}>
      {/* Profile Card */}
      <div className="rounded-[20px] mx-4 mt-4 p-6" style={{ background: 'linear-gradient(135deg, #2E7D32, #388E3C)' }}>
        <div className="flex items-center gap-4">
          <div className="w-[60px] h-[60px] rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center">
            <span className="text-[28px] font-bold text-white">{user.name ? user.name.charAt(0).toUpperCase() : '🌾'}</span>
          </div>
          <div>
            <p className="text-xl font-bold text-white">{user.name || t(lang, 'dearFarmer')}</p>
            <p className="text-sm text-white/80">📍 {user.location?.city || 'Delhi'}{user.location?.state ? `, ${user.location.state}` : ''}</p>
            <p className="text-xs text-white/65">{t(lang, 'memberSince')} {joinMonth}</p>
          </div>
        </div>
      </div>

      {/* My Info */}
      <div className="mx-4 mt-4 bg-white rounded-2xl shadow-card overflow-hidden">
        <h3 className="text-base font-bold text-[#1A1A1A] px-4 pt-4 pb-2">{t(lang, 'myInfo')}</h3>
        <SettingsRow icon="👤" label={t(lang, 'name')} value={user.name || t(lang, 'setIt')} chevron />
        <SettingsRow icon="🌾" label={t(lang, 'crop')} value={user.crops?.map(c => getCropName(c, lang)).join(', ') || t(lang, 'setIt')} chevron />
        <SettingsRow icon="📍" label={t(lang, 'location')} value={user.location?.city || 'Delhi'} chevron onClick={() => setShowLocationPicker(true)} />
        <SettingsRow icon="🗣️" label={t(lang, 'language')} value={getLanguageName(lang)} chevron onClick={() => setShowLangPicker(!showLangPicker)} />
      </div>

      {/* Language Picker */}
      {showLangPicker && (
        <div className="mx-4 mt-2 bg-white rounded-2xl shadow-card p-4 animate-slide-down">
          {LANGUAGE_OPTIONS.map(l => (
            <button key={l.code} onClick={() => { updateUser({ language: l.code }); setShowLangPicker(false); }}
              className={`w-full text-left px-4 py-3 rounded-lg mb-1 tap-feedback ${lang === l.code ? 'bg-primary-50 text-primary-800 font-semibold' : 'text-[#1A1A1A]'}`}>
              {l.native} <span className="text-xs text-[#757575]">({l.english})</span>
            </button>
          ))}
        </div>
      )}

      {/* Location Picker */}
      {showLocationPicker && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'flex-end'
        }} onClick={() => setShowLocationPicker(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#FFFFFF', borderRadius: '24px 24px 0 0',
            padding: '24px 20px 40px', width: '100%'
          }}>
            <p style={{ fontSize: '20px', fontWeight: 700, color: '#1A1A1A', marginBottom: '20px' }}>
              📍 स्थान बदलें
            </p>

            <button onClick={() => { requestLocation(); setShowLocationPicker(false); }} style={{
              width: '100%', height: '56px', background: '#2E7D32', color: '#FFFFFF',
              border: 'none', borderRadius: '12px', fontSize: '17px', fontWeight: 600, cursor: 'pointer',
              marginBottom: '16px'
            }}>
              📍 मेरी वर्तमान लोकेशन
            </button>

            <p style={{ textAlign: 'center', color: '#757575', marginBottom: '16px' }}>— या —</p>

            <input
              value={cityInput}
              onChange={e => setCityInput(e.target.value)}
              placeholder="शहर का नाम लिखें... (जैसे: मेरठ)"
              style={{
                width: '100%', height: '52px', border: '2px solid #E0E0E0',
                borderRadius: '12px', padding: '0 16px', fontSize: '16px',
                boxSizing: 'border-box', outline: 'none'
              }}
              onFocus={e => e.target.style.border = '2px solid #2E7D32'}
              onBlur={e => e.target.style.border = '2px solid #E0E0E0'}
            />

            <button
              onClick={async () => {
                if (!cityInput.trim()) return;
                try {
                  const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityInput)}&format=json&limit=1`, { headers: { 'User-Agent': 'MonsoonMitra/1.0' } });
                  const data = await res.json();
                  if (data[0]) {
                    const loc = {
                      lat: parseFloat(data[0].lat),
                      lng: parseFloat(data[0].lon),
                      city: cityInput,
                      state: data[0].display_name.split(',').slice(-3, -2)[0]?.trim() || '',
                      country: 'India'
                    };
                    updateUser({ location: loc });
                    storage.set('user_location', loc);
                    storage.remove('weather_cache');
                    storage.remove('weather_cache_time');
                    setShowLocationPicker(false);
                    setCityInput('');
                    window.location.reload();
                  }
                } catch (e) { alert('शहर नहीं मिला। फिर कोशिश करें।'); }
              }}
              style={{
                width: '100%', height: '56px', background: '#FF8F00', color: '#FFFFFF',
                border: 'none', borderRadius: '12px', fontSize: '17px', fontWeight: 600,
                cursor: 'pointer', marginTop: '12px'
              }}
            >
              शहर खोजें
            </button>
          </div>
        </div>
      )}

      {/* Notifications */}
      <div className="mx-4 mt-4" style={{ background: '#FFFFFF', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '16px', overflow: 'hidden' }}>
        <p style={{ fontSize: '13px', fontWeight: 600, color: '#757575', padding: '12px 16px 8px', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          सूचनाएं
        </p>
        {[
          { key: 'flood', icon: '🌊', label: 'बाढ़ की चेतावनी' },
          { key: 'drought', icon: '🌡️', label: 'सूखे की चेतावनी' },
          { key: 'irrigation', icon: '💧', label: 'सिंचाई याददाश्त' },
          { key: 'weather', icon: '🌤️', label: 'मौसम अपडेट' },
        ].map(item => (
          <div key={item.key} style={{
            height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 16px', borderBottom: '1px solid #F0F0F0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '20px' }}>{item.icon}</span>
              <span style={{ fontSize: '15px', color: '#1A1A1A' }}>{item.label}</span>
            </div>
            <Toggle value={notifPrefs[item.key]} onChange={() => toggleNotif(item.key)} />
          </div>
        ))}
      </div>

      {/* App Info */}
      <div className="mx-4 mt-4 bg-white rounded-2xl shadow-card overflow-hidden">
        <h3 className="text-base font-bold text-[#1A1A1A] px-4 pt-4 pb-2">{t(lang, 'appInfo')}</h3>
        <SettingsRow icon="📱" label={t(lang, 'version')} value="1.0.0" />
        <SettingsRow icon="🔒" label={t(lang, 'privacyPolicy')} chevron onClick={() => window.open('/privacy', '_blank')} />
        <SettingsRow icon="📋" label={t(lang, 'termsOfService')} chevron onClick={() => window.open('/terms', '_blank')} />
        <SettingsRow icon="⭐" label={t(lang, 'rateApp')} chevron />
        <SettingsRow icon="📤" label={t(lang, 'shareApp')} chevron onClick={handleShare} />
        <SettingsRow icon="🐛" label={t(lang, 'reportBug')} chevron onClick={() => window.open('mailto:msabhishekanni10@gmail.com?subject=Bug Report - Monsoon Mitra')} />
      </div>

      {/* Danger Zone */}
      <div className="mx-4 mt-4 px-4">
        <button onClick={handleDelete} style={{
          width: '100%', height: '56px', marginTop: '24px', marginBottom: '80px',
          background: deleteConfirm ? '#C62828' : '#FFFFFF',
          border: `2px solid ${deleteConfirm ? '#C62828' : '#FFCDD2'}`,
          borderRadius: '12px', cursor: 'pointer',
          fontSize: '15px', fontWeight: 600,
          color: deleteConfirm ? '#FFFFFF' : '#C62828',
          transition: 'all 300ms ease'
        }}>
          {deleteConfirm ? '⚠️ पक्का? एक बार और दबाएं — डेटा चला जाएगा' : '🗑️ सभी डेटा हटाएं'}
        </button>
      </div>
    </div>
  );
}
