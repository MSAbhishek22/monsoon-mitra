// src/pages/SavingsPage.jsx — Section 14 spec
import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { t } from '../i18n/index';
import { storage } from '../utils/storage';
import { calculateTotalSavings, calculateWaterLitersSaved } from '../utils/savingsCalculator';
import { trackEvent, EVENTS } from '../firebase/analytics';
import { useCountUp } from '../hooks/useCountUp';

function calcMonthSavings(log) {
  if (!Array.isArray(log)) return 0;
  const now = new Date();
  return log
    .filter(e => {
      if (!e.aiSaidSkip || !e.didSkip) return false;
      const d = new Date(e.date || e.timestamp);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, e) => s + (e.savings || 0), 0);
}

function calcWeekSavings(log) {
  if (!Array.isArray(log)) return 0;
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return log
    .filter(e => e.aiSaidSkip && e.didSkip && new Date(e.date || e.timestamp).getTime() >= weekAgo)
    .reduce((s, e) => s + (e.savings || 0), 0);
}

function getSkipCount(log) {
  if (!Array.isArray(log)) return 0;
  return log.filter(e => e.aiSaidSkip && e.didSkip).length;
}

export default function SavingsPage() {
  const { user } = useApp();
  const lang = user.language || 'hi';
  const [irrigationLog, setIrrigationLog] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('irrigation_log') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const reload = () => {
      try {
        setIrrigationLog(JSON.parse(localStorage.getItem('irrigation_log') || '[]'));
      } catch (_) {
        // ignore malformed storage data
      }
    };

    window.addEventListener('storage', reload);
    return () => window.removeEventListener('storage', reload);
  }, []);

  const total = calculateTotalSavings(irrigationLog);
  const month = calcMonthSavings(irrigationLog);
  const week = calcWeekSavings(irrigationLog);
  const count = getSkipCount(irrigationLog);
  const liters = calculateWaterLitersSaved(irrigationLog);
  const tankers = Math.floor(liters / 1000);
  const goal = storage.get('savings_goal') || 5000;

  const [showLogModal, setShowLogModal] = useState(false);
  const [logEntry, setLogEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    crop: (storage.get('user_crops') || ['गेहूं'])[0],
    durationHours: 3,
    aiSaidSkip: false,
    didSkip: false,
  });

  const CROP_SAVINGS = { 'गेहूं': 450, 'धान': 650, 'मक्का': 400, 'सब्जियां': 750, 'आलू': 500, 'टमाटर': 600, 'दाल': 350 };

  const saveIrrigationEntry = () => {
    const existing = storage.get('irrigation_log') || [];
    const entry = {
      id: `log_${Date.now()}`,
      date: new Date(logEntry.date).toISOString(),
      crop: logEntry.crop,
      durationHours: logEntry.durationHours,
      aiSaidSkip: logEntry.aiSaidSkip,
      didSkip: logEntry.didSkip,
      savings: logEntry.aiSaidSkip && logEntry.didSkip ? (CROP_SAVINGS[logEntry.crop] || 500) : 0,
    };
    storage.set('irrigation_log', [entry, ...existing]);
    setShowLogModal(false);
    window.location.reload();
  };

  const { current: displayTotal } = useCountUp(total);
  const pct = goal > 0 ? Math.min((total / goal) * 100, 100) : 0;

  useEffect(() => {
    trackEvent(EVENTS.SAVINGS_VIEWED, { total_savings: total, skip_count: count });
  }, [total, count]);

  return (
    <div className="bg-[#F1F8E9] min-h-screen pb-20 scroll-container" style={{ paddingBottom: 'max(80px, calc(64px + env(safe-area-inset-bottom)))' }}>
      {/* Hero */}
      <div className="rounded-b-[32px] px-5 pt-6 pb-10" style={{ background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)' }}>
        <p className="text-base text-white/85">{t(lang, 'totalSavings')}</p>
        <p className="text-[52px] font-extrabold text-white mt-1">₹{displayTotal.toLocaleString('en-IN')}</p>
        <p className="text-sm text-white/70">{t(lang, 'toDate')}</p>
        <div className="flex justify-around mt-5 pt-5 border-t border-white/20">
          <div className="text-center">
            <p className="text-[22px] font-bold text-white">₹{month}</p>
            <p className="text-xs text-white/70">{t(lang, 'thisMonth')}</p>
          </div>
          <div className="text-center">
            <p className="text-[22px] font-bold text-white">₹{week}</p>
            <p className="text-xs text-white/70">{t(lang, 'thisWeek')}</p>
          </div>
          <div className="text-center">
            <p className="text-[22px] font-bold text-white">{count}</p>
            <p className="text-xs text-white/70">{t(lang, 'timesSaved')}</p>
          </div>
        </div>
      </div>

      {/* Irrigation Log */}
      <div className="mx-4 -mt-4 bg-white rounded-2xl p-5 relative z-10" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}>
        <h3 className="text-[17px] font-bold text-[#1A1A1A]">{t(lang, 'irrigationLog')}</h3>
        <button onClick={() => setShowLogModal(true)} className="w-full h-14 mt-4 border-2 border-dashed border-primary-500 bg-primary-50 rounded-xl flex items-center justify-center text-[15px] font-semibold text-primary-800 tap-feedback">
          {t(lang, 'logIrrigation')}
        </button>
        {irrigationLog.length > 0 && (
          <div className="mt-4 space-y-0">
            {[...irrigationLog].reverse().slice(0, 7).map((entry, i) => (
              <div key={i} className="flex items-center justify-between h-16 border-b border-[#F5F5F5] py-3">
                <div>
                  <p className="text-sm font-bold text-[#1A1A1A]">
                    {new Date(entry.date || entry.timestamp).toLocaleDateString('hi-IN')}
                  </p>
                  <p className="text-xs text-[#757575]">{entry.crop}</p>
                </div>
                <p className="text-sm text-[#4A4A4A]">
                  {entry.aiSaidSkip ? '⏭️ छोड़ा' : `${entry.durationHours || 0}h`}
                </p>
                <p className={`text-base font-bold ${entry.savings > 0 ? 'text-primary-800' : 'text-[#757575]'}`}>
                  {entry.savings > 0 ? `₹${entry.savings}` : '—'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Goal Progress — SVG circular ring */}
      <div className="mx-4 mt-4 bg-white rounded-2xl shadow-card p-5">
        <h3 className="text-[17px] font-bold text-[#1A1A1A]">{t(lang, 'monthGoal')}</h3>
        <div className="flex flex-col items-center mt-4">
          <svg width="140" height="140" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r="58" fill="none" stroke="#E0E0E0" strokeWidth="14" />
            <circle
              cx="70" cy="70" r="58" fill="none" stroke="#2E7D32" strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 58}`}
              strokeDashoffset={`${2 * Math.PI * 58 * (1 - pct / 100)}`}
              transform="rotate(-90 70 70)"
              style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)' }}
            />
            <text x="70" y="66" textAnchor="middle" dominantBaseline="central"
              style={{ fontSize: '26px', fontWeight: 900, fill: '#2E7D32' }}>
              {Math.round(pct)}%
            </text>
            <text x="70" y="90" textAnchor="middle"
              style={{ fontSize: '11px', fill: '#757575' }}>
              लक्ष्य
            </text>
          </svg>
          <p className="text-[13px] text-[#757575] mt-2">₹{total.toLocaleString('en-IN')} / ₹{goal.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Water Savings */}
      <div className="mx-4 mt-4 mb-4 rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, #E3F2FD, #BBDEFB)' }}>
        <p className="text-[17px] font-bold text-sky-600">{t(lang, 'waterSaved')}</p>
        <p className="text-[32px] font-extrabold text-sky-600 mt-1">{liters.toLocaleString('en-IN')} {t(lang, 'liters')}</p>
        <p className="text-sm text-[#4A4A4A] mt-1">= {tankers} {t(lang, 'tankers')}</p>
        <p className="text-sm text-[#4A4A4A] italic mt-2">
          {t(lang, 'waterFunFact').replace('{x}', Math.max(1, Math.floor(liters / 50)))}
        </p>
      </div>

      {showLogModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
          zIndex: 500, display: 'flex', alignItems: 'flex-end'
        }} onClick={() => setShowLogModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#FFFFFF', borderRadius: '24px 24px 0 0',
            padding: '28px 20px 40px', width: '100%',
            boxShadow: '0 -8px 32px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <p style={{ fontSize: '20px', fontWeight: 700, color: '#0D1B0D', margin: 0 }}>💧 सिंचाई दर्ज करें</p>
              <button onClick={() => setShowLogModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#757575' }}>×</button>
            </div>

            <label style={{ fontSize: '14px', fontWeight: 600, color: '#2D4A2D', display: 'block', marginBottom: '8px' }}>तारीख</label>
            <input type="date" value={logEntry.date} onChange={e => setLogEntry(p => ({ ...p, date: e.target.value }))}
              style={{ width: '100%', height: '48px', border: '2px solid #C8E6C9', borderRadius: '10px', padding: '0 14px', fontSize: '16px', marginBottom: '16px', boxSizing: 'border-box', outline: 'none' }} />

            <label style={{ fontSize: '14px', fontWeight: 600, color: '#2D4A2D', display: 'block', marginBottom: '8px' }}>फसल</label>
            <select value={logEntry.crop} onChange={e => setLogEntry(p => ({ ...p, crop: e.target.value }))}
              style={{ width: '100%', height: '48px', border: '2px solid #C8E6C9', borderRadius: '10px', padding: '0 14px', fontSize: '16px', marginBottom: '16px', boxSizing: 'border-box', outline: 'none', background: '#fff' }}>
              {['गेहूं','धान','मक्का','सब्जियां','आलू','टमाटर','दाल','अन्य'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <label style={{ fontSize: '14px', fontWeight: 600, color: '#2D4A2D', display: 'block', marginBottom: '8px' }}>सिंचाई का समय: {logEntry.durationHours} घंटे</label>
            <input type="range" min="0.5" max="8" step="0.5" value={logEntry.durationHours}
              onChange={e => setLogEntry(p => ({ ...p, durationHours: parseFloat(e.target.value) }))}
              style={{ width: '100%', marginBottom: '16px', accentColor: '#2E7D32' }} />

            <label style={{ fontSize: '14px', fontWeight: 600, color: '#2D4A2D', display: 'block', marginBottom: '12px' }}>AI की सलाह</label>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              {[
                { label: '💧 पानी देने की सलाह', val: false },
                { label: '🌧️ बचाने की सलाह', val: true }
              ].map(opt => (
                <button key={String(opt.val)} onClick={() => setLogEntry(p => ({ ...p, aiSaidSkip: opt.val, didSkip: opt.val }))}
                  style={{
                    flex: 1, padding: '12px 8px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                    fontSize: '13px', fontWeight: 600,
                    background: logEntry.aiSaidSkip === opt.val ? '#2E7D32' : '#F1F8E9',
                    color: logEntry.aiSaidSkip === opt.val ? '#FFFFFF' : '#2E7D32',
                    transition: 'all 200ms ease'
                  }}>
                  {opt.label}
                </button>
              ))}
            </div>

            <button onClick={saveIrrigationEntry} style={{
              width: '100%', height: '56px', background: 'linear-gradient(135deg, #1B5E20, #2E7D32)',
              color: '#FFFFFF', border: 'none', borderRadius: '14px',
              fontSize: '17px', fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(27,94,32,0.4)'
            }}>
              ✅ सेव करें
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
