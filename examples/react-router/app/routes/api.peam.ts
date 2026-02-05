import { createChat } from "peam/server";

const handler = createChat().handler;

export async function action({ request }: { request: Request }) {
  return handler(request);
}

export function loader() {
  return new Response(
    JSON.stringify({ error: "Method not allowed" }),
    {
      status: 405,
      headers: { "Content-Type": "application/json" },
    }
  );
}
