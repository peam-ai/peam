'use client';

import { PeamButton, type PeamButtonVariant } from '@/ask-ai/peam-button';
import { useAskAI } from '@/hooks/useAskAI';
import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { forwardRef } from 'react';

export interface AskAITriggerProps extends ComponentPropsWithoutRef<'button'> {
  asChild?: boolean;
  children?: ReactNode;
  inlineButton?: boolean;
  variant?: PeamButtonVariant;
}

export const AskAITrigger = forwardRef<HTMLButtonElement, AskAITriggerProps>(
  ({ asChild = false, children, className, onClick, inlineButton, variant, ...props }, ref) => {
    const { open, toggleOpen } = useAskAI();
    const Comp = asChild ? Slot : 'button';

    const handleClick: ComponentPropsWithoutRef<'button'>['onClick'] = (event) => {
      onClick?.(event);
      if (event.defaultPrevented) {
        return;
      }
      toggleOpen();
    };

    if (!asChild && !children) {
      return (
        <PeamButton
          onClick={toggleOpen}
          isOpen={open}
          className={className}
          inlineButton={inlineButton}
          variant={variant}
        />
      );
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
