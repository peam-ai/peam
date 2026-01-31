import { getRecentMessages } from '@/lib/messageWindow';
import type { UIMessage } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';

export interface BoundedChatTransportOptions {
  endpoint: string;
}

/**
 * Custom chat transport that implements bounded context.
 */
export class BoundedChatTransport extends DefaultChatTransport<UIMessage> {
  constructor({ endpoint }: BoundedChatTransportOptions) {
    super({
      api: endpoint,
      prepareSendMessagesRequest: ({ messages, body }) => {
        const lastSummarizedMessageId = body?.summary?.lastSummarizedMessageId;
        const recentMessages = getRecentMessages(messages, lastSummarizedMessageId);

        return {
          body: {
            ...body,
            messages: recentMessages,
          },
        };
      },
    });
  }
}
