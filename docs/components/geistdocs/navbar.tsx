import { DesktopMenu } from './desktop-menu';
import { GitHubButton } from './github-button';
import { MobileMenu } from './mobile-menu';
import { SearchButton } from './search';
import { ThemeToggle } from './theme-toggle';
import DynamicLink from 'fumadocs-core/dynamic-link';
import { Logo, nav } from '@/geistdocs';

export const Navbar = () => (
  <header className="sticky top-0 z-40 h-16 w-full gap-6 border-b bg-background">
    <div className="mx-auto flex w-full max-w-(--fd-layout-width) items-center gap-4 px-4 py-3.5 md:px-6">
      <div className="flex shrink-0 items-center gap-2.5">
        <DynamicLink href="/" className="flex items-center gap-2.5">
          <Logo />
        </DynamicLink>
      </div>
      <div className="hidden flex-1 md:block">
        <DesktopMenu items={nav} />
      </div>
      <div className="hidden flex-1 shrink-0 items-center justify-end gap-1 md:flex">
        <GitHubButton />
        <ThemeToggle />
        <SearchButton />
      </div>
      <div className="ml-auto flex items-center gap-1 md:hidden">
        <SearchButton />
        <MobileMenu />
      </div>
    </div>
  </header>
);
