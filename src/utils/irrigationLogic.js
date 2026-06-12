// src/utils/irrigationLogic.js
// Irrigation decision engine per Section 21 spec

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

export function getIrrigationDecision(weatherData, cropType) {
  if (!weatherData) {
    return {
      decision: 'irrigate',
      reason: 'मौसम डेटा उपलब्ध नहीं — सामान्य सिंचाई करें',
      icon: '💧',
      color: '#2E7D32',
      savings: 0,
      confidence: 'low'
    };
  }

  const {
    rainProbabilityNext24h = 0,
    expectedRainfallMm = 0,
    temperatureCelsius = 30,
    humidityPercent = 50,
  } = weatherData;

  const isFloodRisk = rainProbabilityNext24h > 80;
  const isDroughtRisk = rainProbabilityNext24h < 10 && temperatureCelsius > 38;
  const isHotAndDry = temperatureCelsius > 35 && humidityPercent < 40;

  // Critical: Flood risk
  if (isFloodRisk) {
    return {
      decision: 'skip',
      reason: 'बाढ़ का खतरा',
      icon: '🚨',
      color: '#C62828',
      savings: calculateSavings(cropType),
      confidence: 'critical'
    };
  }

  // High rain probability
  if (rainProbabilityNext24h >= 50 || expectedRainfallMm >= 5) {
    return {
      decision: 'skip',
      reason: `${rainProbabilityNext24h}% बारिश की संभावना`,
      icon: '🌧️',
      color: '#0277BD',
      savings: calculateSavings(cropType),
      confidence: 'high'
    };
  }

  // Drought risk
  if (isDroughtRisk) {
    return {
      decision: 'irrigate',
      reason: 'सूखे की आशंका — अभी पानी दें',
      icon: '💧🌡️',
      color: '#E64A19',
      savings: 0,
      confidence: 'high'
    };
  }

  // Hot and dry
  if (isHotAndDry) {
    return {
      decision: 'irrigate',
      reason: 'गर्मी और शुष्कता — पानी दें',
      icon: '💧',
      color: '#2E7D32',
      savings: 0,
      confidence: 'medium'
    };
  }

  // Default
  return {
    decision: 'irrigate',
    reason: 'सामान्य सिंचाई का समय',
    icon: '💧',
    color: '#2E7D32',
    savings: 0,
    confidence: 'medium'
  };
}

export function getAlertLevel(weatherData) {
  if (!weatherData) return null;
  const { rainProbabilityNext24h = 0, temperatureCelsius = 30 } = weatherData;
  if (rainProbabilityNext24h > 80) return 'flood';
  if (temperatureCelsius > 40 && rainProbabilityNext24h < 5) return 'drought';
  return null;
}

export function calculateSavings(cropType) {
  return CROP_WATER_COST[cropType] || CROP_WATER_COST.default;
}
