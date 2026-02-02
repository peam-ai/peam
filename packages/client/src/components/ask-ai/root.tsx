'use client';

import type { PromptInputMessage } from '@/components/ai-elements/prompt-input';
import { useChatPersistence } from '@/hooks/useChatPersistence';
import { BoundedChatTransport } from '@/lib/BoundedChatTransport';
import { useChat } from '@ai-sdk/react';
import { loggers } from '@peam-ai/logger';
import type { HttpChatTransport, UIMessage } from 'ai';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AskAIContext } from './context';

const log = loggers.ui;

type SummaryPayload = {
  text: string;
  lastSummarizedMessageId: string;
};

export interface AskAIRootProps {
  children?: ReactNode;
  /**
   * API endpoint for handling AI requests.
   * @default '/api/peam'
   */
  endpoint?: string;
  /**
   * Maximum number of messages to keep in context before summarizing.
   * @default 10
   */
  maxMessages?: number;
  /**
   * Controlled open state.
   */
  open?: boolean;
  /**
   * Uncontrolled initial open state.
   */
  defaultOpen?: boolean;
  /**
   * Open state change callback.
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * Override the default chat transport.
   */
  chatTransport?: HttpChatTransport<UIMessage>;
}

export function AskAIRoot({
  children,
  endpoint,
  maxMessages,
  open,
  defaultOpen,
  onOpenChange,
  chatTransport,
}: AskAIRootProps) {
  const [input, setInput] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen ?? false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : uncontrolledOpen;
  const isSyncing = useRef(false);
  const lastSavedMessageCount = useRef(0);

  const chatPersistence = useChatPersistence();
  const { initialMessages, isLoading, saveMessages, clearMessages, saveSummary, summary, lastSummarizedMessageId } =
    chatPersistence;

  const {
    messages,
    sendMessage: rawSendMessage,
    status,
    error,
    regenerate,
    setMessages,
  } = useChat({
    transport:
      chatTransport ??
      new BoundedChatTransport({
        endpoint: endpoint ?? '/api/peam',
      }),
    onData: (part) => {
      if (!saveSummary || part.type !== 'data-summary') {
        return;
      }

      const summaryData = part.data as SummaryPayload | undefined;

      if (!summaryData?.text || !summaryData.lastSummarizedMessageId) {
        return;
      }

      if (summaryData.lastSummarizedMessageId === lastSummarizedMessageId) {
        return;
      }

      saveSummary(summaryData.text, summaryData.lastSummarizedMessageId);
    },
  });

  const isIdle = useMemo(() => status !== 'submitted' && status !== 'streaming', [status]);

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(next);
      }
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange]
  );

  const toggleOpen = useCallback(() => {
    setOpen(!isOpen);
  }, [isOpen, setOpen]);

  const sendMessage = useCallback(
    (message: { text: string }) => {
      rawSendMessage(
        {
          ...message,
          ...{
            metadata: {
              currentPage: {
                title: window.document.title,
                origin: window.location.origin,
                path: window.location.pathname,
              },
            },
          },
        },
        {
          body: summary && lastSummarizedMessageId ? { summary: { text: summary, lastSummarizedMessageId } } : {},
        }
      );
    },
    [rawSendMessage, summary, lastSummarizedMessageId]
  );

  const handleSubmit = useCallback(
    (message: PromptInputMessage) => {
      const hasText = Boolean(message.text);

      if (!hasText) {
        return;
      }

      sendMessage({
        text: message.text,
      });
      setInput('');
    },
    [sendMessage]
  );

  const handleClearMessages = useCallback(async () => {
    try {
      await clearMessages();
      setMessages([]);
    } catch (error) {
      log.error('Failed to clear chat history:', error);
    }
  }, [clearMessages, setMessages]);

  useEffect(() => {
    if (!(isLoading || isInitialized) && initialMessages.length > 0) {
      setMessages(initialMessages);
      lastSavedMessageCount.current = initialMessages.length;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsInitialized(true);
    } else if (!(isLoading || isInitialized)) {
      setIsInitialized(true);
    }
  }, [isLoading, initialMessages, isInitialized, setMessages]);

  useEffect(() => {
    if (isInitialized && !isLoading && !isSyncing.current && isIdle) {
      if (initialMessages.length !== lastSavedMessageCount.current) {
        isSyncing.current = true;
        setMessages(initialMessages);
        lastSavedMessageCount.current = initialMessages.length;
        setTimeout(() => {
          isSyncing.current = false;
        }, 100);
      }
    }
  }, [initialMessages, isInitialized, isLoading, setMessages, isIdle]);

  useEffect(() => {
    if (isInitialized && messages.length >= 0 && !isSyncing.current && isIdle) {
      saveMessages(messages);
      lastSavedMessageCount.current = messages.length;
    }
  }, [messages, saveMessages, isInitialized, isIdle]);

  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      const isEscape = event.key === 'Escape' || event.key === 'Esc' || event.keyCode === 27;
      if (isEscape && isOpen) {
        setOpen(false);
        return;
      }

      const isIKey = event.key === 'i' || event.key === 'I' || event.keyCode === 73;
      const hasModifier = event.metaKey;

      if (hasModifier && isIKey) {
        event.preventDefault();
        event.stopPropagation();
        setOpen(!isOpen);
      }
    };

    document.addEventListener('keydown', handleKeyboard);

    return () => {
      document.removeEventListener('keydown', handleKeyboard);
    };
  }, [isOpen, setOpen]);

  const contextValue = useMemo(
    () => ({
      open: isOpen,
      setOpen,
      toggleOpen,
      endpoint,
      maxMessages,
      input,
      setInput,
      messages,
      status,
      error,
      isLoading,
      initialMessages,
      sendMessage,
      handleSubmit,
      regenerate,
      clearMessages: handleClearMessages,
    }),
    [
      endpoint,
      error,
      handleClearMessages,
      handleSubmit,
      initialMessages,
      input,
      isLoading,
      isOpen,
      maxMessages,
      messages,
      regenerate,
      sendMessage,
      setOpen,
      status,
      toggleOpen,
    ]
  );

  return <AskAIContext.Provider value={contextValue}>{children}</AskAIContext.Provider>;
}
