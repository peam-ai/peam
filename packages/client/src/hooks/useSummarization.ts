import { useChatPersistence } from '@/hooks/useChatPersistence';
import { getMessagesToSummarize, shouldSummarize } from '@/lib/messageWindow';
import type { UIMessage } from '@ai-sdk/react';
import { useChat } from '@ai-sdk/react';
import { loggers } from '@peam-ai/logger';
import { DefaultChatTransport } from 'ai';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const log = loggers.ui;

export interface UseSummarizationOptions {
  api?: string;
  maxMessages?: number;
}

/**
 * Hook for summarizing messages history with automatic saving.
 */
export function useSummarization(options: UseSummarizationOptions = {}) {
  const { api = '/api/peam', maxMessages } = options;

  const { summary, saveSummary, lastSummarizedMessageId } = useChatPersistence();
  const [isSummarizing, setIsSummarizing] = useState(false);
  const messagesToSummarizeRef = useRef<UIMessage[]>([]);
  const isProcessingRef = useRef(false);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api,
      }),
    [api]
  );

  const { status, messages, setMessages, regenerate } = useChat({
    transport,
  });

  // Handle summarization completion and save
  useEffect(() => {
    if (isProcessingRef.current) {
      return;
    }

    if (status === 'submitted' || status === 'streaming') {
      return;
    }

    if (messages.length === 0) {
      return;
    }

    const processSummary = async () => {
      isProcessingRef.current = true;

      try {
        const summaryMessages = messages;

        const summaryText = summaryMessages
          .filter((message) => message.role === 'assistant')
          .map((message) => {
            return message.parts
              .filter((part) => part.type === 'text')
              .map((part) => ('text' in part ? part.text : ''))
              .join('');
          })
          .join('\n');

        if (summaryText) {
          // Get the last message ID from the messages that were summarized
          const summarizedMessages = messagesToSummarizeRef.current;
          const lastMessageId = summarizedMessages[summarizedMessages.length - 1]?.id;

          if (lastMessageId && saveSummary) {
            await saveSummary(summaryText, lastMessageId);
          }
        }
      } catch (error) {
        log.error('Error processing summary:', error);
      } finally {
        setIsSummarizing(false);
        isProcessingRef.current = false;
      }
    };

    processSummary();
  }, [status, messages, saveSummary]);

  const summarize = useCallback(
    (messages: UIMessage[], previousSummary?: string) => {
      if (isSummarizing) {
        return;
      }

      messagesToSummarizeRef.current = [...messages];
      setIsSummarizing(true);

      setMessages(messages);
      regenerate({
        body: {
          mode: 'summarize',
          messages,
          previousSummary,
        },
      });
    },
    [setMessages, regenerate, isSummarizing]
  );

  /**
   * Attempts to summarize messages based on the provided criteria.
   * Returns true if summarization was triggered, false otherwise.
   */
  const triggerSummarization = useCallback(
    (allMessages: UIMessage[], lastSummarizedMessageId?: string, previousSummary?: string) => {
      if (isSummarizing) {
        return false;
      }

      const messagesToSummarize = getMessagesToSummarize(allMessages, lastSummarizedMessageId, maxMessages);

      if (messagesToSummarize.length === 0) {
        return false;
      }

      summarize(messagesToSummarize, previousSummary);
      return true;
    },
    [summarize, isSummarizing, maxMessages]
  );

  /**
   * Attempts to summarize after an assistant response.
   */
  const maybeTriggerSummarization = useCallback(
    (allMessages: UIMessage[]) => {
      if (isSummarizing) {
        return false;
      }

      const lastMessage = allMessages[allMessages.length - 1];
      if (!lastMessage || lastMessage.role !== 'assistant') {
        return false;
      }

      if (!shouldSummarize(allMessages, lastSummarizedMessageId, maxMessages)) {
        return false;
      }

      return triggerSummarization(allMessages, lastSummarizedMessageId, summary);
    },
    [isSummarizing, triggerSummarization, summary, lastSummarizedMessageId, maxMessages]
  );

  return {
    /**
     * Attempt to summarize after assistant response with all eligibility checks.
     */
    maybeTriggerSummarization,
    /**
     * The current summary text from persistence
     */
    summary,
    /**
     * The ID of the last message that was summarized
     */
    lastSummarizedMessageId,
  };
}
