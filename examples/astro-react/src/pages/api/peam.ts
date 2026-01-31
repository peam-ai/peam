import type { APIRoute } from 'astro';
import { createHandler } from 'peam/server';

const handler = createHandler();
export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  return handler(request);
};
