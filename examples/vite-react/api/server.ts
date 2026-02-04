import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { renderPage } from 'vike/server';
import type { ViteDevServer } from 'vite';
import { createChat } from 'peam/server';

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(cors());
app.use(express.json());

// API endpoint for Peam
app.post('/api/peam', async (req, res) => {
  try {
    // Convert Express request to Web API Request
    const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    const request = new Request(url, {
      method: req.method,
      headers: req.headers as HeadersInit,
      body: JSON.stringify(req.body),
    });

    const response = await createChat().handler(request);

    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    res.status(response.status);

    // Stream the response
    if (response.body) {
      const reader = response.body.getReader();
      const stream = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(value);
        }
        res.end();
      };
      await stream();
    } else {
      res.end();
    }
  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

let viteDevServer: ViteDevServer | undefined;

// Vite middleware
if (isProduction) {
  // In production, serve pre-built assets
  app.use(express.static('dist/client'));
} else {
  // In development, use Vite dev server
  const vite = await import('vite');
  viteDevServer = await vite.createServer({
    server: { middlewareMode: true },
    appType: 'custom',
  });
  app.use(viteDevServer.middlewares);
}

// Vike SSR handler - catch all routes
app.use(async (req, res, next) => {
  if (req.method !== 'GET') {
    return next();
  }

  const pageContextInit = {
    urlOriginal: req.originalUrl,
    viteDevServer,
  };

  const pageContext = await renderPage(pageContextInit);
  const { httpResponse } = pageContext;

  if (!httpResponse) {
    return next();
  }

  const { statusCode, headers } = httpResponse;
  headers.forEach(([name, value]) => res.setHeader(name, value));
  res.status(statusCode);

  httpResponse.pipe(res);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
