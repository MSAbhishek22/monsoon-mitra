// src/components/SavingsTracker.jsx — Savings snapshot on HomePage
import { t } from '../i18n/index';
import { storage } from '../utils/storage';
import { calculateTotalSavings } from '../utils/savingsCalculator';
import { useCountUp } from '../hooks/useCountUp';

export default function SavingsTracker({ language, onNavigate }) {
  const irrigationLog = storage.get('irrigation_log') || [];
  const totalSavings = calculateTotalSavings(irrigationLog);
  const goal = storage.get('savings_goal') || 5000;

  const { current: displayAmount } = useCountUp(totalSavings);
  const pct = goal > 0 ? Math.min((totalSavings / goal) * 100, 100) : 0;

  return (
    <div className="rounded-[20px] p-5 border-2 border-amber-600" style={{ background: 'linear-gradient(135deg, #FFF8E1, #FFFDE7)' }}>
      <h3 className="text-lg font-bold text-[#1A1A1A]">{t(language, 'yourSavings')}</h3>
      <p className="text-4xl font-extrabold text-primary-800 mt-2">₹{displayAmount.toLocaleString('en-IN')}</p>
      <p className="text-sm text-[#757575] mt-1">{t(language, 'thisMonthSavings')}</p>
      <div className="h-2 bg-[#E0E0E0] rounded mt-4 overflow-hidden">
        <div
          className="h-full rounded"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(to right, #4CAF50, #2E7D32)',
            transition: 'width 1.2s ease-out'
          }}
        />
      </div>
      <button
        onClick={() => onNavigate?.('savings')}
        className="text-sm font-semibold text-primary-800 mt-3 tap-feedback text-right block w-full"
      >
        {t(language, 'viewFullDetails')}
      </button>
    </div>
  );
}
