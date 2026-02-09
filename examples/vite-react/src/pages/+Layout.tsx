export { Layout };

import { Head } from 'vike-react/Head';
import { AskAI } from 'peam/client';
import { type ReactNode } from 'react';
import '../index.css';

function Layout({ children }: { children: ReactNode }) {
  return (
    <div>
      <Head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css"
        />
      </Head>
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
    </div>
  );
}
