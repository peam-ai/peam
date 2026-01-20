'use client';

import { Bot, User } from 'lucide-react';

interface Message {
  id: number;
  type: 'user' | 'ai';
  text: string;
}

const FIRST_ROUND_MESSAGES: Message[] = [
  { id: 1, type: 'user', text: 'How do I install Peam?' },
  { id: 2, type: 'ai', text: 'You can install Peam using npm or yarn. Run npm install peam in your project.' },
  { id: 3, type: 'user', text: 'What if I want to use it with Next.js?' },
  { id: 4, type: 'ai', text: 'Perfect! We have a dedicated @peam/next package. Install it with npm install @peam/next.' },
  { id: 5, type: 'user', text: 'Great, thanks for the help!' },
];

const SECOND_ROUND_MESSAGES: Message[] = [
  { id: 6, type: 'ai', text: 'You can configure search in your peam.config.js file. Set the searchOptions property.' },
  { id: 7, type: 'user', text: 'What options are available?' },
  { id: 8, type: 'ai', text: 'You can customize relevance threshold, result limit, and semantic understanding level.' },
  { id: 9, type: 'user', text: 'Can I customize the UI components?' },
  { id: 10, type: 'ai', text: 'Yes! All components are fully customizable with Tailwind classes or custom CSS.' },
];

