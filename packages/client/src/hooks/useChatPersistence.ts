'use client';

import type { UIMessage } from '@ai-sdk/react';
import { loggers } from '@peam/logger';
import { useLiveQuery } from 'dexie-react-hooks';
import { useCallback } from 'react';
import { db } from '../lib/db';
import { useDebounceCallback } from './useDebounceCallback';

const log = loggers.ui;

export const useChatPersistence = () => {
  const storedMessages = useLiveQuery(() => db.messages.orderBy('sequence').toArray());
  const isLoading = !storedMessages;
  const initialMessages = storedMessages?.map(({ timestamp, sequence, ...message }) => message) ?? [];

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

  const clearMessages = useCallback(async () => {
    try {
      await db.messages.clear();
    } catch (error) {
      log('Failed to clear messages: %O', error);
    }
  }, []);

  return {
    initialMessages,
    isLoading,
    saveMessages,
    clearMessages,
  };
};
