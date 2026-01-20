import './global.css';
import type { Metadata } from 'next';
import { Navbar } from '@/components/geistdocs/navbar';
import { GeistdocsProvider } from '@/components/geistdocs/provider';
import { mono, sans } from '@/lib/geistdocs/fonts';
import { cn } from '@/lib/utils';

const Logo = () => (
  <span className="flex items-center gap-1.5 font-semibold text-foreground tracking-tight text-xl">
    <span>Peam</span>
  </span>
);

const links = [
  {
    label: 'Docs',
    href: '/docs',
  },
  {
    label: 'GitHub',
    href: 'https://github.com/peam-ai/peam',
  },
];

const Layout = ({ children }: LayoutProps<'/'>) => (
  <html
    className={cn(sans.variable, mono.variable, 'scroll-smooth antialiased')}
    lang="en"
    suppressHydrationWarning
  >
    <body>
      <GeistdocsProvider>
        <Navbar items={links}>
          <Logo />
        </Navbar>
        {children}
      </GeistdocsProvider>
    </body>
  </html>
);

export const metadata: Metadata = {
  metadataBase: new URL('https://peam.ai'),
};

export default Layout;
