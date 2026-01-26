import { useChatPersistence } from '@/hooks/useChatPersistence';
import { useEffect, useRef, useState } from 'react';

export function useAskAI() {
  const [isOpen, setIsOpen] = useState(false);
  const chatClearRef = useRef<(() => void) | null>(null);
  const chatPersistence = useChatPersistence();

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleOpen = () => {
    setIsOpen(true);
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
        setIsOpen((prev) => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyboard);

    return () => {
      document.removeEventListener('keydown', handleKeyboard);
    };
  }, [isOpen]);

  return {
    isOpen,
    chatClearRef,
    chatPersistence,
    handleToggle,
    handleOpen,
    handleClose,
    handleClear,
  };
}
