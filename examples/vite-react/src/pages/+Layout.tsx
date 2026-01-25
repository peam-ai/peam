export { Layout };

import { AskAI } from 'peam/client';
import type { ReactNode } from 'react';
import '../index.css';

function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Vite + React Example - Peam</title>
        <meta name="description" content="A simple Vite + React example application with Peam" />
      </head>
      <body>
        <nav className="bg-gray-800 text-white">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="text-xl font-bold">Peam Example</div>
              <div className="flex gap-6">
                <a href="/" className="hover:text-gray-300 transition">
                  Home
                </a>
                <a href="/about" className="hover:text-gray-300 transition">
                  About
                </a>
                <a href="/contact" className="hover:text-gray-300 transition">
                  Contact
                </a>
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
