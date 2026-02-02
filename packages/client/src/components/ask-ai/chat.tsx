'use client';

import { useAskAI } from '@/hooks/useAskAI';
import { cn } from '@/lib/utils';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { AskAIHeader } from './header';
import { AskAIInput } from './input';
import { AskAIMessages } from './messages';
import { AskAISuggestions } from './suggestions';

export interface AskAIChatProps extends ComponentPropsWithoutRef<'div'> {
  children?: ReactNode;
}

export function AskAIChat({ children, className, ...props }: AskAIChatProps) {
  const { open, setOpen } = useAskAI();

  if (!open) {
    return null;
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 md:hidden animate-in fade-in duration-200 cursor-pointer"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ask-ai-chat-title"
        className={cn(
          `fixed z-50 bg-background text-foreground flex flex-col text-left
            inset-x-0 bottom-0 h-[66vh] md:h-125 md:inset-auto
            md:right-4 md:bottom-18 md:w-100 md:rounded-sm
            border-t md:border border-border
            shadow-[0_-4px_20px_rgba(0,0,0,0.25)] md:shadow-xl
            animate-in slide-in-from-bottom duration-300 md:duration-0`,
          className
        )}
        {...props}
      >
        {children ?? (
          <>
            <AskAIHeader titleId="ask-ai-chat-title" closeLabel="Close chat" />
            <AskAIMessages />
            <AskAISuggestions />
            <AskAIInput />
          </>
        )}
      </div>
    </>
  );
}
