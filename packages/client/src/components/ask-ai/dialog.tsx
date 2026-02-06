'use client';

import { AskAIInline } from '@/ask-ai/inline';
import { useAskAI } from '@/hooks/useAskAI';
import { cn } from '@/lib/utils';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

export interface AskAIDialogProps extends ComponentPropsWithoutRef<'div'> {
  children?: ReactNode;
}

export function AskAIDialog({ children, className, ...props }: AskAIDialogProps) {
  const { open, setOpen } = useAskAI();

  if (!open) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        aria-label="Close dialog"
        className="fixed inset-0 z-40 bg-black/50 animate-in fade-in duration-200 cursor-pointer"
        onClick={() => setOpen(false)}
      />

      <div className="fixed z-50 inset-0 flex items-center justify-center p-4 md:p-0 pointer-events-none">
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Ask AI"
          className={cn(
            'pointer-events-auto cursor-auto bg-background text-foreground flex flex-col w-full max-w-2xl h-[80vh] md:h-150 rounded-lg border border-border shadow-2xl animate-in zoom-in-95 duration-200 relative text-left',
            className
          )}
          {...props}
        >
          {children ?? <AskAIInline />}
        </div>
      </div>
    </>
  );
}
