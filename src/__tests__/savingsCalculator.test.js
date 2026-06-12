import { calculateTotalSavings, calculateWaterLitersSaved } from '../utils/savingsCalculator';

describe('Savings Calculator', () => {
  const sampleLog = [
    { aiSaidSkip: true, didSkip: true, savings: 500, duration: 2, timestamp: Date.now() },
    { aiSaidSkip: true, didSkip: true, savings: 300, duration: 1, timestamp: Date.now() - 86400000 },
    { aiSaidSkip: false, didSkip: false, savings: 0, duration: 1, timestamp: Date.now() },
  ];

  it('should calculate total savings correctly', () => {
    const total = calculateTotalSavings(sampleLog);
    expect(total).toBe(800);
  });

  it('should calculate zero for empty log', () => {
    expect(calculateTotalSavings([])).toBe(0);
  });

  it('should calculate water saved correctly (avg 5000L per hr)', () => {
    // 2 skip events * 8000 = 16000
    expect(calculateWaterLitersSaved(sampleLog)).toBe(16000);
  });
});
