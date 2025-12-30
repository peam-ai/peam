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
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSpeechButton,
  PromptInputSubmit,
  PromptInputTextarea,
  type PromptInputMessage,
} from '@/components/ai-elements/prompt-input';
import { Shimmer } from '@/components/ai-elements/shimmer';
import { Source, Sources, SourcesContent, SourcesTrigger } from '@/components/ai-elements/sources';
import { SuggestedPrompts } from '@/components/SuggestedPrompts';
import { useChat } from '@ai-sdk/react';
import { BotMessageSquare, Check, Copy, RefreshCcw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface ChatProps {
  suggestedPrompts?: string[];
}

export const Chat = ({ suggestedPrompts }: ChatProps) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const { messages, sendMessage: _sendMessage, status, error, regenerate } = useChat();

  const sendMessage = useCallback(
    (message: { text: string }) => {
      _sendMessage({
        ...message,
        ...{
          metadata: {
            currentPage: {
              title: window.document.title,
              origin: window.location.origin,
              path: window.location.pathname,
            },
          },
        },
      });
    },
    [_sendMessage]
  );

  useEffect(() => {
    textareaRef?.current?.focus();
  }, [textareaRef]);

  const handleSubmit = useCallback(
    (message: PromptInputMessage) => {
      const hasText = Boolean(message.text);

      if (!hasText) {
        return;
      }

      sendMessage({
        text: message.text,
      });
      setInput('');
    },
    [sendMessage, setInput]
  );

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
    <div className="flex flex-col h-full bg-background rounded-sm">
      <Conversation>
        <ConversationContent>
          {messages.length === 0 && !error ? (
            <>
              <ConversationEmptyState
                icon={<BotMessageSquare className="size-12" />}
                title="Ask me anything"
                description="How can I help you today?"
              />
              <SuggestedPrompts prompts={suggestedPrompts} onPromptClick={handleSuggestedPromptClick} />
            </>
          ) : (
            <>
              {messages.map((message, index) => {
                const sourceCount = message.parts.filter((part) => part.type === 'source-url').length;
                const isLastMessage = index === messages.length - 1;
                const isAssistant = message.role === 'assistant';
                const isStreaming = isLastMessage && status === 'streaming';
                const isReady = !isStreaming;

                const textContent = message.parts
                  .filter((part) => part.type === 'text')
                  .map((part) => part.text)
                  .join('\n');

                const hasText = textContent.length > 0;
                const showShimmer = isAssistant && isStreaming && !hasText;
                const showActions = isAssistant && isReady && hasText;

                return (
                  <div key={message.id}>
                    {isAssistant && sourceCount > 0 && (
                      <Sources>
                        <SourcesTrigger count={sourceCount} />
                        {message.parts.map((part, i) => {
                          if (part.type === 'source-url') {
                            return (
                              <SourcesContent key={`${message.id}-source-${i}`}>
                                <Source href={part.url} title={part.title || part.url} />
                              </SourcesContent>
                            );
                          }
                          return null;
                        })}
                      </Sources>
                    )}

                    <Message from={message.role}>
                      <MessageContent>
                        {message.parts.map((part, i) => {
                          switch (part.type) {
                            case 'text':
                              return <MessageResponse key={`${message.id}-${i}`}>{part.text}</MessageResponse>;
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

      <div className="border-t border-border p-4 shrink-0">
        <PromptInput onSubmit={handleSubmit}>
          <PromptInputBody>
            <PromptInputTextarea
              value={input}
              ref={textareaRef}
              placeholder="Type your question..."
              onChange={(e) => setInput(e.currentTarget.value)}
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputSpeechButton onTranscriptionChange={setInput} textareaRef={textareaRef} />
            <PromptInputSubmit status={status} disabled={!input.trim() && !status} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
};
