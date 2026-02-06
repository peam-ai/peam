'use client';

import { AskAIHeader } from '@/ask-ai/header';
import { AskAIInput } from '@/ask-ai/input';
import { AskAIMessages } from '@/ask-ai/messages';
import { AskAISuggestions } from '@/ask-ai/suggestions';
import { cn } from '@/lib/utils';
import type { ComponentPropsWithoutRef } from 'react';

export type AskAIInlineProps = ComponentPropsWithoutRef<'div'>;

export function AskAIInline({ className, ...props }: AskAIInlineProps) {
  return (
    <div className={cn('flex flex-col min-h-full h-full min-w-0', className)} {...props}>
      <AskAIHeader />
      <AskAIMessages />
      <AskAISuggestions />
      <AskAIInput />
    </div>
  );
}
