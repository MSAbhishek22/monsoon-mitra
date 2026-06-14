export function seedDemoData() {
  const SAVINGS = { 'गेहूं': 450, 'धान': 650, 'मक्का': 400, 'सब्जियां': 750, 'आलू': 500 };
  const crops = ['गेहूं', 'धान', 'सब्जियां', 'आलू'];
  const log = [];

  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const aiSaidSkip = Math.random() > 0.4;
    const didSkip = aiSaidSkip && Math.random() > 0.2;
    const crop = crops[i % crops.length];
    log.push({
      id: `demo_${i}`,
      date: date.toISOString(),
      crop,
      durationHours: didSkip ? 0 : 2 + (i % 4),
      aiSaidSkip,
      didSkip,
      savings: (aiSaidSkip && didSkip) ? (SAVINGS[crop] || 500) : 0,
    });
  }

  localStorage.setItem('irrigation_log', JSON.stringify(log));
  localStorage.setItem('demo_seeded', 'true');
  window.dispatchEvent(new StorageEvent('storage', { key: 'irrigation_log' }));
}
