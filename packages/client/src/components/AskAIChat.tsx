'use client';

import { Trash2, X } from 'lucide-react';
import { useAskAI } from '../hooks/useAskAI';
import type { AskAIBaseProps } from './AskAI';
import { Chat } from './Chat';
import { PeamCloseIcon, PeamIcon } from './icons/peam';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AskAIChatProps extends AskAIBaseProps {}

export function AskAIChat({ suggestedPrompts, button, maxMessages }: AskAIChatProps = {}) {
  const { isOpen, chatClearRef, chatPersistence, handleToggle, handleOpen, handleClose, handleClear } = useAskAI();

  return (
    <div className="peam-root">
      {button ? (
        button({ isOpen, toggle: handleToggle, open: handleOpen, close: handleClose })
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleToggle}
              className="fixed right-4 bottom-4 z-50 hover:scale-110 active:scale-90 transition-transform flex items-center justify-center cursor-pointer bg-transparent border-0 p-0"
              aria-label="Ask AI"
            >
              {isOpen ? (
                <PeamCloseIcon className="size-10 drop-shadow-lg" />
              ) : (
                <PeamIcon className="size-10 drop-shadow-lg" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="left">Ask AI</TooltipContent>
        </Tooltip>
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
            className={`fixed z-50 bg-background flex flex-col
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
    </div>
  );
}
