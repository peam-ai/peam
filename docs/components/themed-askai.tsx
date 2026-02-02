'use client';

import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { AskAI } from 'peam/client';
import type { ComponentProps } from 'react';

type ThemedAskAIProps = ComponentProps<typeof AskAI>;

export const ThemedAskAI = ({ children, className, ...props }: ThemedAskAIProps) => {
  const { resolvedTheme } = useTheme();

  return (
    <AskAI {...props} className={cn(resolvedTheme === 'dark' && 'dark', className)}>
      {children ?? (
        <>
          <AskAI.Trigger />
          <AskAI.Sidepane />
        </>
      )}
    </AskAI>
  );
};
