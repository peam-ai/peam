'use client';

import { TooltipPortalProvider } from '@/components/ui/tooltip';
import css from '@/global.css?inline';
import { ComponentPropsWithoutRef, useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

type ShadowRootHostProps = ComponentPropsWithoutRef<'div'> & {
  children?: ReactNode;
};

export function ShadowRootHost({ children, ...divProps }: ShadowRootHostProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [shadowMount, setShadowMount] = useState<Element | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const root = host.shadowRoot ?? host.attachShadow({ mode: 'open' });

    let styleEl = root.querySelector('style[data-peam-style]');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.setAttribute('data-peam-style', 'true');
      styleEl.textContent = css;
      root.appendChild(styleEl);
    }

    let mountEl = root.querySelector('div[data-peam-mount]');
    if (!mountEl) {
      mountEl = document.createElement('div');
      mountEl.className = 'min-h-full h-full';
      mountEl.setAttribute('data-peam-mount', 'true');
      root.appendChild(mountEl);
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShadowMount(mountEl);

    return () => {
      styleEl?.remove();
      mountEl?.remove();
    };
  }, []);

  return (
    <div ref={hostRef} {...divProps}>
      {shadowMount
        ? createPortal(<TooltipPortalProvider container={shadowMount}>{children}</TooltipPortalProvider>, shadowMount)
        : null}
    </div>
  );
}
