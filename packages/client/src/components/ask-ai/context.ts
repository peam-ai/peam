'use client';

import type { PromptInputMessage } from '@/components/ai-elements/prompt-input';
import type { ChatStatus, UIMessage } from 'ai';
import { createContext } from 'react';

export interface AskAIContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggleOpen: () => void;
  input: string;
  setInput: (value: string, options?: AskAIActionOptions) => void;
  messages: UIMessage[];
  status: ChatStatus;
  error: Error | undefined;
  isLoading: boolean;
  sendMessage: (message: { text: string }, options?: AskAIActionOptions) => void;
  handleSubmit: (message: PromptInputMessage) => void;
  regenerate: (options?: { messageId?: string }) => void;
  clearMessages: () => void | Promise<void>;
}

export type AskAIActionOptions = {
  open?: boolean;
};

const AskAIContext = createContext<AskAIContextValue | null>(null);

export { AskAIContext };
