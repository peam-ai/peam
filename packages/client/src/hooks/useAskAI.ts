import { AskAIContext } from '@/ask-ai/context';
import { useContext } from 'react';

export function useAskAI() {
  const context = useContext(AskAIContext);

  if (!context) {
    throw new Error('AskAI components must be used within <AskAI.Root> or <AskAIProvider>.');
  }

  return context;
}
