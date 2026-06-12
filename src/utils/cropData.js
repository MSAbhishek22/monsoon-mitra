// src/utils/cropData.js
// Centralized crop definitions used across onboarding, settings, savings

export const CROPS = [
  { id: 'wheat', emoji: '🌾', hi: 'गेहूं', en: 'Wheat', bn: 'গম', mr: 'गहू', pa: 'ਕਣਕ' },
  { id: 'rice', emoji: '🌾', hi: 'धान', en: 'Rice', bn: 'ধান', mr: 'तांदूळ', pa: 'ਝੋਨਾ' },
  { id: 'pulses', emoji: '🫘', hi: 'दाल', en: 'Pulses', bn: 'ডাল', mr: 'डाळ', pa: 'ਦਾਲ' },
  { id: 'maize', emoji: '🌽', hi: 'मक्का', en: 'Maize', bn: 'ভুট্টা', mr: 'मका', pa: 'ਮੱਕੀ' },
  { id: 'vegetables', emoji: '🥕', hi: 'सब्जियां', en: 'Vegetables', bn: 'সবজি', mr: 'भाज्या', pa: 'ਸਬਜ਼ੀਆਂ' },
  { id: 'potato', emoji: '🥔', hi: 'आलू', en: 'Potato', bn: 'আলু', mr: 'बटाटा', pa: 'ਆਲੂ' },
  { id: 'tomato', emoji: '🍅', hi: 'टमाटर', en: 'Tomato', bn: 'টমেটো', mr: 'टोमॅटो', pa: 'ਟਮਾਟਰ' },
  { id: 'other', emoji: '➕', hi: 'अन्य', en: 'Other', bn: 'অন্যান্য', mr: 'इतर', pa: 'ਹੋਰ' },
];

export function getCropName(cropId, lang = 'hi') {
  const crop = CROPS.find(c => c.id === cropId);
  if (!crop) return cropId;
  return crop[lang] || crop.hi || crop.en;
}

export function getCropEmoji(cropId) {
  const crop = CROPS.find(c => c.id === cropId);
  return crop ? crop.emoji : '🌱';
}
