'use client';

import { PageTOC, PageTOCItems } from 'fumadocs-ui/layouts/docs/page';
import type { ReactNode } from 'react';
import { Separator } from '../ui/separator';

type TableOfContentsProps = {
  children: ReactNode;
};

export const TableOfContents = ({ children }: TableOfContentsProps) => {
  return (
    <PageTOC>
      <p className="mb-1 font-medium text-sm">On this page</p>
      <PageTOCItems variant="clerk" />

      {children && (
        <div className="my-3 space-y-3">
          <Separator />
          {children}
        </div>
      )}
    </PageTOC>
  );
};
