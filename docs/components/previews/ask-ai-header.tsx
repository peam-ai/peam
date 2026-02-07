'use client';

import { AskAI } from 'peam/client';

const AskAIHeaderPreview = () => (
  <AskAI defaultOpen reuseContext={false} persistence={{ key: 'docs-preview' }}>
    <AskAI.Dialog>
      <AskAI.Header heading="Ask me anything!" />
      <AskAI.Messages />
      <AskAI.Suggestions />
      <AskAI.Input />
    </AskAI.Dialog>
  </AskAI>
);

export default AskAIHeaderPreview;
