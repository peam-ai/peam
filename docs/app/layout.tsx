import { Footer } from '@/components/geistdocs/footer';
import { Navbar } from '@/components/geistdocs/navbar';
import { GeistdocsProvider } from '@/components/geistdocs/provider';
import { ThemedAskAI } from '@/components/themed-askai';
import { mono, sans } from '@/lib/geistdocs/fonts';
import { cn } from '@/lib/utils';
import type { Metadata } from 'next';
import { AskAIProvider } from 'peam/client';
import './global.css';

const Layout = ({ children }: LayoutProps<'/'>) => (
  <html className={cn(sans.variable, mono.variable, 'scroll-smooth antialiased')} lang="en" suppressHydrationWarning>
    <body>
      <AskAIProvider>
        <GeistdocsProvider>
          <Navbar />
          {children}
          <ThemedAskAI />
          <Footer />
        </GeistdocsProvider>
      </AskAIProvider>
    </body>
  </html>
);

export const metadata: Metadata = {
  metadataBase: new URL('https://peam.ai'),
};

export default Layout;
