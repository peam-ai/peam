import type { UIMessage } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { getRecentMessages } from './messageWindow';

export interface BoundedChatTransportOptions {
  api: string;
}

/**
 * Custom chat transport that implements bounded context.
 * Sends only: summary + recent messages after lastSummarizedMessageId
 * This prevents unbounded payload growth as conversations get longer.
 */
export class BoundedChatTransport extends DefaultChatTransport<UIMessage> {
  constructor(options: BoundedChatTransportOptions) {
    super({
      api: options.api,
      prepareSendMessagesRequest: ({ messages, body }) => {
        const lastSummarizedMessageId = body?.lastSummarizedMessageId;
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
