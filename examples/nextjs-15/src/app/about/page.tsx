import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us - Next.js 15 Example',
  description: 'Learn more about our Next.js 15 example application',
};

export default function About() {
  return (
    <main className="container">
      <section>
        <h1>About Us</h1>
        <article>
          <h2>Our Mission</h2>
          <p>
            We're dedicated to creating simple, efficient, and powerful examples
            that help developers understand how to integrate Peam with their
            Next.js applications.
          </p>
          <p>
            This example showcases the latest features of Next.js 15 with a clean,
            classless theme, all integrated with Peam's powerful functionality.
          </p>
        </article>
      </section>
      <section>
        <article>
          <h2>What We Offer</h2>
          <ul>
            <li>Clean and maintainable code examples</li>
            <li>Modern development practices</li>
            <li>Easy-to-understand implementations</li>
            <li>Full TypeScript support</li>
          </ul>
        </article>
      </section>
    </main>
  );
}
