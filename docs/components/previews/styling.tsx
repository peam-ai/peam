'use client';

import { AskAI } from 'peam/client';

const StylingPreview = () => (
  <>
    <style>{`
      .peam-root {
        --background: oklch(0.99 0.01 250);
        --foreground: oklch(0.19 0.03 255);
        --card: oklch(0.98 0.02 260);
        --card-foreground: oklch(0.2 0.03 255);
        --popover: oklch(0.98 0.02 260);
        --popover-foreground: oklch(0.2 0.03 255);
        --primary: oklch(0.64 0.23 250);
        --primary-foreground: oklch(0.99 0.01 250);
        --secondary: oklch(0.94 0.03 260);
        --secondary-foreground: oklch(0.2 0.03 255);
        --muted: oklch(0.95 0.02 260);
        --muted-foreground: oklch(0.43 0.04 256);
        --accent: oklch(0.91 0.06 190);
        --accent-foreground: oklch(0.19 0.03 255);
        --destructive: oklch(0.68 0.2 20);
        --destructive-foreground: oklch(0.98 0.01 250);
        --border: oklch(0.82 0.03 252);
        --input: oklch(0.9 0.02 250);
        --ring: oklch(0.7 0.21 250);
        --radius: 1.25rem;
      }

      .peam-root.dark {
        --background: oklch(0.16 0.02 264);
        --foreground: oklch(0.94 0.02 264);
        --card: oklch(0.2 0.03 264);
        --card-foreground: oklch(0.92 0.02 264);
        --popover: oklch(0.2 0.03 264);
        --popover-foreground: oklch(0.92 0.02 264);
        --primary: oklch(0.72 0.18 250);
        --primary-foreground: oklch(0.16 0.02 264);
        --secondary: oklch(0.26 0.03 264);
        --secondary-foreground: oklch(0.92 0.02 264);
        --muted: oklch(0.26 0.03 264);
        --muted-foreground: oklch(0.66 0.04 260);
        --accent: oklch(0.32 0.09 200);
        --accent-foreground: oklch(0.94 0.02 264);
        --destructive: oklch(0.64 0.19 20);
        --destructive-foreground: oklch(0.94 0.02 264);
        --border: oklch(0.44 0.04 260);
        --input: oklch(0.33 0.03 264);
        --ring: oklch(0.64 0.18 250);
        --radius: 1.25rem;
      }
    `}</style>
    <AskAI defaultOpen reuseContext={false} persistence={{ key: 'docs-preview' }} />
  </>
);

export default StylingPreview;
