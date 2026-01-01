'use client';

import { BotMessageSquare, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useChatPersistence } from '../hooks/useChatPersistence';
import { Chat } from './Chat';

export interface AskAIDialogProps {
  suggestedPrompts?: string[];
}

export function AskAIDialog({ suggestedPrompts }: AskAIDialogProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const chatClearRef = useRef<(() => void) | null>(null);
  const chatPersistence = useChatPersistence();
  const dialogRef = useRef<HTMLDivElement>(null);

  const handleModalClick = () => {
    if (isOpen) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
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
        className="fixed right-4 bottom-4 z-60 rounded-full bg-primary shadow-lg hover:scale-110 active:scale-90 transition-transform flex items-center justify-center text-primary-foreground size-11 cursor-pointer"
        aria-label="Ask AI"
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="size-6" /> : <BotMessageSquare className="size-6" />}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 animate-in fade-in duration-200 cursor-pointer"
            onClick={handleClose}
            aria-hidden="true"
          />

          <div
            className="fixed z-50 inset-0 flex items-center justify-center p-4 md:p-0 cursor-pointer"
            onClick={handleClose}
          >
            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="ask-ai-dialog-title"
              className="bg-background flex flex-col w-full max-w-2xl h-[80vh] md:h-150 rounded-lg border border-border shadow-2xl animate-in zoom-in-95 duration-200 relative cursor-default"
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
                <BotMessageSquare className="size-5" />
                <h2 id="ask-ai-dialog-title" className="text-lg font-semibold">
                  Ask AI
                </h2>
              </div>

              <div className="flex-1 min-h-0 h-0">
                <Chat
                  chatPersistence={chatPersistence}
                  suggestedPrompts={suggestedPrompts}
                  onClearRef={(clearFn) => (chatClearRef.current = clearFn)}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
