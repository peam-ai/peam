'use client';

import { AskAIInline } from '@/ask-ai/inline';
import { useAskAI } from '@/hooks/useAskAI';
import { cn } from '@/lib/utils';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

export interface AskAISidepaneProps extends ComponentPropsWithoutRef<'div'> {
  children?: ReactNode;
}

export function AskAISidepane({ children, className, ...props }: AskAISidepaneProps) {
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
        aria-label="Ask AI"
        className={cn(
          `fixed z-50 bg-background text-foreground flex flex-col text-left
            inset-x-0 bottom-0 h-[66vh] md:inset-auto
            md:right-0 md:top-0 md:h-full md:w-100 lg:w-120
            border-t md:border-t-0 md:border-l border-border
            shadow-[0_-4px_20px_rgba(0,0,0,0.25)] md:shadow-2xl
            animate-in slide-in-from-bottom md:slide-in-from-right duration-300`,
          className
        )}
        {...props}
      >
        {children ?? <AskAIInline />}
      </div>
    </>
  );
}
