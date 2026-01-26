import { getRecentMessages } from '@/lib/messageWindow';
import type { UIMessage } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';

export interface BoundedChatTransportOptions {
  api: string;
  maxMessages?: number;
}

/**
 * Custom chat transport that implements bounded context.
 */
export class BoundedChatTransport extends DefaultChatTransport<UIMessage> {
  constructor(options: BoundedChatTransportOptions) {
    super({
      api: options.api,
      prepareSendMessagesRequest: ({ messages, body }) => {
        const lastSummarizedMessageId = body?.lastSummarizedMessageId;
        const recentMessages = getRecentMessages(messages, lastSummarizedMessageId, options.maxMessages);

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
