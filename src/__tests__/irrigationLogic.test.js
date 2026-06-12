import { getIrrigationDecision } from '../utils/irrigationLogic';

describe('Irrigation Logic', () => {
  const defaultWeather = {
    rainProbabilityNext24h: 10,
    temperatureCelsius: 25,
    humidityPercent: 60,
  };

  it('should recommend skip if rain probability is very high', () => {
    const decision = getIrrigationDecision({ ...defaultWeather, rainProbabilityNext24h: 85 }, 'गेहूं');
    expect(decision.decision).toBe('skip');
    expect(decision.confidence).toBe('critical'); // Flood risk is critical
  });

  it('should recommend irrigate if no rain and hot', () => {
    const decision = getIrrigationDecision({ rainProbabilityNext24h: 5, temperatureCelsius: 38, humidityPercent: 40 }, 'default');
    expect(decision.decision).toBe('irrigate');
  });

  it('should handle missing weather data gracefully', () => {
    const decision = getIrrigationDecision(null, 'default');
    expect(decision.decision).toBe('irrigate'); // default fallback
  });
});
