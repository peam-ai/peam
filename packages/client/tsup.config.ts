import cssnano from 'cssnano';
import fs from 'fs/promises';
import path from 'path';
import postcss from 'postcss';
import loadPostcssConfig from 'postcss-load-config';
import { defineConfig } from 'tsup';

// See this Tailwind issue: https://github.com/tailwindlabs/tailwindcss/issues/15005
function extractTailwindProperties(css: string) {
  let outCss = '';
  let props = '';
  let i = 0;

  while (i < css.length) {
    const idx = css.indexOf('@property', i);
    if (idx === -1) {
      outCss += css.slice(i);
      break;
    }

    outCss += css.slice(i, idx);
    const braceStart = css.indexOf('{', idx);
    if (braceStart === -1) {
      outCss += css.slice(idx);
      break;
    }

    let depth = 0;
    let j = braceStart;
    for (; j < css.length; j += 1) {
      const ch = css[j];
      if (ch === '{') depth += 1;
      if (ch === '}') {
        depth -= 1;
        if (depth === 0) {
          j += 1;
          break;
        }
      }
    }

    props += `${css.slice(idx, j)}\n`;
    i = j;
  }

  return { css: outCss, properties: props.trim() };
}

function normalizeTailwindForShadowDom(css: string) {
  let transformed = css;

  const supportsPattern = /@supports\s+[^\{]*-webkit-hyphens[^\{]*\{/g;
  const matches: Array<{
    start: number;
    end: number;
    contentStart: number;
    contentEnd: number;
  }> = [];

  const pattern = new RegExp(supportsPattern);
  let match = pattern.exec(transformed);

  while (match !== null) {
    const contentStart = match.index + match[0].length;
    let braceCount = 1;
    let i = contentStart;

    while (i < transformed.length && braceCount > 0) {
      if (transformed[i] === '{') {
        braceCount += 1;
      }
      if (transformed[i] === '}') {
        braceCount -= 1;
        if (braceCount === 0) {
          matches.push({
            start: match.index,
            end: i + 1,
            contentStart,
            contentEnd: i,
          });
          break;
        }
      }
      i += 1;
    }

    match = pattern.exec(transformed);
  }

  if (matches.length > 0) {
    let result = '';
    let lastIndex = 0;
    for (const m of matches) {
      result += transformed.substring(lastIndex, m.start);
      result += transformed.substring(m.contentStart, m.contentEnd);
      lastIndex = m.end;
    }
    result += transformed.substring(lastIndex);
    transformed = result;
  }

  transformed = transformed.replace(/:root\b/g, ':host');

  return transformed;
}

function cssToStringPlugin() {
  return {
    name: 'css-to-string-with-postcss-config',
    async setup(build: any) {
      const { plugins, options } = await loadPostcssConfig();
      const srcRoot = path.resolve(process.cwd(), 'src');

      build.onResolve({ filter: /\.css\?inline$/ }, (args: any) => {
        if (args.path.startsWith('@/')) {
          return {
            path: path.join(srcRoot, args.path.slice(2)),
            namespace: 'css-inline',
          };
        }
        return {
          path: path.isAbsolute(args.path) ? args.path : path.join(args.resolveDir, args.path),
          namespace: 'css-inline',
        };
      });

      build.onLoad({ filter: /\.css\?inline$/, namespace: 'css-inline' }, async (args: any) => {
        const realPath = args.path.replace('?inline', '');

        const source = await fs.readFile(realPath, 'utf8');

        const result = await postcss(plugins).process(source, {
          from: realPath,
          ...options,
        });

        const minified = await postcss([cssnano()]).process(result.css, {
          from: undefined,
        });
        const normalized = normalizeTailwindForShadowDom(minified.css);
        const extracted = extractTailwindProperties(normalized);
        const css = extracted.css;
        const tailwindProperties = extracted.properties;

        return {
          contents: `const css = ${JSON.stringify(css)};\nexport const tailwindProperties = ${JSON.stringify(
            tailwindProperties
          )};\nexport default css;`,
          loader: 'js',
        };
      });
    },
  };
}

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  target: 'ES2015',
  platform: 'browser',
  dts: {
    resolve: true,
  },
  bundle: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom'],
  treeshake: true,
  minify: true,
  injectStyle: false,
  onSuccess: 'node ./build/injectClientHeaders.js',
  esbuildPlugins: [cssToStringPlugin()],
});
