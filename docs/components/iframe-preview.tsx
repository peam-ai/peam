'use client';

import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';

type IframePreviewProps = {
  path: string;
  className?: string;
};

export function IframePreview({ path, className }: IframePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const rootRef = useRef<ReactDOM.Root | null>(null);
  const [ready, setReady] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument;
    if (!doc) return;

    const colorScheme = 'light';

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="color-scheme" content="${colorScheme}" />
          <style>
            html, body, #root {
              color-scheme: ${colorScheme};
              height: 100%;
              width: 100%;
              margin: 0;
              padding: 0;
            }
            body {
              display: flex;
              flex-direction: column;
            }
            #root {
              display: flex;
              flex-direction: column;
              min-height: 100%;
              padding: 10px;
            }
            #root > * {
              flex: 1 1 auto;
              min-height: 100%;
            }
          </style>
        </head>
        <body class="bg-background text-foreground">
          <div id="root"></div>
        </body>
      </html>
    `);
    doc.close();

    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;

    let mounted = true;

    const mount = async () => {
      const iframe = iframeRef.current!;
      const doc = iframe.contentDocument!;

      document.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
        doc.head.appendChild(node.cloneNode(true));
      });

      const { default: Component } = await import(`@/components/previews/${path}`);

      if (!mounted) return;

      rootRef.current = ReactDOM.createRoot(doc.getElementById('root')!);
      rootRef.current.render(<Component />);

      requestAnimationFrame(() => {
        const peamRoot = doc.querySelector<HTMLElement>('.peam-root');
        peamRoot?.classList.toggle('dark', isDark);
        doc.body.classList.toggle('dark', isDark);
      });
    };

    mount();

    return () => {
      mounted = false;
      const rootToUnmount = rootRef.current;
      rootRef.current = null;
      if (rootToUnmount) {
        setTimeout(() => rootToUnmount.unmount(), 0);
      }
    };
  }, [ready, path]);

  useEffect(() => {
    if (!ready) return;
    const doc = iframeRef.current?.contentDocument;
    if (!doc || !doc.body) return;

    const colorScheme = isDark ? 'dark' : 'light';
    const meta = doc.head.querySelector('meta[name="color-scheme"]');
    if (meta) {
      meta.setAttribute('content', colorScheme);
    }

    doc.documentElement.style.colorScheme = colorScheme;
    doc.body.classList.toggle('dark', isDark);
    const peamRoot = doc.querySelector<HTMLElement>('.peam-root');
    peamRoot?.classList.toggle('dark', isDark);
  }, [ready, isDark]);

  return (
    <div className={cn('relative isolate h-160 overflow-hidden bg-background', className)}>
      <iframe
        ref={iframeRef}
        style={{
          width: '100%',
          height: '100%',
          border: 0,
          background: 'transparent',
        }}
      />
    </div>
  );
}
