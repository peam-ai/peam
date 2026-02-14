import { act } from '@testing-library/react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it, vi } from 'vitest';
import { AskAISidepane } from './sidepane';

const useAskAI = vi.fn();

vi.mock('@/hooks/useAskAI', () => ({
  useAskAI: () => useAskAI(),
}));

describe('AskAISidepane', () => {
  it('renders nothing when closed', () => {
    // arrange
    const container = document.createElement('div');
    const root = createRoot(container);
    useAskAI.mockReturnValue({ open: false, setOpen: vi.fn() });

    // act
    act(() => {
      root.render(<AskAISidepane />);
    });

    // assert
    expect(container.querySelector('[role="dialog"]')).toBeNull();
  });

  it('closes when overlay is clicked and renders children', () => {
    // arrange
    const container = document.createElement('div');
    const root = createRoot(container);
    const setOpen = vi.fn();
    useAskAI.mockReturnValue({ open: true, setOpen });

    // act
    act(() => {
      root.render(
        <AskAISidepane>
          <div data-testid="sidepane-content">Content</div>
        </AskAISidepane>
      );
    });

    const overlay = container.querySelector('div[aria-hidden="true"]') as HTMLDivElement;

    // act
    act(() => {
      overlay.click();
    });

    // assert
    expect(setOpen).toHaveBeenCalledWith(false);
    expect(container.querySelector('[data-testid="sidepane-content"]')).toBeTruthy();
  });
});
