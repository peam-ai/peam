import { useAskAIContext } from '@/ask-ai/context';
import { useRef } from 'react';

export function useAskAI() {
  const context = useAskAIContext();
  const chatClearRef = useRef<(() => void) | null>(null);

  chatClearRef.current = context.clearMessages;

  return {
    isOpen: context.open,
    handleToggle: context.toggleOpen,
    handleOpen: () => context.setOpen(true),
    handleClose: () => context.setOpen(false),
    handleClear: context.clearMessages,
    chatPersistence: {
      initialMessages: context.initialMessages,
      isLoading: context.isLoading,
    },
    chatClearRef,
  };
}
