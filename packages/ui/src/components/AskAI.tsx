'use client';

import { AskAIModal, type AskAIModalProps } from './AskAIModal';

export type AskAIType = 'modal';

export interface AskAIProps extends AskAIModalProps {
  type?: AskAIType;
}

export function AskAI({ type = 'modal', ...props }: AskAIProps) {
  switch (type) {
    case 'modal':
    default:
      return <AskAIModal {...props} />;
  }
}
