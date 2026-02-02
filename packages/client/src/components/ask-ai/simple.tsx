'use client';

import { useDarkMode } from '@/hooks/useDarkMode';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import { AskAIDialog } from './dialog';
import { AskAIRoot, type AskAIRootProps } from './root';
import { AskAITrigger } from './trigger';

export interface AskAIProps extends AskAIRootProps {
  children?: ReactNode;
  className?: string;
}

export function AskAI({ children, className, ...props }: AskAIProps) {
  const isDarkMode = useDarkMode();

  const hasCustomChildren = Boolean(children);

  return (
    <div className={cn('peam-root', isDarkMode && 'dark', className)}>
      <AskAIRoot {...props}>
        {hasCustomChildren ? (
          children
        ) : (
          <>
            <AskAITrigger />
            <AskAIDialog />
          </>
        )}
      </AskAIRoot>
    </div>
  );
}
