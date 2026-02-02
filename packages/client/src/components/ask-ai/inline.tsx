'use client';

import { cn } from '@/lib/utils';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { AskAIInput } from './input';
import { AskAIMessages } from './messages';

export interface AskAIInlineProps extends ComponentPropsWithoutRef<'div'> {
  children?: ReactNode;
}

export function AskAIInline({ children, className, ...props }: AskAIInlineProps) {
  return (
    <div className={cn('flex flex-col h-full bg-background rounded-sm', className)} {...props}>
      {children ?? (
        <>
          <AskAIMessages />
          <AskAIInput />
        </>
      )}
    </div>
  );
}
