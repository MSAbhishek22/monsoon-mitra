// src/pages/SavingsPage.jsx — Section 14 spec
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { t } from '../i18n/index';
import { storage } from '../utils/storage';
import { calculateTotalSavings, calculateMonthSavings, calculateWeekSavings, calculateWaterLitersSaved, getSkipCount } from '../utils/savingsCalculator';
import { trackEvent, EVENTS } from '../firebase/analytics';

export default function SavingsPage() {
  const { user } = useApp();
  const lang = user.language || 'hi';
  const irrigationLog = storage.get('irrigation_log', []);
  const total = storage.get('total_savings', 0) || calculateTotalSavings(irrigationLog);
  const month = calculateMonthSavings(irrigationLog);
  const week = calculateWeekSavings(irrigationLog);
  const count = getSkipCount(irrigationLog);
  const liters = calculateWaterLitersSaved(irrigationLog);
  const tankers = Math.floor(liters / 1000);
  const goal = storage.get('savings_goal', 5000);

  const [displayTotal, setDisplayTotal] = useState(0);
  useEffect(() => {
    // Track savings page view
    trackEvent(EVENTS.SAVINGS_VIEWED, { total_savings: total, skip_count: count });
    if (total <= 0) return;
    let current = 0;
    const inc = total / 60;
    const timer = setInterval(() => {
      current += inc;
      if (current >= total) { setDisplayTotal(total); clearInterval(timer); }
      else setDisplayTotal(Math.floor(current));
    }, 25);
    return () => clearInterval(timer);
  }, [total]);

  const pct = goal > 0 ? Math.min((total / goal) * 100, 100) : 0;

  return (
    <div className="bg-[#F1F8E9] min-h-screen pb-20">
      {/* Hero */}
      <div className="rounded-b-[32px] px-5 pt-6 pb-10" style={{ background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)' }}>
        <p className="text-base text-white/85">{t(lang, 'totalSavings')}</p>
        <p className="text-[52px] font-extrabold text-white mt-1">₹{displayTotal.toLocaleString('en-IN')}</p>
        <p className="text-sm text-white/70">{t(lang, 'toDate')}</p>
        <div className="flex justify-around mt-5 pt-5 border-t border-white/20">
          <div className="text-center"><p className="text-[22px] font-bold text-white">₹{month}</p><p className="text-xs text-white/70">{t(lang, 'thisMonth')}</p></div>
          <div className="text-center"><p className="text-[22px] font-bold text-white">₹{week}</p><p className="text-xs text-white/70">{t(lang, 'thisWeek')}</p></div>
          <div className="text-center"><p className="text-[22px] font-bold text-white">{count}</p><p className="text-xs text-white/70">{t(lang, 'timesSaved')}</p></div>
        </div>
      </div>

      {/* Irrigation Log */}
      <div className="mx-4 -mt-4 bg-white rounded-2xl p-5 relative z-10" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}>
        <h3 className="text-[17px] font-bold text-[#1A1A1A]">{t(lang, 'irrigationLog')}</h3>
        <button className="w-full h-14 mt-4 border-2 border-dashed border-primary-500 bg-primary-50 rounded-xl flex items-center justify-center text-[15px] font-semibold text-primary-800 tap-feedback">
          {t(lang, 'logIrrigation')}
        </button>
        {irrigationLog.length > 0 && (
          <div className="mt-4 space-y-0">
            {irrigationLog.slice(-5).reverse().map((entry, i) => (
              <div key={i} className="flex items-center justify-between h-16 border-b border-[#F5F5F5] py-3">
                <div><p className="text-sm font-bold text-[#1A1A1A]">{new Date(entry.timestamp).toLocaleDateString('hi-IN')}</p><p className="text-xs text-[#757575]">{entry.crop}</p></div>
                <p className="text-sm text-[#4A4A4A]">{entry.duration} {t(lang, 'hours')}</p>
                <p className="text-base font-bold text-primary-800">₹{entry.savings || 0}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Goal Progress */}
      <div className="mx-4 mt-4 bg-white rounded-2xl shadow-card p-5">
        <h3 className="text-[17px] font-bold text-[#1A1A1A]">{t(lang, 'monthGoal')}</h3>
        <div className="flex flex-col items-center mt-4">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#E0E0E0" strokeWidth="12" />
            <circle cx="60" cy="60" r="52" fill="none" stroke="#2E7D32" strokeWidth="12" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 52}`} strokeDashoffset={`${2 * Math.PI * 52 * (1 - pct / 100)}`}
              transform="rotate(-90 60 60)" style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
            <text x="60" y="60" textAnchor="middle" dominantBaseline="central" className="text-2xl font-bold fill-primary-800">{Math.round(pct)}%</text>
          </svg>
          <p className="text-[13px] text-[#757575] mt-2">₹{total} / ₹{goal}</p>
        </div>
      </div>

      {/* Water Savings */}
      <div className="mx-4 mt-4 mb-4 rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, #E3F2FD, #BBDEFB)' }}>
        <p className="text-[17px] font-bold text-sky-500">{t(lang, 'waterSaved')}</p>
        <p className="text-[28px] font-extrabold text-sky-500 mt-1">{liters.toLocaleString('en-IN')} {t(lang, 'liters')}</p>
        <p className="text-sm text-[#4A4A4A] mt-1">= {tankers} {t(lang, 'tankers')}</p>
        <p className="text-sm text-[#4A4A4A] italic mt-2">{t(lang, 'waterFunFact').replace('{x}', Math.floor(liters / 50))}</p>
      </div>
    </div>
  );
}
