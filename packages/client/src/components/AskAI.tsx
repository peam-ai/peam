'use client';

import { AskAIChat, type AskAIChatProps } from './AskAIChat';
import { AskAIDialog, type AskAIDialogProps } from './AskAIDialog';
import { AskAISidepane, type AskAISidepaneProps } from './AskAISidepane';

export type AskAIType = 'chat' | 'dialog' | 'sidepane';

export interface AskAIBaseProps {
  suggestedPrompts?: string[];
}

export type AskAIProps =
  | ({ type?: 'chat' } & AskAIChatProps)
  | ({ type: 'dialog' } & AskAIDialogProps)
  | ({ type: 'sidepane' } & AskAISidepaneProps);

export function AskAI({ type = 'chat', ...props }: AskAIProps) {
  switch (type) {
    case 'dialog':
      return <AskAIDialog {...props} />;
    case 'sidepane':
      return <AskAISidepane {...props} />;
    case 'chat':
    default:
      return <AskAIChat {...props} />;
  }
}
