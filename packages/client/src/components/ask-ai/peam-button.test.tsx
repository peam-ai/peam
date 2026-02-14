import { act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it, vi } from 'vitest';
import { PeamButton } from './peam-button';

vi.mock('@/components/icons/peam', () => ({
  PeamIcon: () => <span data-testid="peam-icon" />,
  PeamCloseIcon: () => <span data-testid="peam-close-icon" />,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: { children: ReactNode }) => <button {...props}>{children}</button>,
}));

vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TooltipTrigger: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TooltipContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

describe('PeamButton', () => {
  it('renders label variant with open state', () => {
    // arrange
    const container = document.createElement('div');
    const root = createRoot(container);

    // act
    act(() => {
      root.render(<PeamButton isOpen />);
    });

    const button = container.querySelector('button') as HTMLButtonElement;

    // assert
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(button.textContent).toContain('Close');
  });

  it('renders icon-only variant and uses close icon when open', () => {
    // arrange
    const container = document.createElement('div');
    const root = createRoot(container);

    // act
    act(() => {
      root.render(<PeamButton isOpen variant="icon" />);
    });

    // assert
    expect(container.querySelector('[data-testid="peam-close-icon"]')).toBeTruthy();
  });
});
