'use client';

import { BotMessageSquare, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useChatPersistence } from '../hooks/useChatPersistence';
import { Chat } from './Chat';

export interface AskAIChatProps {
  suggestedPrompts?: string[];
}
export function AskAIChat({ suggestedPrompts }: AskAIChatProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const chatClearRef = useRef<(() => void) | null>(null);
  const chatPersistence = useChatPersistence();

  const handleModalClick = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleClear = () => {
    if (chatClearRef.current) {
      chatClearRef.current();
    }
  };

  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      const isEscape = event.key === 'Escape' || event.key === 'Esc' || event.keyCode === 27;
      if (isEscape && isOpen) {
        handleClose();
        return;
      }

      const isIKey = event.key === 'i' || event.key === 'I' || event.keyCode === 73;
      const hasModifier = event.metaKey;

      if (hasModifier && isIKey) {
        event.preventDefault();
        event.stopPropagation();
        setIsOpen(!isOpen);
      }
    };

    document.addEventListener('keydown', handleKeyboard);

    return () => {
      document.removeEventListener('keydown', handleKeyboard);
    };
  }, [isOpen]);

  return (
    <div className="peam-root">
      <button
        onClick={handleModalClick}
        className={`fixed right-4 bottom-4 z-50 rounded-full bg-primary shadow-lg hover:scale-110 active:scale-90 transition-transform flex items-center justify-center text-primary-foreground size-11`}
        aria-label="Ask AI"
      >
        {isOpen ? <X className="size-6" /> : <BotMessageSquare className="size-6" />}
      </button>

      {isOpen && (
        <>
          {/* Mobile backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden animate-in fade-in duration-200"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Modal container */}
          <div
            className={`fixed z-50 bg-background flex flex-col
              inset-x-0 bottom-0 h-[66vh] md:h-125 md:inset-auto
              md:right-4 md:bottom-20 md:w-100 md:rounded-sm
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
              <BotMessageSquare className="size-5" />
              <h2 className="text-lg font-semibold">Ask AI</h2>
            </div>

            <div className="flex-1 min-h-0 h-0">
              <Chat
                chatPersistence={chatPersistence}
                suggestedPrompts={suggestedPrompts}
                onClearRef={(clearFn) => (chatClearRef.current = clearFn)}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
