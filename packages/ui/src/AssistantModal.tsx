'use client';

import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { Thread } from './Thread';

export interface AssistantModalProps {
  className?: string;
  buttonClassName?: string;
  contentClassName?: string;
}

export function AssistantModal({
  className = '',
  buttonClassName = '',
  contentClassName = '',
}: AssistantModalProps = {}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div className="peam-root">
      {/* Trigger Button */}
      <button
        onClick={handleOpen}
        className={`fixed right-4 bottom-4 z-50 rounded-full bg-primary shadow-lg hover:scale-110 active:scale-90 transition-transform flex items-center justify-center text-primary-foreground size-11 ${buttonClassName} ${className}`}
        aria-label="Open AI Assistant"
      >
        <MessageCircle className="size-6" />
      </button>

      {/* Modal */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={handleClose}
          />

          {/* Content */}
          <div
            className={`fixed right-4 bottom-20 z-50 h-[500px] w-[400px] rounded-xl border border-border bg-background shadow-xl ${contentClassName}`}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 p-1 z-10 rounded-full border-0 bg-transparent hover:bg-muted cursor-pointer transition-colors"
              aria-label="Close AI Assistant"
            >
              <X className="size-4" />
            </button>

            <Thread />
          </div>
        </>
      )}
    </div>
  );
}
