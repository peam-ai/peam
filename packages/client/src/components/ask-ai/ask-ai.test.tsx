import { act } from '@testing-library/react';
import type { ChatStatus } from 'ai';
import type { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it, vi } from 'vitest';
import { AskAI } from './ask-ai';
import { AskAIContext } from './context';

const useDarkMode = vi.fn();
const AskAIRoot = vi.fn(({ children }: { children?: ReactNode }) => <div>{children}</div>);

vi.mock('@/hooks/useDarkMode', () => ({
  useDarkMode: () => useDarkMode(),
}));

vi.mock('@/ask-ai/root', () => ({
  AskAIRoot: (props: { children?: ReactNode }) => AskAIRoot(props),
}));

vi.mock('@/ask-ai/trigger', () => ({
  AskAITrigger: () => <div data-testid="trigger" />,
}));

vi.mock('@/ask-ai/dialog', () => ({
  AskAIDialog: () => <div data-testid="dialog" />,
}));

vi.mock('@/ask-ai/shadow-root-host', () => ({
  ShadowRootHost: ({ className, children }: { className?: string; children: React.ReactNode }) => (
    <div data-testid="shadow-root" className={className}>
      {children}
    </div>
  ),
}));

describe('AskAI', () => {
  it('renders trigger and dialog inside root when no children provided', () => {
    // arrange
    const container = document.createElement('div');
    const root = createRoot(container);
    useDarkMode.mockReturnValue(false);

    // act
    act(() => {
      root.render(<AskAI />);
    });

    // assert
    expect(container.querySelector('[data-testid="trigger"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="dialog"]')).toBeTruthy();
    expect(AskAIRoot).toHaveBeenCalled();
  });

  it('reuses existing context when configured and applies dark mode class', () => {
    // arrange
    const container = document.createElement('div');
    const root = createRoot(container);
    useDarkMode.mockReturnValue(true);
    AskAIRoot.mockClear();

    const contextValue = {
      open: false,
      setOpen: vi.fn(),
      toggleOpen: vi.fn(),
      input: '',
      setInput: vi.fn(),
      messages: [],
      status: 'ready' as ChatStatus,
      error: undefined,
      isLoading: false,
      sendMessage: vi.fn(),
      handleSubmit: vi.fn(),
      regenerate: vi.fn(),
      clearMessages: vi.fn(),
    };

    // act
    act(() => {
      root.render(
        <AskAIContext.Provider value={contextValue}>
          <AskAI reuseContext />
        </AskAIContext.Provider>
      );
    });

    const shadowRoot = container.querySelector('[data-testid="shadow-root"]') as HTMLDivElement;

    // assert
    expect(shadowRoot.className).toContain('dark');
    expect(AskAIRoot).not.toHaveBeenCalled();
    expect(container.querySelector('[data-testid="trigger"]')).toBeTruthy();
  });
});
