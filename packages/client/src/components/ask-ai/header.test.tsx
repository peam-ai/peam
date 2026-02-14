import { act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it, vi } from 'vitest';
import { AskAIHeader } from './header';

const useAskAI = vi.fn();

vi.mock('@/hooks/useAskAI', () => ({
  useAskAI: () => useAskAI(),
}));

vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TooltipTrigger: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TooltipContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

describe('AskAIHeader', () => {
  it('shows delete action and clears messages', () => {
    // arrange
    const container = document.createElement('div');
    const root = createRoot(container);
    const clearMessages = vi.fn();
    const setOpen = vi.fn();

    useAskAI.mockReturnValue({
      setOpen,
      clearMessages,
      isLoading: false,
      messages: [{ id: 'm1' }],
    });

    // act
    act(() => {
      root.render(<AskAIHeader />);
    });

    const deleteButton = container.querySelector('button[aria-label="Delete conversation"]') as HTMLButtonElement;

    // act
    act(() => {
      deleteButton.click();
    });

    // assert
    expect(clearMessages).toHaveBeenCalledTimes(1);
  });

  it('closes when close button is clicked and hides delete when loading', () => {
    // arrange
    const container = document.createElement('div');
    const root = createRoot(container);
    const clearMessages = vi.fn();
    const setOpen = vi.fn();

    useAskAI.mockReturnValue({
      setOpen,
      clearMessages,
      isLoading: true,
      messages: [{ id: 'm1' }],
    });

    // act
    act(() => {
      root.render(<AskAIHeader />);
    });

    const deleteButton = container.querySelector('button[aria-label="Delete conversation"]');
    const closeButton = container.querySelector('button[aria-label="Close"]') as HTMLButtonElement;

    // act
    act(() => {
      closeButton.click();
    });

    // assert
    expect(deleteButton).toBeNull();
    expect(setOpen).toHaveBeenCalledWith(false);
  });
});
