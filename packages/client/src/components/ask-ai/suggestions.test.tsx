import { act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it, vi } from 'vitest';
import { AskAISuggestions } from './suggestions';

const useAskAI = vi.fn();

vi.mock('@/hooks/useAskAI', () => ({
  useAskAI: () => useAskAI(),
}));

vi.mock('@/components/ai-elements/suggestion', () => ({
  Suggestions: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Suggestion: ({ suggestion, onClick }: { suggestion: string; onClick?: (value: string) => void }) => (
    <button type="button" data-testid="suggestion" onClick={() => onClick?.(suggestion)}>
      {suggestion}
    </button>
  ),
}));

describe('AskAISuggestions', () => {
  it('renders default prompts and sends messages on click', () => {
    // arrange
    const container = document.createElement('div');
    const root = createRoot(container);
    const sendMessage = vi.fn();

    useAskAI.mockReturnValue({
      messages: [],
      error: undefined,
      isLoading: false,
      sendMessage,
    });

    // act
    act(() => {
      root.render(<AskAISuggestions />);
    });

    const buttons = container.querySelectorAll('button[data-testid="suggestion"]');

    // act
    act(() => {
      (buttons[0] as HTMLButtonElement).click();
    });

    // assert
    expect(sendMessage).toHaveBeenCalledWith({ text: 'Summarize this page' });
  });

  it('renders when onlyWhenEmpty is false and uses custom handler', () => {
    // arrange
    const container = document.createElement('div');
    const root = createRoot(container);
    const sendMessage = vi.fn();
    const onPromptClick = vi.fn();

    useAskAI.mockReturnValue({
      messages: [{ id: 'm1' }],
      error: undefined,
      isLoading: false,
      sendMessage,
    });

    // act
    act(() => {
      root.render(<AskAISuggestions prompts={['Hello']} onlyWhenEmpty={false} onPromptClick={onPromptClick} />);
    });

    const button = container.querySelector('button[data-testid="suggestion"]') as HTMLButtonElement;

    // act
    act(() => {
      button.click();
    });

    // assert
    expect(onPromptClick).toHaveBeenCalledWith('Hello');
    expect(sendMessage).not.toHaveBeenCalled();
  });
});
