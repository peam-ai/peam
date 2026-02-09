import type { Route } from "./+types/admin";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Admin - React Router Example" },
    { name: "description", content: "Internal admin page for the React Router example." },
  ];
}

export default function Admin() {
  return (
    <main className="container">
      <section>
        <h1>Admin</h1>
        <p>This admin page is reserved for internal use only.</p>
      </section>
    </main>
  );
}
