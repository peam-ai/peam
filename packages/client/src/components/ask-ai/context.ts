'use client';

import type { PromptInputMessage } from '@/components/ai-elements/prompt-input';
import type { ChatStatus, UIMessage } from 'ai';
import { createContext, useContext } from 'react';

export interface AskAIContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggleOpen: () => void;
  endpoint?: string;
  suggestedPrompts?: string[];
  maxMessages?: number;
  input: string;
  setInput: (value: string) => void;
  messages: UIMessage[];
  status: ChatStatus;
  error: Error | undefined;
  isLoading: boolean;
  initialMessages: UIMessage[];
  sendMessage: (message: { text: string }) => void;
  handleSubmit: (message: PromptInputMessage) => void;
  regenerate: (options?: { messageId?: string }) => void;
  clearMessages: () => void | Promise<void>;
}

const AskAIContext = createContext<AskAIContextValue | null>(null);

export function useAskAIContext(): AskAIContextValue {
  const context = useContext(AskAIContext);

  if (!context) {
    throw new Error('AskAI components must be used within <AskAI.Root>.');
  }

  return context;
}

export { AskAIContext };
