'use client';

import { useAskAI } from 'peam/client';
import { SparklesIcon } from 'lucide-react';

type ExplainPageProps = {
  title: string;
  url: string;
};

export const ExplainPage = ({ title, url }: ExplainPageProps) => {
  const { setOpen, sendMessage } = useAskAI();

  const handleExplain = () => {
    setOpen(true);
    sendMessage({ text: `Explain this page: ${title} (${url})` });
  };

  return (
    <button
      className="flex items-center gap-1.5 text-muted-foreground text-sm transition-colors hover:text-foreground"
      onClick={handleExplain}
      type="button"
    >
      <SparklesIcon className="size-3.5" />
      <span>Explain this page</span>
    </button>
  );
};
