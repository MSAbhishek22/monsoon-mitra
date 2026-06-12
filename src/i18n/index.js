// src/i18n/index.js — i18n system
import hi from './hi';
import en from './en';
import bn from './bn';
import mr from './mr';
import pa from './pa';

const languages = { hi, en, bn, mr, pa };

export const LANGUAGE_OPTIONS = [
  { code: 'hi', native: 'हिन्दी', english: 'Hindi' },
  { code: 'en', native: 'English', english: 'English' },
  { code: 'bn', native: 'বাংলা', english: 'Bengali' },
  { code: 'mr', native: 'मराठी', english: 'Marathi' },
  { code: 'pa', native: 'ਪੰਜਾਬੀ', english: 'Punjabi' },
];

export function t(lang = 'hi', key) {
  return languages[lang]?.[key] ?? languages.hi[key] ?? key;
}

export function getLanguageName(code) {
  const lang = LANGUAGE_OPTIONS.find(l => l.code === code);
  return lang ? lang.native : code;
}

export default languages;
