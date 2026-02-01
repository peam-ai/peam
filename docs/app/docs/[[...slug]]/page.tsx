import { CopyPage } from '@/components/geistdocs/copy-page';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  generatePageMetadata,
  generateStaticPageParams,
} from '@/components/geistdocs/docs-page';
import { EditSource } from '@/components/geistdocs/edit-source';
import { getMDXComponents } from '@/components/geistdocs/mdx-components';
import { ScrollTop } from '@/components/geistdocs/scroll-top';
import * as AccordionComponents from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { notFound } from 'next/navigation';

import { getLLMText, source } from '@/lib/geistdocs/source';
import { TSDoc } from '@/lib/tsdoc';

const Page = async (props: PageProps<'/docs/[[...slug]]'>) => {
  const params = await props.params;

  const page = source.getPage(params.slug);

  if (!page) {
    notFound();
  }

  const markdown = await getLLMText(page);
  const MDX = page.data.body;

  return (
    <DocsPage
      slug={params.slug}
      tableOfContent={{
        style: 'clerk',
        footer: (
          <div className="my-3 space-y-3">
            <Separator />
            <EditSource path={page.path} />
            <ScrollTop />
            <CopyPage text={markdown} />
          </div>
        ),
      }}
      toc={page.data.toc}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            a: createRelativeLink(source, page),

            // Add your custom components here
            Badge,
            TSDoc,
            Step,
            Steps,
            ...AccordionComponents,
            Tabs,
            Tab,
          })}
        />
      </DocsBody>
    </DocsPage>
  );
};

export const generateStaticParams = generateStaticPageParams;

export const generateMetadata = async (props: PageProps<'/docs/[[...slug]]'>) => {
  const params = await props.params;

  return generatePageMetadata(params.slug);
};

export default Page;
