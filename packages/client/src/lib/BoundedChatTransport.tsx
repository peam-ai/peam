import { DefaultChatTransport, type UIMessage } from 'ai';
import { getRecentMessages } from './messageWindow';

export interface BoundedChatTransportOptions {
  api: string;
}

/**
 * Chat transport that only sends recent messages to the backend.
 */
export class BoundedChatTransport extends DefaultChatTransport<UIMessage> {
  constructor(options: BoundedChatTransportOptions) {
    super({
      api: options.api,
      prepareSendMessagesRequest: ({ messages, body }) => {
        const recentMessages = getRecentMessages(messages);

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
