'use client';

import { BotMessageSquare, Trash2, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useAskAI } from '../hooks/useAskAI';
import type { AskAIBaseProps } from './AskAI';
import { Chat } from './Chat';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AskAISidepaneProps extends AskAIBaseProps {}

export function AskAISidepane({ suggestedPrompts }: AskAISidepaneProps = {}) {
  const { isOpen, mounted, chatClearRef, chatPersistence, handleToggle, handleClose, handleClear } = useAskAI();
  const originalBodyStyles = useRef<{ marginRight: string; transition: string } | null>(null);

  useEffect(() => {
    if (isOpen && !originalBodyStyles.current) {
      originalBodyStyles.current = {
        marginRight: document.body.style.marginRight,
        transition: document.body.style.transition,
      };
    }

    if (isOpen) {
      const width = window.innerWidth >= 1024 ? '480px' : window.innerWidth >= 768 ? '400px' : '100vw';
      document.body.style.marginRight = width;
      document.body.style.transition = 'margin-right 300ms ease-in-out';
    } else if (originalBodyStyles.current) {
      document.body.style.marginRight = originalBodyStyles.current.marginRight;
      document.body.style.transition = originalBodyStyles.current.transition;
    }

    return () => {
      if (originalBodyStyles.current) {
        document.body.style.marginRight = originalBodyStyles.current.marginRight;
        document.body.style.transition = originalBodyStyles.current.transition;
      }
    };
  }, [isOpen]);

  return (
    <div className="peam-root">
      {!isOpen && (
        <button
          onClick={handleToggle}
          className="fixed right-4 bottom-4 z-60 rounded-full bg-primary shadow-lg hover:scale-110 active:scale-90 transition-transform flex items-center justify-center text-primary-foreground size-11 cursor-pointer"
          aria-label="Ask AI"
          aria-expanded={isOpen}
        >
          <BotMessageSquare className="size-6" />
        </button>
      )}

      {mounted && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="ask-ai-sidepane-title"
          className={`fixed z-50 right-0 top-0 h-full w-full md:w-100 lg:w-120 bg-background flex flex-col border-l border-border transition-transform duration-300 ${
            isOpen
              ? 'translate-x-0 cursor-default pointer-events-auto shadow-2xl'
              : 'translate-x-full cursor-default pointer-events-none'
          }`}
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
              aria-label="Close sidepane"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="px-4 py-3 shrink-0 flex items-center gap-2">
            <BotMessageSquare className="size-5" />
            <h2 id="ask-ai-sidepane-title" className="text-lg font-semibold">
              Ask AI
            </h2>
          </div>

          {isOpen && (
            <div className="flex-1 min-h-0 h-0">
              <Chat
                chatPersistence={chatPersistence}
                suggestedPrompts={suggestedPrompts}
                onClearRef={(clearFn) => (chatClearRef.current = clearFn)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
