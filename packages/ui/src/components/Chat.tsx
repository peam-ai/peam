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
import { useChatPersistence } from '@/hooks/useChatPersistence';
import { useChat } from '@ai-sdk/react';
import { loggers } from '@peam/logger';
import { DefaultChatTransport, HttpChatTransport, UIMessage } from 'ai';
import { BotMessageSquare, Check, Copy, RefreshCcw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const log = loggers.ui;

export interface ChatProps {
  chatPersistence: ReturnType<typeof useChatPersistence>;
  suggestedPrompts?: string[];
  onClearRef?: (clearFn: () => void) => void;
  chatTransport?: HttpChatTransport<UIMessage>;
}

export const Chat = ({ chatPersistence, suggestedPrompts, onClearRef, chatTransport }: ChatProps) => {
  const [input, setInput] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const isSyncing = useRef(false);
  const lastSavedMessageCount = useRef(0);
  const { initialMessages, isLoading, saveMessages, clearMessages } = chatPersistence;

  const {
    messages,
    sendMessage: _sendMessage,
    status,
    error,
    regenerate,
    setMessages,
  } = useChat({
    transport:
      chatTransport ??
      new DefaultChatTransport({
        api: '/api/peam',
      }),
  });

  useEffect(() => {
    if (!(isLoading || isInitialized) && initialMessages.length > 0) {
      setMessages(initialMessages);
      lastSavedMessageCount.current = initialMessages.length;
      setIsInitialized(true);
    } else if (!(isLoading || isInitialized)) {
      setIsInitialized(true);
    }
  }, [isLoading, initialMessages, isInitialized, setMessages]);

  useEffect(() => {
    const isIdle = status !== 'submitted' && status !== 'streaming';
    if (isInitialized && !isLoading && !isSyncing.current && isIdle) {
      if (initialMessages.length !== lastSavedMessageCount.current) {
        isSyncing.current = true;
        setMessages(initialMessages);
        lastSavedMessageCount.current = initialMessages.length;
        setTimeout(() => {
          isSyncing.current = false;
        }, 100);
      }
    }
  }, [initialMessages, isInitialized, isLoading, setMessages, status]);

  useEffect(() => {
    const isIdle = status !== 'submitted' && status !== 'streaming';
    if (isInitialized && messages.length >= 0 && !isSyncing.current && isIdle) {
      saveMessages(messages);
      lastSavedMessageCount.current = messages.length;
    }
  }, [messages, saveMessages, isInitialized, status]);

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

  const handleClearChat = useCallback(async () => {
    try {
      await clearMessages();
      setMessages([]);
    } catch (error) {
      log('Failed to clear chat history: %O', error);
    }
  }, [clearMessages, setMessages]);

  useEffect(() => {
    if (onClearRef) {
      onClearRef(handleClearChat);
    }
  }, [onClearRef, handleClearChat]);

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
        <ConversationContent
          className={messages.length === 0 && !error && !isLoading ? 'justify-between min-h-full' : ''}
        >
          {isLoading ? (
            <div className="flex items-center justify-center flex-1">
              <ConversationEmptyState
                icon={<BotMessageSquare className="size-12 animate-pulse" />}
                title="Loading chat history..."
                description="Please wait"
              />
            </div>
          ) : messages.length === 0 && !error ? (
            <>
              <div className="flex items-center justify-center flex-1">
                <ConversationEmptyState
                  icon={<BotMessageSquare className="size-12" />}
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

      <div className="p-4 shrink-0">
        <PromptInput onSubmit={handleSubmit}>
          <PromptInputBody>
            <PromptInputTextarea
              value={input}
              ref={textareaRef}
              placeholder="Type your question..."
              onChange={(e) => setInput(e.currentTarget.value)}
              maxLength={1000}
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputSpeechButton onTranscriptionChange={setInput} textareaRef={textareaRef} />
            <PromptInputSubmit status={status} disabled={!input.trim() && status !== 'streaming'} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
};
