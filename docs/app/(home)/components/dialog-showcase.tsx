import Image from 'next/image';

export const DialogShowcase = () => (
  <section className="px-8 sm:px-4 py-12 sm:py-16">
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="text-center space-y-3">
        <h2 className="font-semibold text-2xl sm:text-3xl lg:text-4xl tracking-tight">ChatGPT for your website</h2>
        <p className="text-muted-foreground text-base sm:text-lg">Intelligent conversations powered by your content.</p>
      </div>
      <div className="relative w-full aspect-video rounded-lg overflow-hidden">
        <Image
          src="/peam-dialog-start-white.png"
          alt="Peam dialog interface"
          fill
          className="object-cover object-top dark:hidden"
          priority
        />
        <Image
          src="/peam-dialog-start-dark.png"
          alt="Peam dialog interface"
          fill
          className="object-cover object-top hidden dark:block"
          priority
        />
        <div className="absolute inset-x-0 bottom-0 h-5 bg-linear-to-t from-background to-transparent pointer-events-none" />
      </div>
    </div>
  </section>
);
