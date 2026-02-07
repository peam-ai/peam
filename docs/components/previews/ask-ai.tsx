'use client';

import { AskAI } from 'peam/client';

const AskAIPreview = () => <AskAI defaultOpen reuseContext={false} persistence={{ key: 'docs-preview' }} />;

export default AskAIPreview;
