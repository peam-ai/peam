'use client';

import { Suggestion, Suggestions } from '@/components/ai-elements/suggestion';
import { useAskAI } from '@/hooks/useAskAI';
import { cn } from '@/lib/utils';
import type { ComponentPropsWithoutRef } from 'react';
import { useCallback, useMemo } from 'react';

const DEFAULT_SUGGESTED_PROMPTS = ['Summarize this page', 'Where should I get started?', 'What can you help me with?'];

export type AskAISuggestionProps = Omit<ComponentPropsWithoutRef<typeof Suggestion>, 'suggestion' | 'onClick'> & {
  suggestion: string;
  onPromptClick?: (prompt: string) => void;
};

export function AskAISuggestion({ suggestion, onPromptClick, ...props }: AskAISuggestionProps) {
  return <Suggestion suggestion={suggestion} onClick={onPromptClick} {...props} />;
}

export interface AskAISuggestionsProps extends ComponentPropsWithoutRef<'div'> {
  prompts?: string[];
  onPromptClick?: (prompt: string) => void;
  onlyWhenEmpty?: boolean;
}

export function AskAISuggestions({
  prompts = DEFAULT_SUGGESTED_PROMPTS,
  onPromptClick,
  onlyWhenEmpty = true,
  className,
  ...props
}: AskAISuggestionsProps) {
  const { messages, error, isLoading, sendMessage } = useAskAI();

  const shouldRender = useMemo(() => {
    if (!onlyWhenEmpty) {
      return true;
    }

    return messages.length === 0 && !error && !isLoading;
  }, [error, isLoading, messages.length, onlyWhenEmpty]);

  const handlePromptClick = useCallback(
    (prompt: string) => {
      if (onPromptClick) {
        onPromptClick(prompt);
        return;
      }

      sendMessage({ text: prompt });
    },
    [onPromptClick, sendMessage]
  );

  if (!shouldRender || !prompts?.length) {
    return null;
  }

  return (
    <div className={cn('px-4', className)} {...props}>
      <Suggestions>
        {prompts.map((prompt) => (
          <AskAISuggestion
            className="border-border text-foreground bg-background"
            key={prompt}
            suggestion={prompt}
            onPromptClick={handlePromptClick}
          />
        ))}
      </Suggestions>
    </div>
  );
}
