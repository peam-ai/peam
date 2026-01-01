'use client';

import { AskAIDialog, type AskAIDialogProps } from './AskAIDialog';
import { AskAIModal, type AskAIModalProps } from './AskAIModal';
import { AskAISidepane, type AskAISidepaneProps } from './AskAISidepane';

export type AskAIType = 'modal' | 'dialog' | 'sidepane';

export type AskAIProps =
  | ({ type?: 'modal' } & AskAIModalProps)
  | ({ type: 'dialog' } & AskAIDialogProps)
  | ({ type: 'sidepane' } & AskAISidepaneProps);

export function AskAI({ type = 'modal', ...props }: AskAIProps) {
  switch (type) {
    case 'dialog':
      return <AskAIDialog {...props} />;
    case 'sidepane':
      return <AskAISidepane {...props} />;
    case 'modal':
    default:
      return <AskAIModal {...props} />;
  }
}
