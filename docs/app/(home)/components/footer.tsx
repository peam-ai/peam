import Link from 'next/link';

export const Footer = () => (
  <footer className="border-t py-8 px-8 sm:px-12">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="text-sm text-muted-foreground">
        © {new Date().getFullYear()} Peam. Open source under Apache-2.0.
      </div>
      <div className="flex flex-wrap gap-6 text-sm">
        <Link href="/docs" className="text-muted-foreground hover:text-foreground transition-colors">
          Documentation
        </Link>
        <Link
          href="https://github.com/peam-ai/peam"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          GitHub
        </Link>
        <Link
          href="https://github.com/peam-ai/peam/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          Issues
        </Link>
      </div>
    </div>
  </footer>
);
