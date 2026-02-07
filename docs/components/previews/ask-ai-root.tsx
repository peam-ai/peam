'use client';

import { AskAI } from 'peam/client';

const AskAIInlinePreview = () => (
  <AskAI defaultOpen persistence={{ key: 'docs-preview' }}>
    <AskAI.Inline />
  </AskAI>
);

export default AskAIInlinePreview;
