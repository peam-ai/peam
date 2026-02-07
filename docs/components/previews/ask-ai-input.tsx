'use client';

import { AskAI } from 'peam/client';

const AskAIInputPreview = () => (
  <AskAI defaultOpen reuseContext={false} persistence={{ key: 'docs-preview' }}>
    <AskAI.Dialog>
      <AskAI.Header />
      <AskAI.Messages />
      <AskAI.Suggestions />
      <AskAI.Input />
    </AskAI.Dialog>
  </AskAI>
);

export default AskAIInputPreview;
