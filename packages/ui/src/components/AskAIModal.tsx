'use client';

import { BotMessageSquare, X } from 'lucide-react';
import { useState } from 'react';
import { Chat } from './Chat';

export interface AskAIModalProps {
  className?: string;
  buttonClassName?: string;
  contentClassName?: string;
}

export function AskAIModal({ className = '', buttonClassName = '', contentClassName = '' }: AskAIModalProps = {}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleModalClick = () => {
    setIsOpen(!isOpen);
  }

  const handleClose = () => {
    setIsOpen(false);
  };

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
          <div className="fixed inset-0" onClick={handleClose} />

          <div
            className={`fixed right-4 bottom-20 z-50 w-[400px] rounded-sm border border-border bg-background shadow-xl ${contentClassName}`}
          >
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 p-1 z-10 rounded-full border-0 bg-transparent hover:bg-muted cursor-pointer transition-colors"
              aria-label="Close Ask AI"
            >
              <X className="size-4" />
            </button>

            <div className="border-b border-border px-4 py-3">
              <h2 className="text-lg font-semibold">
                Ask AI
              </h2>
            </div>

            <Chat />
          </div>
        </>
      )}
    </div>
  );
}
