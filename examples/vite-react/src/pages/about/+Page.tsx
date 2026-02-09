export { Page };

function Page() {
  return (
    <main className="container">
      <section>
        <h1>About Us</h1>
        <article>
          <h2>Our Mission</h2>
          <p>
            We're dedicated to creating simple, efficient, and powerful examples
            that help developers understand how to integrate Peam with their
            React applications.
          </p>
          <p>
            This example showcases the latest features of Vite with a clean,
            classless theme, all integrated
            with Peam's powerful functionality and Vike's SSR capabilities.
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
            <li>Fast development with Vite</li>
            <li>Server-side rendering with Vike</li>
          </ul>
        </article>
      </section>
    </main>
  );
}
