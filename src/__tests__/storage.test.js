import { storage } from '../utils/storage';

describe('Local Storage Utility', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should set and get values', () => {
    storage.set('test_key', { a: 1 });
    const val = storage.get('test_key');
    expect(val).toEqual({ a: 1 });
  });

  it('should return default value if key not found', () => {
    const val = storage.get('missing_key', 'default');
    expect(val).toBe('default');
  });

  it('should remove items', () => {
    storage.set('to_remove', 123);
    storage.remove('to_remove');
    expect(storage.get('to_remove')).toBeNull();
  });

  it('should clear all items', () => {
    storage.set('k1', 1);
    storage.set('k2', 2);
    storage.clear();
    expect(storage.get('k1')).toBeNull();
    expect(storage.get('k2')).toBeNull();
  });
});
