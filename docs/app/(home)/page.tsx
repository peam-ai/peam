import type { Metadata } from 'next';
import { ConversationSummary } from './components/conversation-summary';
import { CTA } from './components/cta';
import { DataPrivacy } from './components/data-privacy';
import { DialogShowcase } from './components/dialog-showcase';
import { Footer } from './components/footer';
import { Frameworks } from './components/frameworks';
import { Hero } from './components/hero';
import { OpenSource } from './components/open-source';
import { RunAnyModels } from './components/run-anymodels';
import { SemanticSearch } from './components/semantic-search';

const title = 'AI that knows your website';
const description =
  'Add intelligent AI search and chat to your website with Peam. Open source, with simple installation and seamless integration with your existing content.';

export const metadata: Metadata = {
  title: 'Peam - AI that knows your website',
  description,
  alternates: {
    canonical: '/',
  },
};

const Home = () => (
  <div className="min-h-[calc(100vh-var(--fd-nav-height))] flex flex-col [&_h1]:tracking-tighter [&_h2]:tracking-tighter [&_h3]:tracking-tighter [&_h4]:tracking-tighter [&_h5]:tracking-tighter [&_h6]:tracking-tighter">
    <div className="flex-1">
      <div className="mx-auto w-full max-w-[1080px]">
        <Hero title={title} description={description} />
        <div className="grid divide-y border-y sm:border-x">
          <div className="grid sm:grid-cols-2 sm:divide-x divide-y sm:divide-y-0">
            <DialogShowcase />
            <SemanticSearch />
          </div>
          <ConversationSummary />
          <RunAnyModels />
          <Frameworks />
          <div className="grid sm:grid-cols-2 sm:divide-x divide-y sm:divide-y-0">
            <OpenSource />
            <DataPrivacy />
          </div>
          <CTA />
        </div>
      </div>
    </div>
    <div className="pt-16 sm:pt-24">
      <Footer />
    </div>
  </div>
);

export default Home;
