import { DocsLayout as FumadocsDocsLayout } from 'fumadocs-ui/layouts/docs';
import type { CSSProperties } from 'react';
import { source } from '@/lib/geistdocs/source';

export const HomeLayout = ({
  children,
}: Pick<LayoutProps<'/'>, 'children'>) => (
  <FumadocsDocsLayout
    containerProps={{
      className: 'p-0! max-w-full mx-0 [&_[data-sidebar-placeholder]]:hidden',
      style: {
        display: 'flex',
        flexDirection: 'column',
        '--fd-docs-row-1': '4rem',
      } as CSSProperties,
    }}
    nav={{
      enabled: false,
    }}
    searchToggle={{
      enabled: false,
    }}
    sidebar={{
      className: 'md:hidden',
    }}
    tabMode="auto"
    themeSwitch={{
      enabled: false,
    }}
    tree={source.pageTree}
  >
    {children}
  </FumadocsDocsLayout>
);
