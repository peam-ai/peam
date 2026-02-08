import { PeamLogo } from '@/components/peam-logo';

export const nav = [
  {
    label: 'Docs',
    href: '/docs',
  },
  {
    label: 'GitHub',
    href: 'https://github.com/peam-ai/peam',
  },
];

export const Logo = () => (
  <span className="flex items-center gap-1.5 font-semibold text-foreground tracking-tight text-xl">
    <PeamLogo className="size-5" />
    <span>Peam</span>
  </span>
);

export const github = {
  owner: 'peam-ai',
  repo: 'peam',
};

export const title = 'Peam Documentation';
