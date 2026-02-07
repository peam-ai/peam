'use client';

import { cn } from '@/lib/utils';
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

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument;
    if (!doc) return;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <style>
            html, body, #root {
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
        <body>
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
