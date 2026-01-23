# Next.js 16 Example with Peam

This is a simple Next.js 16 example application demonstrating how to use Peam for AI-powered search and chat.

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

### 3. Build the application

Build the app to generate the search index:

```bash
pnpm build
```

The `withPeam` configuration will automatically extract and index your content during the build.

### 4. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 5. Try Peam Ask AI

Click the Peam Ask AI button in the bottom right corner to ask questions about the site!

## Documentation

Please visit the [Peam Documentation](https://peam.ai/docs) for more details on how to use Peam in your projects.
