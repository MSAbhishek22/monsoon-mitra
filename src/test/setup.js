import '@testing-library/jest-dom';
import { vi } from 'vitest';

const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = String(value); }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

global.Notification = { permission: 'default', requestPermission: vi.fn().mockResolvedValue('granted') };

Object.defineProperty(navigator, 'geolocation', {
  value: { getCurrentPosition: vi.fn((success) => success({ coords: { latitude: 28.6139, longitude: 77.2090 } })) }
});

Object.defineProperty(navigator, 'onLine', { value: true, writable: true });

global.fetch = vi.fn();

vi.spyOn(console, 'error').mockImplementation(() => {});
vi.spyOn(console, 'warn').mockImplementation(() => {});
