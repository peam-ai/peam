export { Page };

function Page() {
  return (
    <main className="container">
      <section>
        <h1>Welcome to Peam</h1>
        <p>
          This is a Vite + React example application demonstrating Peam integration with SSR.
        </p>
      </section>
      <section>
        <article>
          <h2>Getting Started</h2>
          <p>
            Explore this simple example to see how Peam works with Vite and React using Vike for SSR.
            Navigate through the pages using the menu above to learn more about
            our features and get in touch.
          </p>
        </article>
      </section>
      <section className="grid">
        <article>
          <h3>⚡ Fast</h3>
          <p>Built with lightning-fast Vite</p>
        </article>
        <article>
          <h3>🎨 Simple</h3>
          <p>Clean design with a minimal CSS theme</p>
        </article>
        <article>
          <h3>🚀 Powerful</h3>
          <p>Enhanced with Peam features</p>
        </article>
      </section>
    </main>
  );
}
