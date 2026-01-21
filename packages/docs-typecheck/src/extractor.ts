import type { CodeSample } from './types.js';

/**
 * Extracts TypeScript/JavaScript code samples from MDX/MD content
 */
export function extractCodeSamples(filePath: string, content: string): CodeSample[] {
  const samples: CodeSample[] = [];
  const lines = content.split('\n');

  let inCodeBlock = false;
  let codeBlockStart = 0;
  let codeBlockLanguage = '';
  let codeBlockLines: string[] = [];
  let skipTypeCheck = false;
  let expectedErrors: number[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;

    // Check for skip-typecheck or expect-error markers
    if (!inCodeBlock) {
      // JSX comment syntax for MDX: {/* @skip-typecheck: reason */}
      // HTML comment syntax for MD: <!-- @skip-typecheck: reason -->
      if (line.includes('@skip-typecheck') || line.includes('skip-typecheck')) {
        skipTypeCheck = true;
      }

      // <!-- @expect-error:2304,2307 -->
      const expectErrorMatch = line.match(/@expect-error:([0-9,]+)/);
      if (expectErrorMatch) {
        expectedErrors = expectErrorMatch[1].split(',').map((n) => parseInt(n));
      }
    }

    // Detect code block start
    const codeBlockMatch = line.match(/^```(typescript|ts|javascript|js)\s*$/);
    if (codeBlockMatch && !inCodeBlock) {
      inCodeBlock = true;
      codeBlockStart = lineNumber;
      codeBlockLanguage = codeBlockMatch[1] as 'typescript' | 'ts' | 'javascript' | 'js';
      codeBlockLines = [];
      continue;
    }

    // Detect code block end
    if (line.startsWith('```') && inCodeBlock) {
      const source = codeBlockLines.join('\n');
      const isIncomplete = source.includes('...');

      samples.push({
        source,
        language: codeBlockLanguage as 'ts' | 'typescript' | 'js' | 'javascript',
        filePath,
        lineNumber: codeBlockStart + 1,
        skipTypeCheck,
        expectedErrors,
        isIncomplete,
      });

      // Reset state
      inCodeBlock = false;
      skipTypeCheck = false;
      expectedErrors = [];
      continue;
    }

    // Collect code lines
    if (inCodeBlock) {
      codeBlockLines.push(line);
    }
  }

  return samples;
}

/**
 * Extracts code samples from a file path
 */
export async function extractCodeSamplesFromFile(filePath: string): Promise<CodeSample[]> {
  const fs = await import('node:fs/promises');
  const content = await fs.readFile(filePath, 'utf-8');
  return extractCodeSamples(filePath, content);
}
