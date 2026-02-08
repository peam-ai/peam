'use client';

import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { SharedProps } from 'fumadocs-ui/contexts/search';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { type ComponentProps, useCallback } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SearchDialog } from './search';

type GeistdocsProviderProps = ComponentProps<typeof RootProvider> & {
  basePath: string | undefined;
  className?: string;
};

export const GeistdocsProvider = ({
  basePath,
  search,
  className,
  ...props
}: GeistdocsProviderProps) => {
  const SearchDialogComponent = useCallback(
    (sdProps: SharedProps) => <SearchDialog basePath={basePath} {...sdProps} />,
    [basePath]
  );

  return (
    <div
      className={cn(
        'transition-all',
        className
      )}
    >
      <TooltipProvider>
        <RootProvider
          search={{
            SearchDialog: SearchDialogComponent,
            ...search,
          }}
          {...props}
        />
      </TooltipProvider>
      <Analytics />
      <Toaster />
      <SpeedInsights />
    </div>
  );
};
