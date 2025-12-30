'use client';

export interface SuggestedPromptsProps {
  prompts?: string[];
  onPromptClick: (prompt: string) => void;
}

const DEFAULT_SUGGESTED_PROMPTS = ['Summarize this page', 'Where should I get started?', 'What can you help me with?'];

export const SuggestedPrompts = ({ prompts = DEFAULT_SUGGESTED_PROMPTS, onPromptClick }: SuggestedPromptsProps) => {
  if (!prompts || prompts.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col justify-center gap-3 w-full">
      <div className="mt-3 flex flex-col gap-1 text-xs items-start">
        {prompts.map((prompt, index) => (
          <button
            key={index}
            onClick={() => onPromptClick(prompt)}
            className="animate-in fade-in duration-500 delay-100 text-primary hover:underline cursor-pointer text-left"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
};
