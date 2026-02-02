'use client';

import { AskAIChat } from '@/ask-ai/chat';
import { AskAIDialog } from '@/ask-ai/dialog';
import { AskAIInline } from '@/ask-ai/inline';
import { AskAIInput } from '@/ask-ai/input';
import { AskAIMessages } from '@/ask-ai/messages';
import { AskAIRoot } from '@/ask-ai/root';
import { AskAISidepane } from '@/ask-ai/sidepane';
import { AskAI as AskAISimple } from '@/ask-ai/simple';
import { AskAITrigger } from '@/ask-ai/trigger';

export const AskAI = Object.assign(AskAISimple, {
  Root: AskAIRoot,
  Trigger: AskAITrigger,
  Dialog: AskAIDialog,
  Chat: AskAIChat,
  Sidepane: AskAISidepane,
  Messages: AskAIMessages,
  Input: AskAIInput,
  Inline: AskAIInline,
  Simple: AskAISimple,
});

export type { AskAIChatProps } from '@/ask-ai/chat';
export type { AskAIDialogProps } from '@/ask-ai/dialog';
export type { AskAIInlineProps } from '@/ask-ai/inline';
export type { AskAIInputProps } from '@/ask-ai/input';
export type { AskAIMessagesProps } from '@/ask-ai/messages';
export type { AskAIRootProps } from '@/ask-ai/root';
export type { AskAISidepaneProps } from '@/ask-ai/sidepane';
export type { AskAIProps } from '@/ask-ai/simple';
