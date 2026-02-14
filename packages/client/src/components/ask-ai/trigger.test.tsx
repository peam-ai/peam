import { act } from '@testing-library/react';
import type { MouseEvent, ReactElement } from 'react';
import { cloneElement } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it, vi } from 'vitest';
import { AskAITrigger } from './trigger';

const useAskAI = vi.fn();

vi.mock('@/hooks/useAskAI', () => ({
  useAskAI: () => useAskAI(),
}));

vi.mock('@/ask-ai/peam-button', () => ({
  PeamButton: ({ onClick, isOpen }: { onClick?: () => void; isOpen: boolean }) => (
    <button data-testid="peam-button" aria-expanded={isOpen} onClick={onClick} />
  ),
}));

vi.mock('@radix-ui/react-slot', () => ({
  Slot: ({ children, ...props }: { children: ReactElement }) => (children ? cloneElement(children, props) : null),
}));

describe('AskAITrigger', () => {
  it('renders default button and toggles open on click', () => {
    // arrange
    const container = document.createElement('div');
    const root = createRoot(container);
    const toggleOpen = vi.fn();
    useAskAI.mockReturnValue({ open: false, toggleOpen });

    // act
    act(() => {
      root.render(<AskAITrigger />);
    });

    const button = container.querySelector('[data-testid="peam-button"]') as HTMLButtonElement;

    // act
    act(() => {
      button.click();
    });

    // assert
    expect(toggleOpen).toHaveBeenCalledTimes(1);
  });

  it('does not toggle when custom handler prevents default', () => {
    // arrange
    const container = document.createElement('div');
    const root = createRoot(container);
    const toggleOpen = vi.fn();
    const onClick = vi.fn((event: MouseEvent) => {
      event.preventDefault();
    });

    useAskAI.mockReturnValue({ open: false, toggleOpen });

    // act
    act(() => {
      root.render(
        <AskAITrigger asChild onClick={onClick}>
          <button type="button">Open</button>
        </AskAITrigger>
      );
    });

    const button = container.querySelector('button') as HTMLButtonElement;

    // act
    act(() => {
      button.click();
    });

    // assert
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(toggleOpen).not.toHaveBeenCalled();
  });
});
