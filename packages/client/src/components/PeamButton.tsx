'use client';

import { PeamCloseIcon, PeamIcon } from '@/components/icons/peam';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export type PeamButtonVariant = 'icon' | 'iconLabel';

export interface PeamButtonProps {
  onClick: () => void;
  isOpen: boolean;
  inlineButton?: boolean;
  className?: string;
  showCloseIcon?: boolean;
  variant?: PeamButtonVariant;
}

function PeamButtonIcon({
  isOpen,
  showCloseIcon,
  className,
}: Pick<PeamButtonProps, 'isOpen' | 'showCloseIcon' | 'className'>) {
  return isOpen && showCloseIcon ? <PeamCloseIcon className={className} /> : <PeamIcon className={className} />;
}

export function PeamButton({
  onClick,
  isOpen,
  inlineButton = false,
  className = '',
  showCloseIcon = true,
  variant = 'iconLabel',
}: PeamButtonProps) {
  if (variant === 'icon') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={onClick}
            className={cn(
              inlineButton ? '' : 'fixed right-4 bottom-4',
              'hover:scale-110 active:scale-90 transition-transform flex items-center justify-center bg-transparent text-foreground p-0 border-0 filter-[drop-shadow(0_0_1px_rgba(255,255,255,0.8))_drop-shadow(0_1px_1px_rgba(0,0,0,0.3))]',
              className
            )}
            aria-label="Ask AI"
            aria-expanded={isOpen}
          >
            <PeamButtonIcon isOpen={isOpen} showCloseIcon={showCloseIcon} className={'size-10'} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="left">Ask AI</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Button
      type="button"
      onClick={onClick}
      variant={'default'}
      size={'default'}
      className={cn(
        inlineButton ? '' : 'fixed right-4 bottom-4',
        'hover:scale-110 active:scale-90 transition-all gap-2 rounded-full bg-background text-foreground border border-border px-6 py-3 hover:bg-background',
        className
      )}
      aria-label={'Ask AI'}
      aria-expanded={isOpen}
    >
      <PeamButtonIcon isOpen={isOpen} showCloseIcon={showCloseIcon} className={'size-4'} />
      <span>Ask AI</span>
    </Button>
  );
}
