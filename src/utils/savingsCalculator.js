// src/utils/savingsCalculator.js
// Savings calculation utilities per Section 21 spec

const CROP_WATER_COST = {
  'गेहूं': 450,
  'धान': 650,
  'मक्का': 400,
  'सब्जियां': 750,
  'आलू': 500,
  'टमाटर': 600,
  'दाल': 350,
  'default': 500
};

export function calculateSavings(cropType) {
  const base = CROP_WATER_COST[cropType] || CROP_WATER_COST.default;
  return base;
}

export function calculateTotalSavings(irrigationLog) {
  if (!Array.isArray(irrigationLog)) return 0;
  return irrigationLog
    .filter(entry => entry.aiSaidSkip && entry.didSkip)
    .reduce((sum, entry) => sum + (entry.savings || 0), 0);
}

export function calculateWaterLitersSaved(irrigationLog) {
  if (!Array.isArray(irrigationLog)) return 0;
  const skipEvents = irrigationLog.filter(entry => entry.aiSaidSkip && entry.didSkip);
  return skipEvents.length * 8000; // ~8000 liters per irrigation cycle for 1 acre
}

export function calculateMonthSavings(irrigationLog) {
  if (!Array.isArray(irrigationLog)) return 0;
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  return irrigationLog
    .filter(entry => entry.aiSaidSkip && entry.didSkip && entry.timestamp >= monthStart)
    .reduce((sum, entry) => sum + (entry.savings || 0), 0);
}

export function calculateWeekSavings(irrigationLog) {
  if (!Array.isArray(irrigationLog)) return 0;
  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  return irrigationLog
    .filter(entry => entry.aiSaidSkip && entry.didSkip && entry.timestamp >= weekAgo)
    .reduce((sum, entry) => sum + (entry.savings || 0), 0);
}

export function getSkipCount(irrigationLog) {
  if (!Array.isArray(irrigationLog)) return 0;
  return irrigationLog.filter(entry => entry.aiSaidSkip && entry.didSkip).length;
}
