import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const CTA = () => (
  <section className="px-8 sm:px-12 py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    <h2 className="font-semibold text-xl tracking-tight sm:text-2xl md:text-3xl lg:text-[40px]">
      Add AI to your website today.
    </h2>
    <Button asChild className="w-fit text-base h-12" size="lg">
      <Link href="/docs">Get started</Link>
    </Button>
  </section>
);
