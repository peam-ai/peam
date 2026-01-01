'use client';

import { AskAIDialog, type AskAIDialogProps } from './AskAIDialog';
import { AskAIModal, type AskAIModalProps } from './AskAIModal';

export type AskAIType = 'modal' | 'dialog';

export type AskAIProps = ({ type?: 'modal' } & AskAIModalProps) | ({ type: 'dialog' } & AskAIDialogProps);

export function AskAI({ type = 'modal', ...props }: AskAIProps) {
  switch (type) {
    case 'dialog':
      return <AskAIDialog {...props} />;
    case 'modal':
    default:
      return <AskAIModal {...props} />;
  }
}
