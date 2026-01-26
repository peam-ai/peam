'use client';

import type { AskAIBaseProps } from '@/components/AskAI';
import { Chat } from '@/components/Chat';
import { PeamIcon } from '@/components/icons/peam';
import { PeamButton } from '@/components/PeamButton';
import { useAskAI } from '@/hooks/useAskAI';
import { useIsMobile } from '@/hooks/useIsMobile';
import { Trash2, X } from 'lucide-react';
import { useEffect, useRef } from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AskAISidepaneProps extends AskAIBaseProps {}

export function AskAISidepane({
  suggestedPrompts,
  button,
  maxMessages,
  inlineButton = false,
}: AskAISidepaneProps = {}) {
  const { isOpen, chatClearRef, chatPersistence, handleToggle, handleOpen, handleClose, handleClear } = useAskAI();
  const isMobile = useIsMobile();
  const originalBodyStyles = useRef<{ marginRight: string; transition: string } | null>(null);

  useEffect(() => {
    // Only apply body margin on desktop
    if (isMobile) {
      if (originalBodyStyles.current) {
        document.body.style.marginRight = originalBodyStyles.current.marginRight;
        document.body.style.transition = originalBodyStyles.current.transition;
      }
      return;
    }

    // Desktop behavior
    if (isOpen) {
      if (!originalBodyStyles.current) {
        originalBodyStyles.current = {
          marginRight: document.body.style.marginRight,
          transition: document.body.style.transition,
        };
      }

      const width = window.innerWidth >= 1024 ? '480px' : '400px';
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
  }, [isOpen, isMobile]);

  return (
    <>
      {button ? (
        button({ isOpen, toggle: handleToggle, open: handleOpen, close: handleClose })
      ) : isOpen ? (
        <></>
      ) : (
        <PeamButton
          onClick={handleToggle}
          isOpen={isOpen}
          inlineButton={inlineButton}
          className="z-60"
          showCloseIcon={false}
        />
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
            role="dialog"
            aria-modal="true"
            aria-labelledby="ask-ai-sidepane-title"
            className={`fixed z-100 bg-background text-foreground flex flex-col text-left
              inset-x-0 bottom-0 h-[66vh] md:inset-auto
              md:right-0 md:top-0 md:h-full md:w-100 lg:w-120
              border-t md:border-t-0 md:border-l border-border
              shadow-[0_-4px_20px_rgba(0,0,0,0.25)] md:shadow-2xl
              animate-in slide-in-from-bottom md:slide-in-from-right duration-300`}
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
              <PeamIcon className="size-5" />
              <h2 id="ask-ai-sidepane-title" className="text-lg font-semibold">
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
        </>
      )}
    </>
  );
}
