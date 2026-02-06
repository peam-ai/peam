import { useDebounceCallback } from '@/hooks/useDebounceCallback';
import { getDb } from '@/lib/db';
import type { UIMessage } from '@ai-sdk/react';
import { loggers } from '@peam-ai/logger';
import { useLiveQuery } from 'dexie-react-hooks';
import { useCallback } from 'react';

const log = loggers.ui;
const CURRENT_CONVERSATION_ID = 'current';

export type ChatPersistenceConfig = boolean | { key?: string };

export const useChatPersistence = (persistence: ChatPersistenceConfig = true) => {
  const enabled = persistence !== false;
  const dbKey = typeof persistence === 'object' ? persistence.key : undefined;
  const database = enabled ? getDb(dbKey) : null;
  const storedMessages = useLiveQuery(
    () => (database ? database.messages.orderBy('sequence').toArray() : []),
    [database]
  );
  const storedSummary = useLiveQuery(
    () => (database ? database.summaries.get(CURRENT_CONVERSATION_ID) : undefined),
    [database]
  );

  const isLoading = enabled ? !storedMessages : false;
  const initialMessages = storedMessages?.map(({ ...message }) => message) ?? [];
  const summary = storedSummary?.summary;
  const lastSummarizedMessageId = storedSummary?.lastSummarizedMessageId;

  const saveMessagesImmediate = useCallback(
    async (messages: UIMessage[]) => {
      if (!enabled || !database) {
        return;
      }
      try {
        const baseTimestamp = Date.now();
        const messagesToStore = messages.map((message, index) => ({
          ...message,
          timestamp: baseTimestamp + index * 1000,
          sequence: index,
        }));

        await database.transaction('rw', database.messages, async () => {
          await database.messages.clear();
          await database.messages.bulkAdd(messagesToStore);
        });
      } catch (error) {
        log.error('Failed to save messages:', error);
      }
    },
    [database, enabled]
  );

  const saveMessages = useDebounceCallback(saveMessagesImmediate, 300);

  const saveSummary = useCallback(
    async (summaryText: string, lastMessageId: string) => {
      if (!enabled || !database) {
        return;
      }
      try {
        await database.summaries.put({
          id: CURRENT_CONVERSATION_ID,
          summary: summaryText,
          lastSummarizedMessageId: lastMessageId,
          timestamp: Date.now(),
        });
      } catch (error) {
        log.error('Failed to save summary:', error);
      }
    },
    [database, enabled]
  );

  const clearMessages = useCallback(async () => {
    if (!enabled || !database) {
      return;
    }
    try {
      await database.transaction('rw', [database.messages, database.summaries], async () => {
        await database.messages.clear();
        await database.summaries.delete(CURRENT_CONVERSATION_ID);
      });
    } catch (error) {
      log.error('Failed to clear messages:', error);
    }
  }, [database, enabled]);

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
