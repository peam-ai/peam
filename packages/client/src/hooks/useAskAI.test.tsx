// @vitest-environment happy-dom

import { AskAIContext, type AskAIContextValue } from '@/ask-ai/context';
import type { PromptInputMessage } from '@/components/ai-elements/prompt-input';
import type { ChatStatus, UIMessage } from 'ai';
import { act, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it, vi } from 'vitest';
import { useAskAI } from './useAskAI';

describe('useAskAI', () => {
  it('throws when used outside provider', () => {
    // arrange
    const container = document.createElement('div');
    const root = createRoot(container);
    const TestComponent = () => {
      useAskAI();
      return null;
    };

    // act
    const render = () => {
      act(() => {
        root.render(<TestComponent />);
      });
    };

    // assert
    expect(render).toThrow('AskAI components must be used within <AskAI.Root> or <AskAIProvider>.');

    root.unmount();
  });

  it('returns the context value from provider', () => {
    // arrange
    const container = document.createElement('div');
    const root = createRoot(container);
    const contextValue: AskAIContextValue = {
      open: false,
      setOpen: vi.fn(),
      toggleOpen: vi.fn(),
      input: 'Hello',
      setInput: vi.fn(),
      messages: [] as UIMessage[],
      status: 'ready' as ChatStatus,
      error: undefined,
      isLoading: false,
      sendMessage: vi.fn(),
      handleSubmit: vi.fn() as (message: PromptInputMessage) => void,
      regenerate: vi.fn(),
      clearMessages: vi.fn(),
    };
    const onValue = vi.fn<(value: AskAIContextValue) => void>();
    const TestComponent = ({ onValue }: { onValue: (value: AskAIContextValue) => void }) => {
      const value = useAskAI();
      useEffect(() => {
        onValue(value);
      }, [onValue, value]);
      return null;
    };

    // act
    act(() => {
      root.render(
        <AskAIContext.Provider value={contextValue}>
          <TestComponent onValue={onValue} />
        </AskAIContext.Provider>
      );
    });

    // assert
    expect(onValue).toHaveBeenCalledWith(contextValue);

    root.unmount();
  });
});
