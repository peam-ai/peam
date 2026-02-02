'use client';

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageResponse,
} from '@/components/ai-elements/message';
import { Shimmer } from '@/components/ai-elements/shimmer';
import { Source, Sources, SourcesContent, SourcesTrigger } from '@/components/ai-elements/sources';
import { PeamIcon } from '@/components/icons/peam';
import { SuggestedPrompts } from '@/components/SuggestedPrompts';
import { cn } from '@/lib/utils';
import { Check, Copy, RefreshCcw } from 'lucide-react';
import type { ComponentPropsWithoutRef } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { useAskAIContext } from './context';

export type AskAIMessagesProps = ComponentPropsWithoutRef<'div'>;

export function AskAIMessages({ className, ...props }: AskAIMessagesProps) {
  const { messages, status, error, isLoading, suggestedPrompts, sendMessage, regenerate } = useAskAIContext();
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const isIdle = useMemo(() => status !== 'submitted' && status !== 'streaming', [status]);

  const handleSuggestedPromptClick = useCallback(
    (prompt: string) => {
      sendMessage({
        text: prompt,
      });
    },
    [sendMessage]
  );

  const handleCopy = useCallback(
    async (messageId: string, text: string) => {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    },
    [setCopiedMessageId]
  );

  const getErrorMessage = (error: Error) => {
    try {
      const parsed = JSON.parse(error.message);

      if (parsed.error) {
        return parsed.error;
      }
    } catch {
      // noop
    }

    return 'An error occurred while processing your request.';
  };

  return (
    <div className={cn('flex-1 min-h-0 h-0 flex flex-col', className)} {...props}>
      <Conversation>
        <ConversationContent
          className={messages.length === 0 && !error && !isLoading ? 'justify-between min-h-full' : ''}
        >
          {isLoading ? (
            <div className="flex items-center justify-center flex-1">
              <ConversationEmptyState
                icon={<PeamIcon className="size-12 animate-pulse" />}
                title="Loading chat history..."
                description="Please wait"
              />
            </div>
          ) : messages.length === 0 && !error ? (
            <>
              <div className="flex items-center justify-center flex-1">
                <ConversationEmptyState
                  icon={<PeamIcon className="size-12" />}
                  title="Ask me anything"
                  description="How can I help you today?"
                />
              </div>
              <SuggestedPrompts prompts={suggestedPrompts} onPromptClick={handleSuggestedPromptClick} />
            </>
          ) : (
            <>
              {messages.map((message, index) => {
                const sourceParts = message.parts.filter((part) => part.type === 'source-url');
                const uniqueSources = Array.from(new Map(sourceParts.map((part) => [part.sourceId, part])).values());
                const uniqueSourceCount = uniqueSources.length;
                const isLastMessage = index === messages.length - 1;
                const isAssistant = message.role === 'assistant';
                const isStreaming = isLastMessage && status === 'streaming';
                const isReady = !isStreaming && isIdle;

                const textContent = message.parts
                  .filter((part) => part.type === 'text')
                  .map((part) => part.text)
                  .join('\n');

                const hasText = textContent.length > 0;
                const showShimmer = isAssistant && isStreaming && !hasText;
                const showActions = isAssistant && isReady && hasText;

                return (
                  <div key={message.id}>
                    {isAssistant && uniqueSourceCount > 0 && (
                      <Sources>
                        <SourcesTrigger count={uniqueSourceCount} />
                        {uniqueSources.map((part) => {
                          return (
                            <SourcesContent key={`${message.id}-source-${part.sourceId}`}>
                              <Source href={part.url} title={part.title || part.url} />
                            </SourcesContent>
                          );
                        })}
                      </Sources>
                    )}

                    <Message from={message.role}>
                      <MessageContent>
                        {message.parts.map((part, i) => {
                          switch (part.type) {
                            case 'text':
                              return (
                                <MessageResponse
                                  linkSafety={{
                                    enabled: true,
                                    onLinkCheck: (url) => {
                                      const currentOrigin = window.location.origin;
                                      return url.startsWith(currentOrigin);
                                    },
                                  }}
                                  key={`${message.id}-${i}`}
                                >
                                  {part.text}
                                </MessageResponse>
                              );
                            default:
                              return null;
                          }
                        })}

                        {showShimmer && <Shimmer>Thinking...</Shimmer>}
                      </MessageContent>

                      {showActions && (
                        <MessageActions>
                          <MessageAction
                            onClick={() => handleCopy(message.id, textContent)}
                            tooltip={copiedMessageId === message.id ? 'Copied!' : 'Copy'}
                            label="Copy"
                          >
                            {copiedMessageId === message.id ? (
                              <Check className="size-4" />
                            ) : (
                              <Copy className="size-4" />
                            )}
                          </MessageAction>
                          <MessageAction
                            onClick={() => regenerate({ messageId: message.id })}
                            tooltip="Regenerate"
                            label="Regenerate"
                          >
                            <RefreshCcw className="size-4" />
                          </MessageAction>
                        </MessageActions>
                      )}
                    </Message>
                  </div>
                );
              })}

              {error && (
                <Message from="assistant">
                  <MessageContent>
                    <div className="font-semibold text-destructive">{getErrorMessage(error)}</div>
                  </MessageContent>
                  <MessageActions>
                    <MessageAction onClick={() => regenerate()} tooltip="Retry" label="Retry">
                      <RefreshCcw className="size-4" />
                    </MessageAction>
                  </MessageActions>
                </Message>
              )}
            </>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
    </div>
  );
}
