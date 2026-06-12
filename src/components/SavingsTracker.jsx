// src/components/SavingsTracker.jsx — Section 8 savings snapshot
import React, { useState, useEffect } from 'react';
import { t } from '../i18n/index';
import { storage } from '../utils/storage';

export default function SavingsTracker({ language, onNavigate }) {
  const [displayAmount, setDisplayAmount] = useState(0);
  const totalSavings = storage.get('total_savings', 0);
  const goal = storage.get('savings_goal', 5000);

  useEffect(() => {
    if (totalSavings <= 0) return;
    let current = 0;
    const increment = totalSavings / 60;
    const timer = setInterval(() => {
      current += increment;
      if (current >= totalSavings) { setDisplayAmount(totalSavings); clearInterval(timer); }
      else setDisplayAmount(Math.floor(current));
    }, 25);
    return () => clearInterval(timer);
  }, [totalSavings]);

  const pct = goal > 0 ? Math.min((totalSavings / goal) * 100, 100) : 0;

  return (
    <div className="rounded-[20px] p-5 border-2 border-amber-600" style={{ background: 'linear-gradient(135deg, #FFF8E1, #FFFDE7)' }}>
      <h3 className="text-lg font-bold text-[#1A1A1A]">{t(language, 'yourSavings')}</h3>
      <p className="text-4xl font-extrabold text-primary-800 mt-2">₹{displayAmount.toLocaleString('en-IN')}</p>
      <p className="text-sm text-[#757575] mt-1">{t(language, 'thisMonthSavings')}</p>
      <div className="h-2 bg-[#E0E0E0] rounded mt-4 overflow-hidden">
        <div className="h-full rounded" style={{ width: `${pct}%`, background: 'linear-gradient(to right, #4CAF50, #2E7D32)', transition: 'width 1s ease-out' }} />
      </div>
      <button onClick={() => onNavigate?.('savings')} className="text-sm font-semibold text-primary-800 mt-3 tap-feedback text-right block w-full">
        {t(language, 'viewFullDetails')}
      </button>
    </div>
  );
}
