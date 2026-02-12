'use client';

import { AskAI, useAskAI } from 'peam/client';

const AskAIInstallButton = () => {
  const { sendMessage } = useAskAI();

  return (
    <button
      type="button"
      className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
      onClick={() => {
        sendMessage({ text: 'How can I install Peam?' });
      }}
    >
      Ask how to install Peam
    </button>
  );
};

export const Example = () => (
  <AskAI reuseContext={false} persistence={{ key: 'docs-preview' }}>
    <AskAI.Dialog />
    <AskAIInstallButton />
  </AskAI>
);

export default Example;
