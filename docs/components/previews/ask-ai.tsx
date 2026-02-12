'use client';

import { AskAI } from 'peam/client';

export const Example = () => <AskAI defaultOpen reuseContext={false} persistence={{ key: 'docs-preview' }} />;

export default Example;
