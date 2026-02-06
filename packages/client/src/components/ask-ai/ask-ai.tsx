'use client';

import { useDarkMode } from '@/hooks/useDarkMode';
import { cn } from '@/lib/utils';
import { Children, ComponentPropsWithoutRef, useContext, type ReactNode } from 'react';
import { AskAIContext } from './context';
import { AskAIDialog } from './dialog';
import { AskAIRoot, type AskAIRootProps } from './root';
import { AskAITrigger } from './trigger';

export type AskAIProps = AskAIRootProps & {
  children?: ReactNode;
  /**
   * When true, reuses an existing {@link AskAIContext} if present.
   * @default true
   */
  reuseContext?: boolean;
} & ComponentPropsWithoutRef<'div'>;

export function AskAI({ children, className, reuseContext = true, ...props }: AskAIProps) {
  const isDarkMode = useDarkMode();
  const existingContext = useContext(AskAIContext);
  const hasCustomChildren = Children.count(children) > 0;

  const content = hasCustomChildren ? (
    children
  ) : (
    <>
      <AskAITrigger />
      <AskAIDialog />
    </>
  );

  const shouldProvide = reuseContext ? !existingContext : true;

  return (
    <div className={cn('peam-root', isDarkMode && 'dark', className)} {...props}>
      {shouldProvide ? <AskAIRoot {...props}>{content}</AskAIRoot> : content}
    </div>
  );
}
