import { access, readFile, readdir, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const EXAMPLES_ROOT = resolve(__dirname, '../../../examples');
const EXAMPLE_DIRS = await getExampleDirs();

function indexPath(exampleDir: string) {
  return join(exampleDir, '.peam/index.json');
}

async function readIndex(exampleDir: string) {
  const path = indexPath(exampleDir);
  const raw = await readFile(path, 'utf-8');
  return JSON.parse(raw) as { keys: string[]; data?: Record<string, unknown> };
}

async function readIndexSize(exampleDir: string) {
  const path = indexPath(exampleDir);
  const fileStat = await stat(path);
  return fileStat.size;
}

function normalizeDocumentIds(rawIds: unknown): string[] {
  const ids = ((): string[] => {
    if (Array.isArray(rawIds)) return rawIds;
    if (typeof rawIds === 'string') {
      try {
        const parsed = JSON.parse(rawIds);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  })();

  return ids.map((value) => (value !== '/' ? value.replace(/\/$/, '') : value));
}

async function getExampleDirs() {
  const entries = await readdir(EXAMPLES_ROOT, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({ name: entry.name, dir: join(EXAMPLES_ROOT, entry.name) }));
}

describe('examples tests', () => {
  test('examples are discovered', () => {
    expect(EXAMPLE_DIRS.length).toBeGreaterThan(0);
  });

  test.each(EXAMPLE_DIRS)('index file exists for %s', async (example) => {
    // Arrange
    const indexPath = join(example.dir, '.peam/index.json');

    // Act, Assert
    await expect(access(indexPath)).resolves.toBeUndefined();
  });

  test.each(EXAMPLE_DIRS)('index shape is valid for %s', async (example) => {
    // Arrange
    const index = await readIndex(example.dir);

    // Act, Assert
    expect(Array.isArray(index.keys)).toBe(true);
    expect(index.keys.length).toBeGreaterThan(0);
    expect(index.data).toBeDefined();
  });

  test.each(EXAMPLE_DIRS)('index size for %s', async (example) => {
    // Arrange
    const baseline = await readIndexSize(EXAMPLE_DIRS[0].dir);
    const current = await readIndexSize(example.dir);
    const tolerance = 512; // 512 bytes tolerance

    // Act, Assert
    const diff = Math.abs(current - baseline);
    expect(diff, `Size diff for ${example.name}`).toBeLessThanOrEqual(tolerance);
  });

  test.each(EXAMPLE_DIRS)('documentIds length for %s', async (example) => {
    // Arrange
    const index = await readIndex(example.dir);
    const rawIds = index.data?.['peam.documentIds'];
    const normalized = normalizeDocumentIds(rawIds);

    // Act, Assert
    expect(normalized.length).equals(3);
  });

  test.each(EXAMPLE_DIRS)('documentIds include core routes for %s', async (example) => {
    // Arrange
    const index = await readIndex(example.dir);
    const rawIds = index.data?.['peam.documentIds'];
    const normalized = normalizeDocumentIds(rawIds);

    // Act, Assert
    expect(normalized).toEqual(expect.arrayContaining(['/about', '/contact', '/']));
  });
});
