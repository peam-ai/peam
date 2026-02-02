'use client';

import { useAskAI } from '@/hooks/useAskAI';
import { useIsMobile } from '@/hooks/useIsMobile';
import { cn } from '@/lib/utils';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { AskAIHeader } from './header';
import { AskAIInput } from './input';
import { AskAIMessages } from './messages';
import { AskAISuggestions } from './suggestions';

export interface AskAISidepaneProps extends ComponentPropsWithoutRef<'div'> {
  children?: ReactNode;
}

export function AskAISidepane({ children, className, ...props }: AskAISidepaneProps) {
  const { open, setOpen } = useAskAI();
  const isMobile = useIsMobile();
  const originalBodyStyles = useRef<{ marginRight: string; transition: string } | null>(null);

  useEffect(() => {
    if (isMobile) {
      if (originalBodyStyles.current) {
        document.body.style.marginRight = originalBodyStyles.current.marginRight;
        document.body.style.transition = originalBodyStyles.current.transition;
      }
      return;
    }

    if (open) {
      if (!originalBodyStyles.current) {
        originalBodyStyles.current = {
          marginRight: document.body.style.marginRight,
          transition: document.body.style.transition,
        };
      }

      const width = window.innerWidth >= 1024 ? '480px' : '400px';
      document.body.style.marginRight = width;
      document.body.style.transition = 'margin-right 300ms ease-in-out';
    } else if (originalBodyStyles.current) {
      document.body.style.marginRight = originalBodyStyles.current.marginRight;
      document.body.style.transition = originalBodyStyles.current.transition;
    }

    return () => {
      if (originalBodyStyles.current) {
        document.body.style.marginRight = originalBodyStyles.current.marginRight;
        document.body.style.transition = originalBodyStyles.current.transition;
      }
    };
  }, [open, isMobile]);

  if (!open) {
    return null;
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 md:hidden animate-in fade-in duration-200"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ask-ai-sidepane-title"
        className={cn(
          `fixed z-100 bg-background text-foreground flex flex-col text-left
            inset-x-0 bottom-0 h-[66vh] md:inset-auto
            md:right-0 md:top-0 md:h-full md:w-100 lg:w-120
            border-t md:border-t-0 md:border-l border-border
            shadow-[0_-4px_20px_rgba(0,0,0,0.25)] md:shadow-2xl
            animate-in slide-in-from-bottom md:slide-in-from-right duration-300`,
          className
        )}
        {...props}
      >
        {children ?? (
          <>
            <AskAIHeader titleId="ask-ai-sidepane-title" closeLabel="Close sidepane" />
            <AskAIMessages />
            <AskAISuggestions />
            <AskAIInput />
          </>
        )}
      </div>
    </>
  );
}
