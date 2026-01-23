'use client';

import { useTheme } from 'next-themes';
import { AskAI } from 'peam/client';
import type { ComponentProps } from 'react';

type ThemedAskAIProps = ComponentProps<typeof AskAI>;

export const ThemedAskAI = (props: ThemedAskAIProps) => {
  const { resolvedTheme } = useTheme();

  return <AskAI {...props} className={resolvedTheme === 'dark' ? 'dark' : undefined} />;
};
