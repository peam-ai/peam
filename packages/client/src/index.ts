'use client';

import './global.css';

export { AskAIProvider } from '@/ask-ai/provider';
export { AskAI } from '@/components/AskAI';
export type {
  AskAIChatProps,
  AskAIDialogProps,
  AskAIHeaderProps,
  AskAIInlineProps,
  AskAIInputProps,
  AskAIMessagesProps,
  AskAIProps,
  AskAIProviderProps,
  AskAIRootProps,
  AskAISidepaneProps,
} from '@/components/AskAI';
export { useAskAI } from '@/hooks/useAskAI';
