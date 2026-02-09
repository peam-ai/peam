import type { Route } from "./+types/contact";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Contact Us - React Router Example" },
    { name: "description", content: "Get in touch with us." },
  ];
}

export default function Contact() {
  return (
    <main className="container">
      <section>
        <h1>Contact Us</h1>
        <article>
          <p>Have questions about Peam or this example? We'd love to hear from you!</p>
          <form>
            <label htmlFor="name">
              Name
              <input type="text" id="name" name="name" placeholder="Your name" />
            </label>
            <label htmlFor="email">
              Email
              <input type="email" id="email" name="email" placeholder="your.email@example.com" />
            </label>
            <label htmlFor="message">
              Message
              <textarea id="message" name="message" rows={6} placeholder="Your message..." />
            </label>
            <button type="submit">Send Message</button>
          </form>
        </article>
      </section>
    </main>
  );
}
