# Peam

AI that knows your website.

## Documentation

For detailed documentation, visit [peam.ai/docs](https://peam.ai/docs)

## Installation

```bash
npm install peam
```

## Usage

### Client Components

Add the `AskAI` component to your app (e.g. Next.js):

```tsx
import { AskAI } from 'peam/client';

export default function Layout({ children }) {
  return (
    <html>
      <body>
        {children}
        <AskAI />
      </body>
    </html>
  );
}
```

### Server Handler

Create an API route handler:

```typescript
import { createHandler } from 'peam/server';
import { openai } from '@ai-sdk/openai';

export const POST = createHandler({
  model: openai('gpt-4o'),
  getSearchEngine: async () => mySearchEngine,
});
```

### CLI

Extract and index your static site:

```bash
# Index your built site
peam ./out

# Exclude specific paths
peam ./out --exclude "/admin/**,/api/*"

# Specify output directory
peam ./out --output .peam
```

## License

Apache-2.0