export const ConversationSummary = () => {
  return (
    <section className="px-8 sm:px-12 py-12 sm:py-16">
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-3">
        <h2 className="font-semibold text-2xl sm:text-3xl lg:text-4xl tracking-tight">
          Automatic Conversation Summarization
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg">
          Keep conversations focused and efficient with automatic message summarization
        </p>
      </div>
      
      <div className="relative max-w-2xl mx-auto h-[420px]">
        <div className="space-y-3 conversation-demo absolute inset-0">
          {/* First round messages */}
          <div className="message message-1 flex gap-3 items-start opacity-0 justify-end">
            <div className="flex-1 bg-primary/10 border border-primary/20 rounded-lg p-3 max-w-[80%]">
              <p className="text-sm">{FIRST_ROUND_MESSAGES[0].text}</p>
            </div>
            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="size-4" />
            </div>
          </div>

          <div className="message message-2 flex gap-3 items-start opacity-0">
            <div className="size-8 rounded-full bg-muted flex items-center justify-center shrink-0">
              <Bot className="size-4" />
            </div>
            <div className="flex-1 bg-accent/50 border rounded-lg p-3 max-w-[80%]">
              <p className="text-sm">{FIRST_ROUND_MESSAGES[1].text}</p>
            </div>
          </div>

          <div className="message message-3 flex gap-3 items-start opacity-0 justify-end">
            <div className="flex-1 bg-primary/10 border border-primary/20 rounded-lg p-3 max-w-[80%]">
              <p className="text-sm">{FIRST_ROUND_MESSAGES[2].text}</p>
            </div>
            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="size-4" />
            </div>
          </div>

          <div className="message message-4 flex gap-3 items-start opacity-0">
            <div className="size-8 rounded-full bg-muted flex items-center justify-center shrink-0">
              <Bot className="size-4" />
            </div>
            <div className="flex-1 bg-accent/50 border rounded-lg p-3 max-w-[80%]">
              <p className="text-sm">{FIRST_ROUND_MESSAGES[3].text}</p>
            </div>
          </div>

          <div className="message message-5 flex gap-3 items-start opacity-0 justify-end">
            <div className="flex-1 bg-primary/10 border border-primary/20 rounded-lg p-3 max-w-[80%]">
              <p className="text-sm">{FIRST_ROUND_MESSAGES[4].text}</p>
            </div>
            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="size-4" />
            </div>
          </div>

          {/* Loading spinner */}
          <div className="loading-spinner flex items-center gap-2 opacity-0">
            <div className="size-4 border-2 border-muted-foreground/20 border-t-muted-foreground rounded-full animate-spin" />
            <span className="text-xs text-muted-foreground">Summarizing...</span>
          </div>

          {/* Summary indicator */}
          <div className="summary-indicator flex items-center justify-center gap-2 py-4 opacity-0">
            <div className="h-px flex-1 bg-border" />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30">
              <svg className="size-4 text-green-600 dark:text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-xs font-medium text-green-600 dark:text-green-500">Messages summarized</span>
            </div>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Second round messages */}
          <div className="message message-6 flex gap-3 items-start opacity-0">
            <div className="size-8 rounded-full bg-muted flex items-center justify-center shrink-0">
              <Bot className="size-4" />
            </div>
            <div className="flex-1 bg-accent/50 border rounded-lg p-3 max-w-[80%]">
              <p className="text-sm">{SECOND_ROUND_MESSAGES[0].text}</p>
            </div>
          </div>

          <div className="message message-7 flex gap-3 items-start opacity-0 justify-end">
            <div className="flex-1 bg-primary/10 border border-primary/20 rounded-lg p-3 max-w-[80%]">
              <p className="text-sm">{SECOND_ROUND_MESSAGES[1].text}</p>
            </div>
            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="size-4" />
            </div>
          </div>

          <div className="message message-8 flex gap-3 items-start opacity-0">
            <div className="size-8 rounded-full bg-muted flex items-center justify-center shrink-0">
              <Bot className="size-4" />
            </div>
            <div className="flex-1 bg-accent/50 border rounded-lg p-3 max-w-[80%]">
              <p className="text-sm">{SECOND_ROUND_MESSAGES[2].text}</p>
            </div>
          </div>

          <div className="message message-9 flex gap-3 items-start opacity-0 justify-end">
            <div className="flex-1 bg-primary/10 border border-primary/20 rounded-lg p-3 max-w-[80%]">
              <p className="text-sm">{SECOND_ROUND_MESSAGES[3].text}</p>
            </div>
            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="size-4" />
            </div>
          </div>

          <div className="message message-10 flex gap-3 items-start opacity-0">
            <div className="size-8 rounded-full bg-muted flex items-center justify-center shrink-0">
              <Bot className="size-4" />
            </div>
            <div className="flex-1 bg-accent/50 border rounded-lg p-3 max-w-[80%]">
              <p className="text-sm">{SECOND_ROUND_MESSAGES[4].text}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <style jsx>{`
      @keyframes message1Timeline {
        0% { opacity: 0; transform: translateY(10px); max-height: 0; margin: 0; }
        4% { opacity: 0; transform: translateY(10px); max-height: 0; margin: 0; }
        6% { opacity: 1; transform: translateY(0); max-height: 100px; margin: 0.75rem 0; }
        44% { opacity: 1; transform: translateY(0); max-height: 100px; margin: 0.75rem 0; }
        50% { opacity: 0; max-height: 0; margin: 0; }
        100% { opacity: 0; transform: translateY(10px); max-height: 0; margin: 0; }
      }

      @keyframes message2Timeline {
        0% { opacity: 0; transform: translateY(10px); max-height: 0; margin: 0; }
        10% { opacity: 0; transform: translateY(10px); max-height: 0; margin: 0; }
        11% { opacity: 1; transform: translateY(0); max-height: 100px; margin: 0.75rem 0; }
        44% { opacity: 1; transform: translateY(0); max-height: 100px; margin: 0.75rem 0; }
        50% { opacity: 0; max-height: 0; margin: 0; }
        100% { opacity: 0; transform: translateY(10px); max-height: 0; margin: 0; }
      }

      @keyframes message3Timeline {
        0% { opacity: 0; transform: translateY(10px); max-height: 0; margin: 0; }
        16% { opacity: 0; transform: translateY(10px); max-height: 0; margin: 0; }
        17% { opacity: 1; transform: translateY(0); max-height: 100px; margin: 0.75rem 0; }
        44% { opacity: 1; transform: translateY(0); max-height: 100px; margin: 0.75rem 0; }
        50% { opacity: 0; max-height: 0; margin: 0; }
        100% { opacity: 0; transform: translateY(10px); max-height: 0; margin: 0; }
      }

      @keyframes message4Timeline {
        0% { opacity: 0; transform: translateY(10px); max-height: 0; margin: 0; }
        22% { opacity: 0; transform: translateY(10px); max-height: 0; margin: 0; }
        23% { opacity: 1; transform: translateY(0); max-height: 100px; margin: 0.75rem 0; }
        44% { opacity: 1; transform: translateY(0); max-height: 100px; margin: 0.75rem 0; }
        50% { opacity: 0; max-height: 0; margin: 0; }
        100% { opacity: 0; transform: translateY(10px); max-height: 0; margin: 0; }
      }

      @keyframes message5Timeline {
        0% { opacity: 0; transform: translateY(10px); max-height: 0; margin: 0; }
        28% { opacity: 0; transform: translateY(10px); max-height: 0; margin: 0; }
        29% { opacity: 1; transform: translateY(0); max-height: 100px; margin: 0.75rem 0; }
        44% { opacity: 1; transform: translateY(0); max-height: 100px; margin: 0.75rem 0; }
        50% { opacity: 0; max-height: 0; margin: 0; }
        100% { opacity: 0; transform: translateY(10px); max-height: 0; margin: 0; }
      }

      @keyframes loadingSpinnerTimeline {
        0% { opacity: 0; transform: translateY(10px); max-height: 50px; margin: 0.75rem 0; }
        32% { opacity: 0; transform: translateY(10px); max-height: 50px; margin: 0.75rem 0; }
        34% { opacity: 1; transform: translateY(0); max-height: 50px; margin: 0.75rem 0; }
        50% { opacity: 1; transform: translateY(0); max-height: 50px; margin: 0.75rem 0; }
        50.01% { opacity: 0; max-height: 0; margin: 0; }
        100% { opacity: 0; max-height: 0; margin: 0; }
      }

      @keyframes summaryTimeline {
        0% { opacity: 0; }
        50% { opacity: 0; }
        51% { opacity: 1; }
        100% { opacity: 1; }
      }

      @keyframes message6Timeline {
        0% { opacity: 0; transform: translateY(10px); }
        60% { opacity: 0; transform: translateY(10px); }
        61% { opacity: 1; transform: translateY(0); }
        100% { opacity: 1; transform: translateY(0); }
      }

      @keyframes message7Timeline {
        0% { opacity: 0; transform: translateY(10px); }
        64% { opacity: 0; transform: translateY(10px); }
        65% { opacity: 1; transform: translateY(0); }
        100% { opacity: 1; transform: translateY(0); }
      }

      @keyframes message8Timeline {
        0% { opacity: 0; transform: translateY(10px); }
        68% { opacity: 0; transform: translateY(10px); }
        69% { opacity: 1; transform: translateY(0); }
        100% { opacity: 1; transform: translateY(0); }
      }

      @keyframes message9Timeline {
        0% { opacity: 0; transform: translateY(10px); }
        72% { opacity: 0; transform: translateY(10px); }
        73% { opacity: 1; transform: translateY(0); }
        100% { opacity: 1; transform: translateY(0); }
      }

      @keyframes message10Timeline {
        0% { opacity: 0; transform: translateY(10px); }
        76% { opacity: 0; transform: translateY(10px); }
        77% { opacity: 1; transform: translateY(0); }
        100% { opacity: 1; transform: translateY(0); }
      }

      .conversation-demo {
        animation: none;
      }

      .message-1 {
        animation: message1Timeline 7s ease-in-out infinite;
      }

      .message-2 {
        animation: message2Timeline 7s ease-in-out infinite;
      }

      .message-3 {
        animation: message3Timeline 7s ease-in-out infinite;
      }

      .message-4 {
        animation: message4Timeline 7s ease-in-out infinite;
      }

      .message-5 {
        animation: message5Timeline 7s ease-in-out infinite;
      }

      .loading-spinner {
        animation: loadingSpinnerTimeline 7s ease-in-out infinite;
      }

      .summary-indicator {
        animation: summaryTimeline 7s ease-in-out infinite;
      }

      .message-6 {
        animation: message6Timeline 7s ease-in-out infinite;
      }

      .message-7 {
        animation: message7Timeline 7s ease-in-out infinite;
      }

      .message-8 {
        animation: message8Timeline 7s ease-in-out infinite;
      }

      .message-9 {
        animation: message9Timeline 7s ease-in-out infinite;
      }

      .message-10 {
        animation: message10Timeline 7s ease-in-out infinite;
      }

      @media (prefers-reduced-motion: reduce) {
        .message-1,
        .message-2,
        .message-3,
        .message-4,
        .message-5,
        .loading-spinner,
        .summary-indicator,
        .message-6,
        .message-7,
        .message-8,
        .message-9,
        .message-10 {
          animation: none;
          opacity: 1;
        }
      }
    `}</style>
  </section>
  );
};
