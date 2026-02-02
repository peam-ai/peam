'use client';

import { useAskAI } from '@/hooks/useAskAI';
import { cn } from '@/lib/utils';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { useId } from 'react';
import { AskAIHeader } from './header';
import { AskAIInput } from './input';
import { AskAIMessages } from './messages';

export interface AskAIDialogProps extends ComponentPropsWithoutRef<'div'> {
  children?: ReactNode;
}

export function AskAIDialog({ children, className, ...props }: AskAIDialogProps) {
  const { open, setOpen } = useAskAI();
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
          {children ?? (
            <>
              <AskAIHeader titleId={titleId} closeLabel="Close dialog" />
              <AskAIMessages />
              <AskAIInput />
            </>
          )}
        </div>
      </div>
    </>
  );
}
