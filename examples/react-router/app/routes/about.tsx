import type { Route } from "./+types/about";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "About Us - React Router Example" },
    { name: "description", content: "Learn more about our React Router example." },
  ];
}

export default function About() {
  return (
    <main className="container">
      <section>
        <h1>About Us</h1>
        <article>
          <h2>Our Mission</h2>
          <p>
            We're dedicated to creating simple, efficient, and powerful examples that help
            developers understand how to integrate Peam with their React Router applications.
          </p>
          <p>
            This example showcases React Router's full-stack capabilities with a clean, classless
            theme, all integrated with Peam's powerful functionality.
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
            <li>Server-side rendering with React Router</li>
          </ul>
        </article>
      </section>
    </main>
  );
}
