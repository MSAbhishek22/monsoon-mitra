// src/pages/SettingsPage.jsx — Section 15 spec
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { t, getLanguageName, LANGUAGE_OPTIONS } from '../i18n/index';
import { ToggleSwitch, SettingsRow } from '../components/SettingsPanel';
import { getCropName } from '../utils/cropData';
import { trackEvent, EVENTS } from '../firebase/analytics';

export default function SettingsPage() {
  const { user, updateUser, notificationSettings, updateNotificationSettings, clearAllData, onboardingComplete } = useApp();
  const lang = user.language || 'hi';
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);

  const handleShare = async () => {
    trackEvent('app_shared');
    
    const shareData = {
      title: 'Monsoon Mitra — किसान का डिजिटल साथी',
      text: 'खेती के लिए AI सहायक। मौसम, सिंचाई, फसल सुरक्षा — सब हिंदी में। मुफ्त डाउनलोड करें!',
      url: 'https://monsoonmitra.vercel.app'
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') {
          navigator.clipboard?.writeText(shareData.url);
        }
      }
    } else {
      navigator.clipboard?.writeText(shareData.url);
      alert('लिंक कॉपी हो गया! दोस्तों को भेजें।');
    }
  };

  const joinDate = user.onboardingDate || new Date().toISOString();
  const joinMonth = new Date(joinDate).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { month: 'long', year: 'numeric' });

  return (
    <div className="bg-[#F1F8E9] min-h-screen pb-20">
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
        <SettingsRow icon="📍" label={t(lang, 'location')} value={user.location?.city || 'Delhi'} chevron />
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

      {/* Notifications */}
      <div className="mx-4 mt-4 bg-white rounded-2xl shadow-card overflow-hidden">
        <h3 className="text-base font-bold text-[#1A1A1A] px-4 pt-4 pb-2">{t(lang, 'notifications')}</h3>
        {[
          { key: 'flood', icon: '🔔', label: t(lang, 'floodAlert') },
          { key: 'drought', icon: '🔔', label: t(lang, 'droughtAlert') },
          { key: 'irrigation', icon: '🔔', label: t(lang, 'irrigationReminder') },
          { key: 'weather', icon: '🔔', label: t(lang, 'weatherUpdate') },
        ].map(item => (
          <div key={item.key} className="flex items-center justify-between h-14 px-4 border-b border-[#F0F0F0]">
            <div className="flex items-center gap-3">
              <span className="text-xl">{item.icon}</span>
              <span className="text-[15px] text-[#1A1A1A]">{item.label}</span>
            </div>
            <ToggleSwitch value={notificationSettings[item.key]} onChange={(v) => updateNotificationSettings(item.key, v)} />
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
      <div className="mx-4 mt-4 mb-8">
        <button onClick={() => setShowDeleteConfirm(true)} className="w-full h-14 text-danger-700 font-semibold text-base tap-feedback">
          🗑️ {t(lang, 'deleteAllData')}
        </button>
      </div>

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white rounded-2xl p-6 mx-6 max-w-sm animate-scale-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">{t(lang, 'deleteConfirm')}</h3>
            <p className="text-sm text-[#4A4A4A] mb-6">{t(lang, 'deleteConfirm2')}</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 h-12 rounded-xl border-2 border-[#E0E0E0] font-semibold tap-feedback">{t(lang, 'cancel')}</button>
              <button onClick={() => { clearAllData(); window.location.reload(); }} className="flex-1 h-12 rounded-xl bg-danger-700 text-white font-semibold tap-feedback">{t(lang, 'yes')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
