'use client';

import { ComponentPropsWithoutRef, useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import css from '../../global.css?inline';

type ShadowRootHostProps = ComponentPropsWithoutRef<'div'> & {
  children?: ReactNode;
};

export function ShadowRootHost({ children, ...divProps }: ShadowRootHostProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [shadowMount, setShadowMount] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const root = host.shadowRoot ?? host.attachShadow({ mode: 'open' });

    const styleEl = document.createElement('style');
    styleEl.setAttribute('data-peam-style', 'true');
    styleEl.textContent = css;
    root.appendChild(styleEl);

    const mountEl = document.createElement('div');
    mountEl.setAttribute('data-peam-mount', 'true');
    root.appendChild(mountEl);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShadowMount(mountEl);

    return () => {
      styleEl.remove();
      mountEl.remove();
    };
  }, []);

  return (
    <div ref={hostRef} {...divProps}>
      {shadowMount ? createPortal(children, shadowMount) : null}
    </div>
  );
}
