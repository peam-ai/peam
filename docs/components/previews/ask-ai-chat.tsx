'use client';

import { AskAI } from 'peam/client';

const AskAIChatPreview = () => (
  <AskAI defaultOpen reuseContext={false} persistence={{ key: 'docs-preview' }}>
    <AskAI.Trigger variant="iconLabel" />
    <AskAI.Chat />
  </AskAI>
);

export default AskAIChatPreview;
