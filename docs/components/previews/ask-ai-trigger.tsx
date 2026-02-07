'use client';

import { AskAI } from 'peam/client';

const AskAITriggerPreview = () => (
  <AskAI defaultOpen reuseContext={false} persistence={{ key: 'docs-preview' }}>
    <AskAI.Trigger inlineButton variant="iconLabel" />
    <AskAI.Dialog />
  </AskAI>
);

export default AskAITriggerPreview;
