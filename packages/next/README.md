# @peam-ai/next

Peam integration for Next.js applications.

## Usage

Configure Peam in your `next.config.ts`:

```typescript
import { withPeam } from '@peam-ai/next';

const nextConfig = {
  // your Next.js config
};

export default withPeam({
  outputDir: '.peam',
  indexFilename: 'index.json',
  respectRobotsTxt: true,
  exclude: ['/admin/**', '/api/*'],
})(nextConfig);
```

Create an API route at `app/api/peam/route.ts`:

```typescript
export { POST } from '@peam-ai/next/route';
```

## Documentation

For detailed documentation, visit [peam.ai/docs](https://peam.ai/docs)

## License

Apache-2.0
