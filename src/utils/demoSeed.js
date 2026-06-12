import { storage } from './storage';

export function seedDemoData() {
  const alreadySeeded = storage.get('demo_seeded');
  if (alreadySeeded) return;

  // Seed irrigation log with 15 days of history
  const crops = ['गेहूं', 'धान', 'सब्जियां'];
  const log = [];
  
  for (let i = 14; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const aiSaidSkip = [true, true, false, true, false][i % 5];
    const didSkip = aiSaidSkip;
    const crop = crops[i % 3];
    const savingsMap = { 'गेहूं': 450, 'धान': 650, 'सब्जियां': 750 };
    
    log.push({
      id: `log_${i}`,
      date: date.toISOString(),
      crop,
      durationHours: aiSaidSkip ? 0 : 3 + (i % 3),
      aiSaidSkip,
      didSkip,
      savings: aiSaidSkip ? savingsMap[crop] : 0
    });
  }
  
  storage.set('irrigation_log', log);
  storage.set('demo_seeded', 'true');
  storage.set('ai_message_count', '5');
}

export function clearDemoData() {
  storage.remove('irrigation_log');
  storage.remove('demo_seeded');
  storage.remove('ai_message_count');
}
