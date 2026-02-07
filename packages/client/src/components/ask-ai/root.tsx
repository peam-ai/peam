'use client';

import type { PromptInputMessage } from '@/components/ai-elements/prompt-input';
import { type ChatPersistenceConfig, useChatPersistence } from '@/hooks/useChatPersistence';
import { BoundedChatTransport } from '@/lib/BoundedChatTransport';
import { useChat } from '@ai-sdk/react';
import { loggers } from '@peam-ai/logger';
import type { HttpChatTransport, UIMessage } from 'ai';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
   * Controlled open state.
   */
  open?: boolean;

  /**
   * Uncontrolled initial open state.
   */
  defaultOpen?: boolean;

  /**
   * Override the default chat transport.
   */
  chatTransport?: HttpChatTransport<UIMessage>;

  /**
   * Configure chat persistence.
   * @default true
   */
  persistence?: ChatPersistenceConfig;
}

export function AskAIRoot({
  children,
  endpoint,
  open,
  defaultOpen,
  chatTransport,
  persistence = true,
}: AskAIRootProps) {
  const [input, setInput] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen ?? false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : uncontrolledOpen;
  const { initialMessages, isLoading, saveMessages, clearMessages, saveSummary, summary, lastSummarizedMessageId } =
    useChatPersistence(persistence);

  const transport = useMemo(
    () =>
      chatTransport ??
      new BoundedChatTransport({
        endpoint: endpoint ?? '/api/peam',
      }),
    [chatTransport, endpoint]
  );

  const {
    messages,
    sendMessage: rawSendMessage,
    status,
    error,
    regenerate,
    setMessages,
  } = useChat({
    transport,
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
  const isSynced = useMemo(() => {
    if (messages.length !== initialMessages.length) {
      return false;
    }
    // compare by id order
    return messages.every((msg, index) => msg.id === initialMessages[index]?.id);
  }, [initialMessages, messages]);

  const withPersistenceMarkers = (message: UIMessage) => 'sequence' in message || 'timestamp' in message;
  const hasPersistenceMarkers = useCallback((messages: UIMessage[]) => messages.some(withPersistenceMarkers), []);

  const shouldSync = useMemo(() => {
    // only sync when initialized, idle, and out of sync
    if (!isInitialized || !isIdle || isSynced) {
      return false;
    }
    // empty store wins only for persisted messages
    if (initialMessages.length === 0 && messages.length > 0) {
      return messages.some((message) => 'sequence' in message || 'timestamp' in message);
    }
    // don't clobber local when store is behind
    if (initialMessages.length < messages.length) {
      return false;
    }
    // sync when ids differ
    return initialMessages.some((msg, index) => msg.id !== messages[index]?.id);
  }, [initialMessages, isIdle, isInitialized, isSynced, messages]);

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(next);
      }
    },
    [isControlled]
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
    // sync the initial messages from persistence only once
    if (!isLoading && !isInitialized) {
      if (!isSynced) {
        setMessages(initialMessages);
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsInitialized(true);
    }
  }, [isLoading, isSynced, initialMessages, isInitialized, setMessages]);

  useEffect(() => {
    // sync or persist messages while idle (sync has priority)
    if (!isInitialized || !isIdle) {
      return;
    }

    if (shouldSync) {
      setMessages(initialMessages);
      return;
    }

    if (messages.length > 0 && !isSynced) {
      saveMessages(messages);
    }
  }, [initialMessages, isIdle, isInitialized, isSynced, messages, saveMessages, setMessages, shouldSync]);

  useEffect(() => {
    // align local messages with persisted copies (adds persistence markers)
    if (
      isInitialized &&
      isSynced &&
      messages.length > 0 &&
      hasPersistenceMarkers(initialMessages) &&
      !hasPersistenceMarkers(messages)
    ) {
      setMessages(initialMessages);
    }
  }, [messages, initialMessages, isInitialized, isSynced, messages.length, setMessages, hasPersistenceMarkers]);

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
      input,
      setInput,
      messages,
      status,
      error,
      isLoading,
      sendMessage,
      handleSubmit,
      regenerate,
      clearMessages: handleClearMessages,
    }),
    [
      error,
      handleClearMessages,
      handleSubmit,
      input,
      isLoading,
      isOpen,
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
