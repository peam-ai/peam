'use client';

import { Trash2, X } from 'lucide-react';
import { useAskAI } from '../hooks/useAskAI';
import type { AskAIBaseProps } from './AskAI';
import { Chat } from './Chat';
import { PeamIcon } from './icons/peam';
import { PeamButton } from './PeamButton';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AskAIChatProps extends AskAIBaseProps {}

export function AskAIChat({ suggestedPrompts, button, maxMessages, inlineButton = false }: AskAIChatProps = {}) {
  const { isOpen, chatClearRef, chatPersistence, handleToggle, handleOpen, handleClose, handleClear } = useAskAI();

  return (
    <>
      {button ? (
        button({ isOpen, toggle: handleToggle, open: handleOpen, close: handleClose })
      ) : (
        <PeamButton onClick={handleToggle} isOpen={isOpen} inlineButton={inlineButton} className="z-50" />
      )}

      {isOpen && (
        <>
          {/* Mobile backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden animate-in fade-in duration-200 cursor-pointer"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Container */}
          <div
            className={`fixed z-50 bg-background text-foreground flex flex-col text-left
              inset-x-0 bottom-0 h-[66vh] md:h-125 md:inset-auto
              md:right-4 ${button ? 'md:bottom-4' : 'md:bottom-18'} md:w-100 md:rounded-sm
              border-t md:border border-border
              shadow-[0_-4px_20px_rgba(0,0,0,0.25)] md:shadow-xl
              animate-in slide-in-from-bottom duration-300 md:duration-0`}
          >
            <div className="absolute top-3 right-3 z-10 flex gap-1">
              {chatPersistence.initialMessages.length > 0 && (
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
                aria-label="Close Ask AI"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="px-4 py-3 shrink-0 flex items-center gap-2">
              <PeamIcon className="size-5" />
              <h2 className="text-lg font-semibold">Ask AI</h2>
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
        </>
      )}
    </>
  );
}
