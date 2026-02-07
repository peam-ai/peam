'use client';

import { AskAI } from 'peam/client';

const UseAskAIPreview = () => (
  <AskAI reuseContext={false} persistence={{ key: 'docs-preview' }}>
    <AskAI.Trigger inlineButton variant="iconLabel" />
    <AskAI.Dialog />
  </AskAI>
);

export default UseAskAIPreview;
