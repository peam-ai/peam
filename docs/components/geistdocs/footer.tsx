import DynamicLink from 'fumadocs-core/dynamic-link';
import { PeamLogo } from '@/components/peam-logo';
import { footerLinks } from '@/geistdocs';
import { GitHubButton } from './github-button';
import { ThemeToggle } from './theme-toggle';

type FooterProps = {
  copyright?: string;
};

export const Footer = ({
  copyright = `Copyright Peam ${new Date().getFullYear()}. All rights reserved.`,
}: FooterProps) => (
  <footer className="border-t px-4 py-5 md:px-6">
    <div className="mx-auto flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-2">
        <PeamLogo className="size-4" />
        <p className="text-center text-muted-foreground text-sm">{copyright}</p>
      </div>
      <div className="flex flex-wrap items-center gap-4 text-sm">
        {footerLinks.map((link) => (
          <DynamicLink
            key={link.href}
            href={link.href}
            className="text-muted-foreground hover:text-foreground transition-colors"
            {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {link.label}
          </DynamicLink>
        ))}
        <div className="flex items-center gap-2">
          <GitHubButton />
          <ThemeToggle />
        </div>
      </div>
    </div>
  </footer>
);
