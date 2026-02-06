import type { UIMessage } from '@ai-sdk/react';
import Dexie, { type EntityTable } from 'dexie';

interface StoredMessage extends UIMessage {
  timestamp: number;
  sequence: number;
}

interface ConversationSummary {
  id: string;
  summary: string;
  lastSummarizedMessageId: string;
  timestamp: number;
}

class ChatDatabase extends Dexie {
  messages!: EntityTable<StoredMessage, 'id'>;
  summaries!: EntityTable<ConversationSummary, 'id'>;

  constructor(name = 'PeamChatMessages') {
    super(name);
    this.version(1).stores({
      messages: 'id, timestamp, sequence',
      summaries: 'id, timestamp',
    });
  }
}

const dbCache = new Map<string, ChatDatabase>();

export const getDb = (suffix?: string) => {
  const name = suffix ? `PeamChatMessages-${suffix}` : 'PeamChatMessages';
  const existing = dbCache.get(name);
  if (existing) {
    return existing;
  }
  const instance = new ChatDatabase(name);
  dbCache.set(name, instance);
  return instance;
};
export type { ConversationSummary, StoredMessage };
