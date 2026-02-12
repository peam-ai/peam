'use client';

import { AskAI } from 'peam/client';

export const Example = () => (
  <AskAI defaultOpen persistence={{ key: 'docs-preview' }}>
    <AskAI.Inline />
  </AskAI>
);

export default Example;
