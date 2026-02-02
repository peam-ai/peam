'use client';

import { PeamIcon } from '@/components/icons/peam';
import { cn } from '@/lib/utils';
import { Trash2, X } from 'lucide-react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { useId } from 'react';
import { useAskAIContext } from './context';
import { AskAIInput } from './input';
import { AskAIMessages } from './messages';

export interface AskAIDialogProps extends ComponentPropsWithoutRef<'div'> {
  children?: ReactNode;
}

export function AskAIDialog({ children, className, ...props }: AskAIDialogProps) {
  const { open, setOpen, clearMessages, isLoading, initialMessages } = useAskAIContext();
  const titleId = useId();

  if (!open) {
    return null;
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 animate-in fade-in duration-200"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <div className="fixed z-100 inset-0 flex items-center justify-center p-4 md:p-0">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className={cn(
            'bg-background text-foreground flex flex-col w-full max-w-2xl h-[80vh] md:h-150 rounded-lg border border-border shadow-2xl animate-in zoom-in-95 duration-200 relative text-left',
            className
          )}
          onClick={(e) => e.stopPropagation()}
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
              aria-label="Close dialog"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="px-4 py-3 shrink-0 flex items-center gap-2">
            <PeamIcon className="size-5" />
            <h2 id={titleId} className="text-lg font-semibold">
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
      </div>
    </>
  );
}
