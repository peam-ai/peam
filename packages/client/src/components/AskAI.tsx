'use client';

import type { ReactNode } from 'react';
import { useDarkMode } from '../hooks/useDarkMode';
import { cn } from '../lib/utils';
import { AskAIChat, type AskAIChatProps } from './AskAIChat';
import { AskAIDialog, type AskAIDialogProps } from './AskAIDialog';
import { AskAISidepane, type AskAISidepaneProps } from './AskAISidepane';

export type AskAIType = 'chat' | 'dialog' | 'sidepane';

export interface AskAIBaseProps {
  /**
   * Array of suggested prompts to display to the user.
   */
  suggestedPrompts?: string[];
  /**
   * Maximum number of messages to keep in context before summarizing.
   * @default 10
   */
  maxMessages?: number;
  /**
   * Render the button inline instead of as a floating button.
   * @default false
   */
  inlineButton?: boolean;
  /**
   * Additional CSS classes to apply to the root container.
   */
  className?: string;
  /**
   * Custom button component.
   *
   * @example
   * ```tsx
   * <AskAI
   *   type="dialog"
   *   button={({ isOpen, toggle, open, close }) => (
   *     <button onClick={toggle}>
   *       {isOpen ? 'Close' : 'Open'} AI
   *     </button>
   *   )}
   * />
   * ```
   */
  button?: (props: { isOpen: boolean; toggle: () => void; open: () => void; close: () => void }) => ReactNode;
}

export type AskAIProps =
  | ({ type?: 'chat' } & AskAIChatProps)
  | ({ type: 'dialog' } & AskAIDialogProps)
  | ({ type: 'sidepane' } & AskAISidepaneProps);

export function AskAI({ type = 'chat', className, ...props }: AskAIProps) {
  const isDarkMode = useDarkMode();

  const content = (() => {
    switch (type) {
      case 'dialog':
        return <AskAIDialog {...props} />;
      case 'sidepane':
        return <AskAISidepane {...props} />;
      case 'chat':
      default:
        return <AskAIChat {...props} />;
    }
  })();

  return <div className={cn('peam-root', isDarkMode && 'dark', className)}>{content}</div>;
}
