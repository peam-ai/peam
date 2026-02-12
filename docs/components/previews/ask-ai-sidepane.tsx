'use client';

import { AskAI } from 'peam/client';

export const Example = () => (
  <AskAI defaultOpen reuseContext={false} persistence={{ key: 'docs-preview' }}>
    <AskAI.Trigger inlineButton variant="iconLabel" />
    <AskAI.Sidepane />
  </AskAI>
);

export default Example;
