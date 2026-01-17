'use client';

import { PeamCloseIcon, PeamIcon } from './icons/peam';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

export interface PeamButtonProps {
  onClick: () => void;
  isOpen: boolean;
  inlineButton?: boolean;
  className?: string;
  showCloseIcon?: boolean;
}

export function PeamButton({
  onClick,
  isOpen,
  inlineButton = false,
  className = '',
  showCloseIcon = true,
}: PeamButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className={`${
            inlineButton ? '' : 'fixed right-4 bottom-4'
          } hover:scale-110 active:scale-90 transition-transform flex items-center justify-center cursor-pointer bg-transparent p-0 border-0 filter-[drop-shadow(0_0_1px_rgba(255,255,255,0.8))_drop-shadow(0_1px_1px_rgba(0,0,0,0.3))] ${className}`}
          aria-label="Ask AI"
          aria-expanded={isOpen}
        >
          {isOpen && showCloseIcon ? <PeamCloseIcon className="size-10" /> : <PeamIcon className="size-10" />}
        </button>
      </TooltipTrigger>
      <TooltipContent side="left">Ask AI</TooltipContent>
    </Tooltip>
  );
}
