'use client';

import { AskAI } from 'peam/client';

export const Example = () => (
  <AskAI defaultOpen reuseContext={false} persistence={{ key: 'docs-preview' }}>
    <AskAI.Trigger variant="iconLabel" />
    <AskAI.Chat />
  </AskAI>
);

export default Example;
