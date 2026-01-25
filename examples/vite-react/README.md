# Vite + React Example with Peam (SSR with Vike)

This is a Vite + React example application demonstrating how to use Peam for AI-powered search and chat with server-side rendering (SSR) using Vike.

## Features

- ⚡ **Lightning Fast** - Built with Vite for instant HMR
- 🎨 **Modern UI** - Styled with Tailwind CSS
- 🔍 **AI-Powered Search** - Integrated Peam AI search with proper content indexing
- 🚀 **Type-Safe** - Full TypeScript support
- 📱 **Responsive** - Works on all devices
- 🖥️ **SSR** - Server-side rendering with Vike for better SEO and performance

## Getting Started

### 1. Install dependencies

From the project root, install dependencies:

```bash
pnpm install
```

### 2. Set up environment variables

Copy the example environment file and add your OpenAI API key:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` and add your OpenAI API key:

```
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Run the development server

Start the server with SSR:

```bash
pnpm dev
```

This will start the server on [http://localhost:3000](http://localhost:3000)

Open the URL with your browser to see the result.

### 4. Build for production

To build the application and generate the search index:

```bash
pnpm build
```

This will:
1. Build the React app with Vite (pre-rendering pages)
2. Generate the Peam search index from the pre-rendered HTML files

The pre-rendered HTML files will contain full page content, making them ideal for search indexing!

### 5. Preview production build

```bash
pnpm preview
```

### 6. Try Peam Ask AI

Click the Peam Ask AI button in the bottom right corner to ask questions about the site!

## Project Structure

```
vite-react/
├── api/
│   ├── peam.ts            # Peam handler
│   └── server.ts          # Express server with Vike SSR
├── src/
│   ├── pages/             # Vike pages (file-based routing)
│   │   ├── +Layout.tsx    # Root layout with navigation
│   │   ├── +config.ts     # Vike configuration
│   │   ├── index/
│   │   │   └── +Page.tsx  # Home page
│   │   ├── about/
│   │   │   └── +Page.tsx  # About page
│   │   └── contact/
│   │       └── +Page.tsx  # Contact page
│   └── index.css          # Global styles
├── index.html             # HTML template (for dev)
├── vite.config.ts         # Vite + Vike configuration
└── package.json
```

## How It Works

### Server-Side Rendering with Vike

This example uses [Vike](https://vike.dev/) (formerly vite-plugin-ssr) to enable SSR:

1. **File-based routing**: Pages are defined in the `src/pages/` directory using Vike's conventions
2. **Pre-rendering**: During build, Vike pre-renders all pages to static HTML
3. **Full content**: Pre-rendered HTML includes all page content, perfect for Peam indexing
4. **Development**: SSR works in development mode for accurate testing
5. **Production**: Static HTML is served with optional hydration for interactivity

### Peam Integration

The Peam search index is generated from the pre-rendered HTML files, ensuring:
- Full text content is indexed
- Page structure is preserved
- Search results are accurate and comprehensive

## Scripts

- `pnpm dev` - Start both client and server in development mode
- `pnpm dev:client` - Start only Vite dev server
- `pnpm dev:server` - Start only API server
- `pnpm build` - Build for production
- `pnpm peam:index` - Generate Peam search index
- `pnpm preview` - Preview production build

## Features

- ⚡ **Lightning Fast** - Built with Vite for instant HMR
- 🎨 **Modern UI** - Styled with Tailwind CSS
- 🔍 **AI-Powered Search** - Integrated Peam AI search
- 🚀 **Type-Safe** - Full TypeScript support
- 📱 **Responsive** - Works on all devices

## Important Notes

### Search Indexing for SPAs

Since this is a Single Page Application (SPA), the HTML files generated during build contain minimal content (just the app shell). For production use with Peam search, consider one of these approaches:

1. **Pre-rendering**: Use a tool like [vite-plugin-ssr](https://vite-plugin-ssr.com/) to pre-render your routes
2. **Static Site Generation**: Consider using a framework like Astro that supports static generation
3. **Server-Side Rendering**: Implement SSR to generate full HTML pages
4. **Manual Indexing**: Create a custom script to index your content programmatically

For development and testing, the AskAI chat component will still work - it just won't have pre-indexed content to search through.

## Learn More

To learn more about the technologies used in this example:

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Vike Documentation](https://vike.dev/)
- [Peam Documentation](https://peam.ai/)
- [Tailwind CSS](https://tailwindcss.com/)
