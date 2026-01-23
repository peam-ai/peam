import type { Metadata } from 'next';
import { AskAI } from 'peam/client';
import './globals.css';

export const metadata: Metadata = {
  title: 'Next.js 16 Example - Peam',
  description: 'A simple Next.js 16 example application with Peam',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <nav className="bg-gray-800 text-white">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="text-xl font-bold">Peam Example</div>
              <div className="flex gap-6">
                <a href="/" className="hover:text-gray-300 transition">Home</a>
                <a href="/about" className="hover:text-gray-300 transition">About</a>
                <a href="/contact" className="hover:text-gray-300 transition">Contact</a>
              </div>
            </div>
          </div>
        </nav>
        {children}
        <AskAI />
      </body>
    </html>
  );
}
