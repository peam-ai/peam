'use client';

import type { AskAIRootProps } from './root';
import { AskAIRoot } from './root';

export type AskAIProviderProps = AskAIRootProps;

export function AskAIProvider(props: AskAIRootProps) {
  return <AskAIRoot {...props} />;
}
