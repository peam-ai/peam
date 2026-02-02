'use client';

import { PeamIcon } from '@/components/icons/peam';
import { Trash2, X } from 'lucide-react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { useAskAIContext } from './context';

export interface AskAIHeaderProps extends ComponentPropsWithoutRef<'div'> {
  titleId?: string;
  heading?: ReactNode;
  closeLabel?: string;
}

export function AskAIHeader({ titleId, heading = 'Ask AI', closeLabel = 'Close', ...props }: AskAIHeaderProps) {
  const { setOpen, clearMessages, isLoading, initialMessages } = useAskAIContext();

  return (
    <div {...props}>
      <div className={'absolute top-3 right-3 z-10 flex gap-1'}>
        {!isLoading && initialMessages.length > 0 && (
          <button
            onClick={clearMessages}
            className="p-1 rounded-full border-0 bg-transparent hover:bg-muted cursor-pointer transition-colors"
            aria-label="Clear chat history"
          >
            <Trash2 className="size-4" />
          </button>
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
        <h2 id={titleId} className="text-lg font-semibold">
          {heading}
        </h2>
      </div>
    </div>
  );
}
