'use client';

import type { UIMessage } from '@ai-sdk/react';
import { loggers } from '@peam/logger';
import { useLiveQuery } from 'dexie-react-hooks';
import { useCallback } from 'react';
import { db } from '../lib/db';
import { useDebounceCallback } from './useDebounceCallback';

const log = loggers.ui;
const CURRENT_CONVERSATION_ID = 'current';

export const useChatPersistence = () => {
  const storedMessages = useLiveQuery(() => db.messages.orderBy('sequence').toArray());
  const storedSummary = useLiveQuery(() => db.summaries.get(CURRENT_CONVERSATION_ID));

  const isLoading = !storedMessages;
  const initialMessages = storedMessages?.map(({ ...message }) => message) ?? [];
  const summary = storedSummary?.summary;
  const lastSummarizedMessageId = storedSummary?.lastSummarizedMessageId;

  const saveMessagesImmediate = useCallback(async (messages: UIMessage[]) => {
    try {
      const baseTimestamp = Date.now();
      const messagesToStore = messages.map((message, index) => ({
        ...message,
        timestamp: baseTimestamp + index * 1000,
        sequence: index,
      }));

      await db.transaction('rw', db.messages, async () => {
        await db.messages.clear();
        await db.messages.bulkAdd(messagesToStore);
      });
    } catch (error) {
      log('Failed to save messages: %O', error);
    }
  }, []);

  const saveMessages = useDebounceCallback(saveMessagesImmediate, 300);

  const saveSummary = useCallback(async (summaryText: string, lastMessageId: string) => {
    try {
      await db.summaries.put({
        id: CURRENT_CONVERSATION_ID,
        summary: summaryText,
        lastSummarizedMessageId: lastMessageId,
        timestamp: Date.now(),
      });
    } catch (error) {
      log('Failed to save summary: %O', error);
    }
  }, []);

  const clearMessages = useCallback(async () => {
    try {
      await db.transaction('rw', [db.messages, db.summaries], async () => {
        await db.messages.clear();
        await db.summaries.delete(CURRENT_CONVERSATION_ID);
      });
    } catch (error) {
      log('Failed to clear messages: %O', error);
    }
  }, []);

  return {
    initialMessages,
    isLoading,
    saveMessages,
    clearMessages,
    summary,
    lastSummarizedMessageId,
    saveSummary,
  };
};
