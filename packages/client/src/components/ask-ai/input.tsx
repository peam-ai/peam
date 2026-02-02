'use client';

import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  type PromptInputMessage,
} from '@/components/ai-elements/prompt-input';
import { SpeechInput } from '@/components/ai-elements/speech-input';
import { useAskAI } from '@/hooks/useAskAI';
import { cn } from '@/lib/utils';
import { MicIcon } from 'lucide-react';
import type { ComponentPropsWithoutRef } from 'react';
import { useCallback, useEffect, useRef } from 'react';

export type AskAIInputProps = ComponentPropsWithoutRef<'div'>;

export function AskAIInput({ className, ...props }: AskAIInputProps) {
  const { input, setInput, status, handleSubmit } = useAskAI();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const onSubmit = useCallback(
    (message: PromptInputMessage) => {
      handleSubmit(message);
    },
    [handleSubmit]
  );

  useEffect(() => {
    textareaRef?.current?.focus();
  }, []);

  return (
    <div className={cn('p-4 shrink-0', className)} {...props}>
      <PromptInput onSubmit={onSubmit}>
        <PromptInputBody>
          <PromptInputTextarea
            value={input}
            ref={textareaRef}
            placeholder="Type your question..."
            onChange={(e) => setInput(e.currentTarget.value)}
            maxLength={1000}
          />
        </PromptInputBody>
        <PromptInputFooter>
          <PromptInputTools>
            <SpeechInput
              onTranscriptionChange={setInput}
              className="px-2 rounded-md bg-transparent hover:bg-accent dark:hover:bg-accent/50 text-foreground hover:text-accent-foreground text-sm"
            >
              <MicIcon size={16} />
              <span className="sr-only">Microphone</span>
            </SpeechInput>
          </PromptInputTools>
          <PromptInputSubmit status={status} disabled={!input.trim() && status !== 'streaming'} />
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
}
