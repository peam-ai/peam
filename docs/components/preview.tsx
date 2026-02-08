import { CodeBlock } from '@/components/geistdocs/code-block';
import {
  CodeBlockTab,
  CodeBlockTabs,
  CodeBlockTabsList,
  CodeBlockTabsTrigger,
} from '@/components/geistdocs/code-block-tabs';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { codeToHtml } from 'shiki';
import { IframePreview } from './iframe-preview';

interface ComponentPreviewProps {
  path: string;
  className?: string;
}

export const Preview = async ({ path, className }: ComponentPreviewProps) => {
  const rawCode = await readFile(join(process.cwd(), 'components', 'previews', `${path}.tsx`), 'utf-8');
  const code = extractPreviewSnippet(rawCode);

  const highlightedCode = await codeToHtml(code, {
    lang: 'tsx',
    themes: {
      light: 'github-light-default',
      dark: 'github-dark-default',
    },
    defaultColor: false,
  });

  return (
    <CodeBlockTabs defaultValue="preview">
      <CodeBlockTabsList>
        <CodeBlockTabsTrigger value="preview">Preview</CodeBlockTabsTrigger>
        <CodeBlockTabsTrigger value="code">Code</CodeBlockTabsTrigger>
      </CodeBlockTabsList>
      <CodeBlockTab className="not-prose p-0" value="preview">
        <ResizablePanelGroup direction="horizontal" id={`preview-${path}`}>
          <ResizablePanel defaultSize={100}>
            <IframePreview className={className} path={path} />
          </ResizablePanel>
          <ResizableHandle className="translate-x-px border-none [&>div]:shrink-0" withHandle />
          <ResizablePanel defaultSize={0} />
        </ResizablePanelGroup>
      </CodeBlockTab>
      <CodeBlockTab className="p-0" value="code">
        <div className="not-prose h-150 overflow-y-auto">
          <CodeBlock>
            <pre dangerouslySetInnerHTML={{ __html: highlightedCode }} />
          </CodeBlock>
        </div>
      </CodeBlockTab>
    </CodeBlockTabs>
  );
};

const extractPreviewSnippet = (rawCode: string) => {
  const withoutUseClient = rawCode.replace(/^\s*['"]use client['"];?\s*\n+/m, '');
  const importLines = withoutUseClient
    .split('\n')
    .filter((line) => line.trim().startsWith('import '))
    .join('\n')
    .trim();

  const multilineMatch = withoutUseClient.match(/=>\s*\(([\s\S]*?)\);\s*export\s+default/s);
  const singleLineMatch = withoutUseClient.match(/=>\s*([^\n;]+);\s*export\s+default/s);
  const rawBody = multilineMatch?.[1] ?? singleLineMatch?.[1] ?? '';
  const body = sanitizeSnippet(dedentSnippet(rawBody));
  const helpers = sanitizeSnippet(dedentSnippet(extractHelperCode(withoutUseClient)));

  if (!importLines && !body) {
    return withoutUseClient.trim();
  }

  return [importLines, helpers, body].filter(Boolean).join('\n\n');
};

const dedentSnippet = (snippet: string) => {
  if (!snippet) {
    return snippet;
  }

  const allLines = snippet.split('\n');
  let start = 0;
  let end = allLines.length;

  while (start < end && allLines[start].trim().length === 0) {
    start += 1;
  }

  while (end > start && allLines[end - 1].trim().length === 0) {
    end -= 1;
  }

  const lines = allLines.slice(start, end);
  const nonEmptyLines = lines.filter((line) => line.trim().length > 0);
  const minIndent = nonEmptyLines.reduce((min, line) => {
    const match = line.match(/^(\s+)/);
    if (!match) {
      return 0;
    }
    return Math.min(min, match[1].length);
  }, Number.POSITIVE_INFINITY);

  if (!Number.isFinite(minIndent) || minIndent === 0) {
    return snippet;
  }

  return lines.map((line) => (line.trim().length ? line.slice(minIndent) : line)).join('\n');
};

const sanitizeSnippet = (snippet: string) => {
  let cleaned = snippet;

  cleaned = cleaned.replace(/^\s*defaultOpen\s*\n/gm, '');
  cleaned = cleaned.replace(/^\s*reuseContext=\{false\}\s*\n/gm, '');
  cleaned = cleaned.replace(/^\s*persistence=\{\{\s*key:\s*'docs-preview'\s*\}\}\s*\n/gm, '');

  cleaned = cleaned.replace(/\s+defaultOpen\b/g, '');
  cleaned = cleaned.replace(/\s+reuseContext=\{false\}/g, '');
  cleaned = cleaned.replace(/\s+persistence=\{\{\s*key:\s*'docs-preview'\s*\}\}/g, '');

  cleaned = cleaned.replace(/<([^>]*?)\s+>/g, '<$1>');
  cleaned = cleaned.replace(/<([^>]*?)\s+\/>/g, '<$1 />');

  return cleaned;
};

const extractHelperCode = (rawCode: string) => {
  const exportMatch = rawCode.match(/export\s+default\s+(\w+)/);
  const exportName = exportMatch?.[1];
  let content = rawCode;

  if (exportName) {
    const safeExportName = exportName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    content = content.replace(new RegExp(`export\\s+default\\s+${safeExportName};?\\s*`, 'g'), '');
    content = removeExportedComponent(content, exportName);
    content = content.replace(
      new RegExp(`function\\s+${safeExportName}\\s*\\([\\s\\S]*?\\)\\s*\\{[\\s\\S]*?\\}\\s*`, 'm'),
      ''
    );
  }

  const withoutImports = content
    .split('\n')
    .filter((line) => !line.trim().startsWith('import '))
    .join('\n')
    .trim();

  return withoutImports;
};

const removeExportedComponent = (source: string, exportName: string) => {
  const pattern = `const ${exportName}`;
  const startIndex = source.indexOf(pattern);
  if (startIndex === -1) {
    return source;
  }

  const afterStart = source.slice(startIndex);
  const endIndex = afterStart.indexOf(');');
  if (endIndex === -1) {
    return source;
  }

  const removeLength = endIndex + 2;
  return source.slice(0, startIndex) + afterStart.slice(removeLength);
};
