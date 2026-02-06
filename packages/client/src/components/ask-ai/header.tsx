'use client';

import { PeamIcon } from '@/components/icons/peam';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAskAI } from '@/hooks/useAskAI';
import { Trash2, X } from 'lucide-react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

export interface AskAIHeaderProps extends ComponentPropsWithoutRef<'div'> {
  heading?: ReactNode;
  closeLabel?: string;
}

export function AskAIHeader({ heading = 'Ask AI', closeLabel = 'Close', ...props }: AskAIHeaderProps) {
  const { setOpen, clearMessages, isLoading, messages } = useAskAI();

  return (
    <div {...props}>
      <div className={'absolute top-3 right-3 z-10 flex gap-1'}>
        {!isLoading && messages.length > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={clearMessages}
                className="p-1 rounded-full border-0 bg-transparent hover:bg-muted cursor-pointer transition-colors"
                aria-label="Delete conversation"
              >
                <Trash2 className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Delete conversation</TooltipContent>
          </Tooltip>
        )}
        <button
          onClick={() => setOpen(false)}
          className="p-1 rounded-full border-0 bg-transparent hover:bg-muted cursor-pointer transition-colors"
          aria-label={closeLabel}
        >
          <X className="size-4" />
        </button>
      </div>

      <div className={'px-4 py-3 shrink-0 flex items-center gap-2'}>
        <PeamIcon className="size-5" />
        <h2 className="text-lg font-semibold">{heading}</h2>
      </div>
    </div>
  );
}
