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
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css"
        />
      </head>
      <body>
        <nav className="container">
          <ul>
            <li>
              <strong>Peam Example</strong>
            </li>
          </ul>
          <ul>
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/about">About</a>
            </li>
            <li>
              <a href="/contact">Contact</a>
            </li>
          </ul>
        </nav>
        {children}
        <AskAI />
      </body>
    </html>
  );
}
