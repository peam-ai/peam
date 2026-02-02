'use client';

import { PeamIcon } from '@/components/icons/peam';
import { cn } from '@/lib/utils';
import { Trash2, X } from 'lucide-react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { useAskAIContext } from './context';
import { AskAIInput } from './input';
import { AskAIMessages } from './messages';

export interface AskAIChatProps extends ComponentPropsWithoutRef<'div'> {
  children?: ReactNode;
}

export function AskAIChat({ children, className, ...props }: AskAIChatProps) {
  const { open, setOpen, clearMessages, isLoading, initialMessages } = useAskAIContext();

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
        <div className="absolute top-3 right-3 z-10 flex gap-1">
          {!isLoading && initialMessages.length > 0 && (
            <button
              onClick={clearMessages}
              className="p-1 rounded-full border-0 bg-transparent hover:bg-muted cursor-pointer transition-colors"
              aria-label="Clear chat history"
            >
              <Trash2 className="size-4" />
            </button>
          )}
          <button
            onClick={() => setOpen(false)}
            className="p-1 rounded-full border-0 bg-transparent hover:bg-muted cursor-pointer transition-colors"
            aria-label="Close chat"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="px-4 py-3 shrink-0 flex items-center gap-2">
          <PeamIcon className="size-5" />
          <h2 id="ask-ai-chat-title" className="text-lg font-semibold">
            Ask AI
          </h2>
        </div>

        {children ?? (
          <>
            <AskAIMessages />
            <AskAIInput />
          </>
        )}
      </div>
    </>
  );
}
