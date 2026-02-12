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
  const code = await readFile(join(process.cwd(), 'components', 'previews', `${path}.tsx`), 'utf-8');

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
