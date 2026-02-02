'use client';

import { PeamButton } from '@/components/PeamButton';
import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { forwardRef } from 'react';
import { useAskAIContext } from './context';

export interface AskAITriggerProps extends ComponentPropsWithoutRef<'button'> {
  asChild?: boolean;
  children?: ReactNode;
}

export const AskAITrigger = forwardRef<HTMLButtonElement, AskAITriggerProps>(
  ({ asChild = false, children, className, onClick, ...props }, ref) => {
    const { open, toggleOpen } = useAskAIContext();
    const Comp = asChild ? Slot : 'button';

    const handleClick: ComponentPropsWithoutRef<'button'>['onClick'] = (event) => {
      onClick?.(event);
      if (event.defaultPrevented) {
        return;
      }
      toggleOpen();
    };

    if (!asChild && !children) {
      return <PeamButton onClick={toggleOpen} isOpen={open} className={className} />;
    }

    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : 'button'}
        aria-expanded={open}
        data-state={open ? 'open' : 'closed'}
        className={cn(className)}
        onClick={handleClick}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);

AskAITrigger.displayName = 'AskAITrigger';
