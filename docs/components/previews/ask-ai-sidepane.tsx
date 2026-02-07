'use client';

import { AskAI } from 'peam/client';

const AskAISidepanePreview = () => (
  <AskAI defaultOpen reuseContext={false} persistence={{ key: 'docs-preview' }}>
    <AskAI.Trigger inlineButton variant="iconLabel" />
    <AskAI.Sidepane />
  </AskAI>
);

export default AskAISidepanePreview;
