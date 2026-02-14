import { act } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { useContext, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AskAIContext } from './context';
import { AskAIRoot } from './root';

const useChat = vi.hoisted(() => vi.fn());
const useChatPersistence = vi.hoisted(() => vi.fn());

vi.mock('@ai-sdk/react', () => ({
  useChat: (...args: unknown[]) => useChat(...args),
}));

vi.mock('@/hooks/useChatPersistence', () => ({
  useChatPersistence: (...args: unknown[]) => useChatPersistence(...args),
}));

vi.mock('@/lib/BoundedChatTransport', () => ({
  BoundedChatTransport: vi.fn(),
}));

describe('AskAIRoot', () => {
  beforeEach(() => {
    useChat.mockReset();
    useChatPersistence.mockReset();
  });

  const renderWithConsumer = (props?: ComponentProps<typeof AskAIRoot>) => {
    const container = document.createElement('div');
    const root = createRoot(container);
    const onValue = vi.fn();

    const Consumer = () => {
      const value = useContext(AskAIContext);
      useEffect(() => {
        if (value) {
          onValue(value);
        }
      }, [value]);
      return null;
    };

    act(() => {
      root.render(
        <AskAIRoot {...props}>
          <Consumer />
        </AskAIRoot>
      );
    });

    return { container, root, onValue };
  };

  describe('sendMessage()', () => {
    it('sends messages with metadata and empty body when no summary', () => {
      // arrange
      const rawSendMessage = vi.fn();
      const setMessages = vi.fn();
      const regenerate = vi.fn();

      useChat.mockReturnValue({
        messages: [],
        sendMessage: rawSendMessage,
        status: 'ready',
        error: undefined,
        regenerate,
        setMessages,
      });

      useChatPersistence.mockReturnValue({
        initialMessages: [],
        isLoading: false,
        saveMessages: vi.fn(),
        clearMessages: vi.fn(),
        saveSummary: vi.fn(),
        summary: undefined,
        lastSummarizedMessageId: undefined,
      });

      // act
      const { onValue } = renderWithConsumer();
      const context = onValue.mock.calls[onValue.mock.calls.length - 1][0];
      act(() => {
        context.sendMessage({ text: 'Hello' });
      });

      // assert
      expect(rawSendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'Hello',
          metadata: {
            currentPage: {
              title: document.title,
              origin: window.location.origin,
              path: window.location.pathname,
            },
          },
        }),
        {
          body: {},
        }
      );
    });

    it('includes summary in request body when available', () => {
      // arrange
      const rawSendMessage = vi.fn();

      useChat.mockReturnValue({
        messages: [],
        sendMessage: rawSendMessage,
        status: 'ready',
        error: undefined,
        regenerate: vi.fn(),
        setMessages: vi.fn(),
      });

      useChatPersistence.mockReturnValue({
        initialMessages: [],
        isLoading: false,
        saveMessages: vi.fn(),
        clearMessages: vi.fn(),
        saveSummary: vi.fn(),
        summary: 'Existing summary',
        lastSummarizedMessageId: 'm2',
      });

      // act
      const { onValue } = renderWithConsumer();
      const context = onValue.mock.calls[onValue.mock.calls.length - 1][0];
      act(() => {
        context.sendMessage({ text: 'Hello' });
      });

      // assert
      expect(rawSendMessage).toHaveBeenCalledWith(expect.objectContaining({ text: 'Hello' }), {
        body: {
          summary: {
            text: 'Existing summary',
            lastSummarizedMessageId: 'm2',
          },
        },
      });
    });

    it('omits summary when lastSummarizedMessageId is missing', () => {
      // arrange
      const rawSendMessage = vi.fn();

      useChat.mockReturnValue({
        messages: [],
        sendMessage: rawSendMessage,
        status: 'ready',
        error: undefined,
        regenerate: vi.fn(),
        setMessages: vi.fn(),
      });

      useChatPersistence.mockReturnValue({
        initialMessages: [],
        isLoading: false,
        saveMessages: vi.fn(),
        clearMessages: vi.fn(),
        saveSummary: vi.fn(),
        summary: 'Existing summary',
        lastSummarizedMessageId: undefined,
      });

      // act
      const { onValue } = renderWithConsumer();
      const context = onValue.mock.calls[onValue.mock.calls.length - 1][0];
      act(() => {
        context.sendMessage({ text: 'Hello' });
      });

      // assert
      expect(rawSendMessage).toHaveBeenCalledWith(expect.objectContaining({ text: 'Hello' }), { body: {} });
    });

    it('respects open options for sendMessage', () => {
      // arrange
      const rawSendMessage = vi.fn();

      useChat.mockReturnValue({
        messages: [{ id: 'm1' }],
        sendMessage: rawSendMessage,
        status: 'streaming',
        error: undefined,
        regenerate: vi.fn(),
        setMessages: vi.fn(),
      });

      useChatPersistence.mockReturnValue({
        initialMessages: [{ id: 'm1' }],
        isLoading: true,
        saveMessages: vi.fn(),
        clearMessages: vi.fn(),
        saveSummary: vi.fn(),
        summary: undefined,
        lastSummarizedMessageId: undefined,
      });

      // act
      const { onValue } = renderWithConsumer({ defaultOpen: false });
      const context = onValue.mock.calls[onValue.mock.calls.length - 1][0];
      act(() => {
        context.sendMessage({ text: 'Hi' }, { open: false });
      });

      const updated = onValue.mock.calls[onValue.mock.calls.length - 1][0];

      // assert
      expect(updated.open).toBe(false);
      expect(updated.isLoading).toBe(true);
      expect(updated.status).toBe('streaming');
      expect(rawSendMessage).toHaveBeenCalled();
    });
  });

  describe('handleSubmit()', () => {
    it('clears input after submit', () => {
      // arrange
      const rawSendMessage = vi.fn();

      useChat.mockReturnValue({
        messages: [],
        sendMessage: rawSendMessage,
        status: 'ready',
        error: undefined,
        regenerate: vi.fn(),
        setMessages: vi.fn(),
      });

      useChatPersistence.mockReturnValue({
        initialMessages: [],
        isLoading: false,
        saveMessages: vi.fn(),
        clearMessages: vi.fn(),
        saveSummary: vi.fn(),
        summary: undefined,
        lastSummarizedMessageId: undefined,
      });

      // act
      const { onValue } = renderWithConsumer();

      let context = onValue.mock.calls[onValue.mock.calls.length - 1][0];

      // act
      act(() => {
        context.setInput('Hello');
      });

      context = onValue.mock.calls[onValue.mock.calls.length - 1][0];

      // act
      act(() => {
        context.handleSubmit({ text: 'Hello' });
      });

      context = onValue.mock.calls[onValue.mock.calls.length - 1][0];

      // assert
      expect(rawSendMessage).toHaveBeenCalledTimes(1);
      expect(context.input).toBe('');
    });

    it('ignores empty messages', () => {
      // arrange
      const rawSendMessage = vi.fn();

      useChat.mockReturnValue({
        messages: [],
        sendMessage: rawSendMessage,
        status: 'ready',
        error: undefined,
        regenerate: vi.fn(),
        setMessages: vi.fn(),
      });

      useChatPersistence.mockReturnValue({
        initialMessages: [],
        isLoading: false,
        saveMessages: vi.fn(),
        clearMessages: vi.fn(),
        saveSummary: vi.fn(),
        summary: undefined,
        lastSummarizedMessageId: undefined,
      });

      // act
      const { onValue } = renderWithConsumer();
      const context = onValue.mock.calls[onValue.mock.calls.length - 1][0];

      act(() => {
        context.handleSubmit({ text: '' });
      });

      // assert
      expect(rawSendMessage.mock.calls.length).toBe(0);
    });
  });

  describe('setInput()', () => {
    it('opens when setInput is called without open option', () => {
      // arrange
      useChat.mockReturnValue({
        messages: [],
        sendMessage: vi.fn(),
        status: 'ready',
        error: undefined,
        regenerate: vi.fn(),
        setMessages: vi.fn(),
      });

      useChatPersistence.mockReturnValue({
        initialMessages: [],
        isLoading: false,
        saveMessages: vi.fn(),
        clearMessages: vi.fn(),
        saveSummary: vi.fn(),
        summary: undefined,
        lastSummarizedMessageId: undefined,
      });

      // act
      const { onValue } = renderWithConsumer();

      const context = onValue.mock.calls[onValue.mock.calls.length - 1][0];

      // act
      act(() => {
        context.setInput('Hello');
      });

      const updated = onValue.mock.calls[onValue.mock.calls.length - 1][0];

      // assert
      expect(updated.open).toBe(true);
    });

    it('respects open options for setInput', () => {
      // arrange
      useChat.mockReturnValue({
        messages: [{ id: 'm1' }],
        sendMessage: vi.fn(),
        status: 'streaming',
        error: undefined,
        regenerate: vi.fn(),
        setMessages: vi.fn(),
      });

      useChatPersistence.mockReturnValue({
        initialMessages: [{ id: 'm1' }],
        isLoading: true,
        saveMessages: vi.fn(),
        clearMessages: vi.fn(),
        saveSummary: vi.fn(),
        summary: undefined,
        lastSummarizedMessageId: undefined,
      });

      // act
      const { onValue } = renderWithConsumer({ defaultOpen: false });
      const context = onValue.mock.calls[onValue.mock.calls.length - 1][0];
      act(() => {
        context.setInput('Hello', { open: false });
      });

      const updated = onValue.mock.calls[onValue.mock.calls.length - 1][0];

      // assert
      expect(updated.open).toBe(false);
      expect(updated.isLoading).toBe(true);
      expect(updated.status).toBe('streaming');
    });
  });

  describe('setOpen() / toggleOpen()', () => {
    it('toggles open state', () => {
      // arrange
      useChat.mockReturnValue({
        messages: [],
        sendMessage: vi.fn(),
        status: 'ready',
        error: undefined,
        regenerate: vi.fn(),
        setMessages: vi.fn(),
      });

      useChatPersistence.mockReturnValue({
        initialMessages: [],
        isLoading: false,
        saveMessages: vi.fn(),
        clearMessages: vi.fn(),
        saveSummary: vi.fn(),
        summary: undefined,
        lastSummarizedMessageId: undefined,
      });

      // act
      const { onValue } = renderWithConsumer({ defaultOpen: false });
      const context = onValue.mock.calls[onValue.mock.calls.length - 1][0];

      // act
      act(() => {
        context.toggleOpen();
      });

      const opened = onValue.mock.calls[onValue.mock.calls.length - 1][0];

      // assert
      expect(opened.open).toBe(true);
    });

    it('respects controlled open', () => {
      // arrange
      useChat.mockReturnValue({
        messages: [],
        sendMessage: vi.fn(),
        status: 'ready',
        error: undefined,
        regenerate: vi.fn(),
        setMessages: vi.fn(),
      });

      useChatPersistence.mockReturnValue({
        initialMessages: [],
        isLoading: false,
        saveMessages: vi.fn(),
        clearMessages: vi.fn(),
        saveSummary: vi.fn(),
        summary: undefined,
        lastSummarizedMessageId: undefined,
      });

      // act
      const { onValue } = renderWithConsumer({ open: true });
      const context = onValue.mock.calls[onValue.mock.calls.length - 1][0];

      act(() => {
        context.setOpen(false);
      });

      const stillOpen = onValue.mock.calls[onValue.mock.calls.length - 1][0];

      // assert
      expect(stillOpen.open).toBe(true);
    });

    it('opens via keyboard shortcut', () => {
      // arrange
      useChat.mockReturnValue({
        messages: [],
        sendMessage: vi.fn(),
        status: 'ready',
        error: undefined,
        regenerate: vi.fn(),
        setMessages: vi.fn(),
      });

      useChatPersistence.mockReturnValue({
        initialMessages: [],
        isLoading: false,
        saveMessages: vi.fn(),
        clearMessages: vi.fn(),
        saveSummary: vi.fn(),
        summary: undefined,
        lastSummarizedMessageId: undefined,
      });

      // act
      const { onValue } = renderWithConsumer({ defaultOpen: false });

      // act
      act(() => {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'i', metaKey: true }));
      });

      const opened = onValue.mock.calls[onValue.mock.calls.length - 1][0];

      // assert
      expect(opened.open).toBe(true);
    });

    it('closes via escape key', () => {
      // arrange
      useChat.mockReturnValue({
        messages: [],
        sendMessage: vi.fn(),
        status: 'ready',
        error: undefined,
        regenerate: vi.fn(),
        setMessages: vi.fn(),
      });

      useChatPersistence.mockReturnValue({
        initialMessages: [],
        isLoading: false,
        saveMessages: vi.fn(),
        clearMessages: vi.fn(),
        saveSummary: vi.fn(),
        summary: undefined,
        lastSummarizedMessageId: undefined,
      });

      // act
      const { onValue } = renderWithConsumer({ defaultOpen: true });

      act(() => {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      });

      const closed = onValue.mock.calls[onValue.mock.calls.length - 1][0];

      // assert
      expect(closed.open).toBe(false);
    });
  });

  describe('clearMessages() / regenerate', () => {
    it('clears messages and exposes regenerate from chat hook', async () => {
      // arrange
      const clearMessages = vi.fn().mockResolvedValue(undefined);
      const setMessages = vi.fn();
      const regenerate = vi.fn();

      useChat.mockReturnValue({
        messages: [],
        sendMessage: vi.fn(),
        status: 'ready',
        error: undefined,
        regenerate,
        setMessages,
      });

      useChatPersistence.mockReturnValue({
        initialMessages: [],
        isLoading: false,
        saveMessages: vi.fn(),
        clearMessages,
        saveSummary: vi.fn(),
        summary: undefined,
        lastSummarizedMessageId: undefined,
      });

      // act
      const { onValue } = renderWithConsumer();
      const context = onValue.mock.calls[onValue.mock.calls.length - 1][0];

      // act
      await act(async () => {
        await context.clearMessages();
      });

      // assert
      expect(clearMessages).toHaveBeenCalledTimes(1);
      expect(setMessages).toHaveBeenCalledWith([]);
      expect(context.regenerate).toBe(regenerate);
    });
  });

  describe('onData()', () => {
    it('handles summary data and ignores duplicate summaries', () => {
      // arrange
      let onData: ((part: unknown) => void) | undefined;

      useChat.mockImplementation((options: { onData?: (part: unknown) => void }) => {
        onData = options.onData;
        return {
          messages: [],
          sendMessage: vi.fn(),
          status: 'ready',
          error: undefined,
          regenerate: vi.fn(),
          setMessages: vi.fn(),
        };
      });

      const saveSummary = vi.fn();
      useChatPersistence.mockReturnValue({
        initialMessages: [],
        isLoading: false,
        saveMessages: vi.fn(),
        clearMessages: vi.fn(),
        saveSummary,
        summary: undefined,
        lastSummarizedMessageId: 'm1',
      });

      // act
      renderWithConsumer();

      // act
      act(() => {
        onData?.({
          type: 'data-summary',
          data: { text: 'Summary', lastSummarizedMessageId: 'm2' },
        });
      });

      // assert
      expect(useChatPersistence).toHaveBeenCalled();
      expect(onData).toBeTypeOf('function');
      expect(saveSummary).toHaveBeenCalledWith('Summary', 'm2');
    });

    it('saves again when summary id changes', () => {
      // arrange
      let onData: ((part: unknown) => void) | undefined;

      useChat.mockImplementation((options: { onData?: (part: unknown) => void }) => {
        onData = options.onData;
        return {
          messages: [],
          sendMessage: vi.fn(),
          status: 'ready',
          error: undefined,
          regenerate: vi.fn(),
          setMessages: vi.fn(),
        };
      });

      const saveSummary = vi.fn();
      useChatPersistence.mockReturnValue({
        initialMessages: [],
        isLoading: false,
        saveMessages: vi.fn(),
        clearMessages: vi.fn(),
        saveSummary,
        summary: undefined,
        lastSummarizedMessageId: 'm1',
      });

      // act
      renderWithConsumer();

      act(() => {
        onData?.({
          type: 'data-summary',
          data: { text: 'Summary', lastSummarizedMessageId: 'm2' },
        });
        onData?.({
          type: 'data-summary',
          data: { text: 'Summary', lastSummarizedMessageId: 'm3' },
        });
      });

      // assert
      expect(saveSummary).toHaveBeenCalledWith('Summary', 'm2');
      expect(saveSummary).toHaveBeenCalledWith('Summary', 'm3');
    });

    it('does not save when summary id matches lastSummarizedMessageId', () => {
      // arrange
      let onData: ((part: unknown) => void) | undefined;
      const saveSummary = vi.fn();

      useChat.mockImplementation((options: { onData?: (part: unknown) => void }) => {
        onData = options.onData;
        return {
          messages: [],
          sendMessage: vi.fn(),
          status: 'ready',
          error: undefined,
          regenerate: vi.fn(),
          setMessages: vi.fn(),
        };
      });

      useChatPersistence.mockReturnValue({
        initialMessages: [],
        isLoading: false,
        saveMessages: vi.fn(),
        clearMessages: vi.fn(),
        saveSummary,
        summary: undefined,
        lastSummarizedMessageId: 'm1',
      });

      // act
      renderWithConsumer();

      act(() => {
        onData?.({
          type: 'data-summary',
          data: { text: 'Summary', lastSummarizedMessageId: 'm1' },
        });
      });

      // assert
      expect(saveSummary).not.toHaveBeenCalled();
    });
  });
});
