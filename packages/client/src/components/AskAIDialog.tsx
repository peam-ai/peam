'use client';

import { Trash2, X } from 'lucide-react';
import { useAskAI } from '../hooks/useAskAI';
import { cn } from '../lib/utils';
import type { AskAIBaseProps } from './AskAI';
import { Chat } from './Chat';
import { PeamIcon } from './icons/peam';
import { PeamButton } from './PeamButton';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AskAIDialogProps extends AskAIBaseProps {}

export function AskAIDialog({
  suggestedPrompts,
  button,
  maxMessages,
  inlineButton = false,
  className,
}: AskAIDialogProps = {}) {
  const { isOpen, chatClearRef, chatPersistence, handleToggle, handleOpen, handleClose, handleClear } = useAskAI();

  return (
    <div className={cn('peam-root', className)}>
      {button ? (
        button({ isOpen, toggle: handleToggle, open: handleOpen, close: handleClose })
      ) : (
        <PeamButton onClick={handleToggle} isOpen={isOpen} inlineButton={inlineButton} className="z-30" />
      )}

      {isOpen && (
        <>
          {/* Mobile backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 animate-in fade-in duration-200 cursor-pointer"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Container */}
          <div
            className="fixed z-100 inset-0 flex items-center justify-center p-4 md:p-0 cursor-pointer"
            onClick={handleClose}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="ask-ai-dialog-title"
              className="bg-background text-foreground flex flex-col w-full max-w-2xl h-[80vh] md:h-150 rounded-lg border border-border shadow-2xl animate-in zoom-in-95 duration-200 relative cursor-default text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-3 right-3 z-10 flex gap-1">
                {!chatPersistence.isLoading && chatPersistence.initialMessages.length > 0 && (
                  <button
                    onClick={handleClear}
                    className="p-1 rounded-full border-0 bg-transparent hover:bg-muted cursor-pointer transition-colors"
                    aria-label="Clear chat history"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
                <button
                  onClick={handleClose}
                  className="p-1 rounded-full border-0 bg-transparent hover:bg-muted cursor-pointer transition-colors"
                  aria-label="Close dialog"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="px-4 py-3 shrink-0 flex items-center gap-2">
                <PeamIcon className="size-5" />
                <h2 id="ask-ai-dialog-title" className="text-lg font-semibold">
                  Ask AI
                </h2>
              </div>

              <div className="flex-1 min-h-0 h-0">
                <Chat
                  chatPersistence={chatPersistence}
                  suggestedPrompts={suggestedPrompts}
                  onClearRef={(clearFn) => (chatClearRef.current = clearFn)}
                  maxMessages={maxMessages}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
