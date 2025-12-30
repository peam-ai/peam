'use client';

import { BotMessageSquare, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Chat } from './Chat';

export interface AskAIModalProps {
  className?: string;
  buttonClassName?: string;
  contentClassName?: string;
  suggestedPrompts?: string[];
}
export function AskAIModal({
  className = '',
  buttonClassName = '',
  contentClassName = '',
  suggestedPrompts,
}: AskAIModalProps = {}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleModalClick = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
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
        className={`fixed right-4 bottom-4 z-50 rounded-full bg-primary shadow-lg hover:scale-110 active:scale-90 transition-transform flex items-center justify-center text-primary-foreground size-11 ${buttonClassName} ${className}`}
        aria-label="Ask AI"
      >
        {isOpen ? <X className="size-6" /> : <BotMessageSquare className="size-6" />}
      </button>

      {isOpen && (
        <>
          <div
            className={`fixed right-4 bottom-20 z-50 h-[500px] w-[400px] rounded-sm border border-border bg-background shadow-xl flex flex-col ${contentClassName}`}
          >
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 p-1 z-10 rounded-full border-0 bg-transparent hover:bg-muted cursor-pointer transition-colors"
              aria-label="Close Ask AI"
            >
              <X className="size-4" />
            </button>

            <div className="px-4 py-3 shrink-0 flex items-center gap-2">
              <BotMessageSquare className="size-5" />
              <h2 className="text-lg font-semibold">Ask AI</h2>
            </div>

            <div className="flex-1 min-h-0">
              <Chat suggestedPrompts={suggestedPrompts} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
