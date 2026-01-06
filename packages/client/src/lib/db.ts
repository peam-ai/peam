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

  constructor() {
    super('PeamChatMessages');
    this.version(1).stores({
      messages: 'id, timestamp, sequence',
      summaries: 'id, timestamp',
    });
  }
}

export const db = new ChatDatabase();
export type { ConversationSummary, StoredMessage };
