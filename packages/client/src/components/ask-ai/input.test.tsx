import { act, render } from '@testing-library/react';
import type { ReactNode, TextareaHTMLAttributes } from 'react';
import { forwardRef, useEffect } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AskAIInput } from './input';

const useAskAI = vi.fn();
const textareaHandlers = vi.hoisted(() => ({
  onChange: undefined as ((event: { currentTarget: { value: string } }) => void) | undefined,
}));

vi.mock('@/hooks/useAskAI', () => ({
  useAskAI: () => useAskAI(),
}));

vi.mock('@/components/ai-elements/prompt-input', () => ({
  PromptInput: ({ onSubmit, children }: { onSubmit?: (message: { text: string }) => void; children: ReactNode }) => (
    <form
      data-testid="prompt-input"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.({ text: 'submitted' });
      }}
    >
      {children}
    </form>
  ),
  PromptInputBody: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  PromptInputFooter: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  PromptInputTools: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  PromptInputTextarea: (() => {
    const Component = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>((props, ref) => {
      useEffect(() => {
        textareaHandlers.onChange = props.onChange as
          | ((event: { currentTarget: { value: string } }) => void)
          | undefined;
        return () => {
          textareaHandlers.onChange = undefined;
        };
      }, [props]);

      return <textarea ref={ref} {...props} />;
    });
    Component.displayName = 'MockPromptInputTextarea';
    return Component;
  })(),
  PromptInputSubmit: ({ disabled }: { disabled?: boolean }) => (
    <button type="submit" data-testid="prompt-submit" disabled={disabled} />
  ),
}));

vi.mock('@/components/ai-elements/speech-input', () => ({
  SpeechInput: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

describe('AskAIInput', () => {
  it('updates input value on change', () => {
    // arrange
    const setInput = vi.fn();

    useAskAI.mockReturnValue({
      input: '',
      setInput,
      status: 'ready',
      handleSubmit: vi.fn(),
    });

    const { container, unmount } = render(<AskAIInput />);

    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;

    // act
    act(() => {
      textarea.value = 'Hello';
      textareaHandlers.onChange?.({ currentTarget: { value: 'Hello' } });
    });

    // assert
    expect(setInput).toHaveBeenCalledWith('Hello');

    // act
    unmount();
  });

  it('submits message through handleSubmit', () => {
    // arrange
    const handleSubmit = vi.fn();

    useAskAI.mockReturnValue({
      input: 'Hello',
      setInput: vi.fn(),
      status: 'ready',
      handleSubmit,
    });

    const { container, unmount } = render(<AskAIInput />);

    const form = container.querySelector('[data-testid="prompt-input"]') as HTMLFormElement;

    // act
    act(() => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });

    // assert
    expect(handleSubmit).toHaveBeenCalledWith({ text: 'submitted' });

    // act
    unmount();
  });

  it('disables submit when input is empty and not streaming', () => {
    // arrange
    useAskAI.mockReturnValue({
      input: '',
      setInput: vi.fn(),
      status: 'ready',
      handleSubmit: vi.fn(),
    });

    const { container, unmount } = render(<AskAIInput />);

    const submitButton = container.querySelector('[data-testid="prompt-submit"]') as HTMLButtonElement;

    // assert
    expect(submitButton.disabled).toBe(true);

    // act
    unmount();
  });
});
