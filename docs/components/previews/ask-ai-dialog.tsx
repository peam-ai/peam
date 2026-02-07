'use client';

import { AskAI } from 'peam/client';

const AskAIDialogPreview = () => (
  <AskAI defaultOpen reuseContext={false} persistence={{ key: 'docs-preview' }}>
    <AskAI.Trigger inlineButton variant="iconLabel" />
    <AskAI.Dialog />
  </AskAI>
);

export default AskAIDialogPreview;
