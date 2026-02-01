'use client';

import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { RootProvider } from 'fumadocs-ui/provider/next';
import type { ComponentProps } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SearchDialog } from './search';

type GeistdocsProviderProps = ComponentProps<typeof RootProvider> & {
  className?: string;
};

export const GeistdocsProvider = ({
  search,
  className,
  ...props
}: GeistdocsProviderProps) => {
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
            SearchDialog,
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
