'use client';

import { AskAI as AskAIDefault } from '@/ask-ai/ask-ai';
import { AskAIChat } from '@/ask-ai/chat';
import { AskAIDialog } from '@/ask-ai/dialog';
import { AskAIHeader } from '@/ask-ai/header';
import { AskAIInline } from '@/ask-ai/inline';
import { AskAIInput } from '@/ask-ai/input';
import { AskAIMessages } from '@/ask-ai/messages';
import { AskAIRoot } from '@/ask-ai/root';
import { AskAISidepane } from '@/ask-ai/sidepane';
import { AskAITrigger } from '@/ask-ai/trigger';

export const AskAI = Object.assign(AskAIDefault, {
  Root: AskAIRoot,
  Trigger: AskAITrigger,
  Header: AskAIHeader,
  Dialog: AskAIDialog,
  Chat: AskAIChat,
  Sidepane: AskAISidepane,
  Messages: AskAIMessages,
  Input: AskAIInput,
  Inline: AskAIInline,
});

export type { AskAIProps } from '@/ask-ai/ask-ai';
export type { AskAIChatProps } from '@/ask-ai/chat';
export type { AskAIDialogProps } from '@/ask-ai/dialog';
export type { AskAIHeaderProps } from '@/ask-ai/header';
export type { AskAIInlineProps } from '@/ask-ai/inline';
export type { AskAIInputProps } from '@/ask-ai/input';
export type { AskAIMessagesProps } from '@/ask-ai/messages';
export type { AskAIProviderProps } from '@/ask-ai/provider';
export type { AskAIRootProps } from '@/ask-ai/root';
export type { AskAISidepaneProps } from '@/ask-ai/sidepane';
