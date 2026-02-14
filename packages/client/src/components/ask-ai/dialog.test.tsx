import { act } from '@testing-library/react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it, vi } from 'vitest';
import { AskAIDialog } from './dialog';

const useAskAI = vi.fn();

vi.mock('@/hooks/useAskAI', () => ({
  useAskAI: () => useAskAI(),
}));

describe('AskAIDialog', () => {
  it('renders nothing when closed', () => {
    // arrange
    const container = document.createElement('div');
    const root = createRoot(container);
    useAskAI.mockReturnValue({ open: false, setOpen: vi.fn() });

    // act
    act(() => {
      root.render(<AskAIDialog />);
    });

    // assert
    expect(container.querySelector('[role="dialog"]')).toBeNull();
  });

  it('closes when overlay is clicked', () => {
    // arrange
    const container = document.createElement('div');
    const root = createRoot(container);
    const setOpen = vi.fn();
    useAskAI.mockReturnValue({ open: true, setOpen });

    // act
    act(() => {
      root.render(
        <AskAIDialog>
          <div data-testid="dialog-content">Content</div>
        </AskAIDialog>
      );
    });

    const overlay = container.querySelector('button[aria-label="Close dialog"]') as HTMLButtonElement;

    // act
    act(() => {
      overlay.click();
    });

    // assert
    expect(setOpen).toHaveBeenCalledWith(false);
  });
});
