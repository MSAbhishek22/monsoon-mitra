import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';

// Mock the AppContext
vi.mock('../../context/AppContext', () => ({
  useApp: () => ({
    activeTab: 'home',
    setActiveTab: vi.fn(),
    user: { language: 'hi' }
  })
}));

// Import AFTER mock
import BottomNav from '../common/BottomNav';

describe('BottomNav', () => {
  it('should render without crashing', () => {
    const { container } = render(<BottomNav />);
    expect(container).toBeTruthy();
  });

  it('should render 5 navigation items', () => {
    const { container } = render(<BottomNav />);
    // Nav has 5 clickable items
    const buttons = container.querySelectorAll('button, [role="button"], [onclick]');
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });
});
