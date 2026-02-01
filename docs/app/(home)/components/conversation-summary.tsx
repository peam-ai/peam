'use client';

import { Bot, FileText, User } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Spinner } from '@/components/ui/spinner';

interface Message {
  id: number;
  type: 'user' | 'ai';
  text: string;
}

const FIRST_ROUND_MESSAGES: Message[] = [
  { id: 1, type: 'user', text: 'How do I install Peam?' },
  { id: 2, type: 'ai', text: 'You can install Peam using npm or yarn. Run npm install peam in your project.' },
  { id: 3, type: 'user', text: 'What if I want to use it with Next.js?' },
  {
    id: 4,
    type: 'ai',
    text: 'Perfect! We have a dedicated @peam/next package. Install it with npm install @peam/next.',
  },
  { id: 5, type: 'user', text: 'Great, thanks for the help!' },
];

const SECOND_ROUND_MESSAGES: Message[] = [
  { id: 6, type: 'ai', text: 'You can configure search in your peam.config.js file. Set the searchOptions property.' },
  { id: 7, type: 'user', text: 'What options are available?' },
  { id: 8, type: 'ai', text: 'You can customize relevance threshold, result limit, and semantic understanding level.' },
  { id: 9, type: 'user', text: 'Can I customize the UI components?' },
  { id: 10, type: 'ai', text: 'Yes! All components are fully customizable with Tailwind classes or custom CSS.' },
];

interface MessageBubbleProps {
  message: Message;
  delay: string;
}

const MessageBubble = ({ message, delay }: MessageBubbleProps) => {
  const isUser = message.type === 'user';

  return (
    <div
      className={`conversation-message flex gap-3 items-start ${isUser ? 'justify-end' : ''}`}
      style={{
        ['--delay' as string]: delay,
      }}
    >
      {!isUser && (
        <div className="size-8 rounded-full bg-muted flex items-center justify-center shrink-0">
          <Bot className="size-4" />
        </div>
      )}
      <div
        className={`flex-1 rounded-lg p-3 max-w-[80%] border ${
          isUser ? 'bg-primary/10 border-primary/20' : 'bg-accent/50'
        }`}
      >
        <p className="text-sm">{message.text}</p>
      </div>
      {isUser && (
        <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <User className="size-4" />
        </div>
      )}
    </div>
  );
};

interface MessageListProps {
  messages: Message[];
  delays: string[];
  className?: string;
}

const MessageList = ({ messages, delays, className }: MessageListProps) => (
  <div className={`space-y-3 overflow-hidden ${className ?? ''}`.trim()}>
    {messages.map((message, index) => (
      <MessageBubble key={message.id} message={message} delay={delays[index] ?? '0s'} />
    ))}
  </div>
);

const LoadingSpinner = () => (
  <div className="flex items-center gap-2 opacity-0 animate-[loadingSpinnerTimeline_var(--cycle)_ease-in-out_infinite] motion-reduce:opacity-100 motion-reduce:animate-none">
    <Spinner className="text-muted-foreground" />
    <span className="text-xs text-muted-foreground">Summarizing...</span>
  </div>
);

const SummaryIndicator = () => (
  <div className="summary-indicator flex items-center justify-center gap-2 py-4">
    <div className="h-px flex-1 bg-border" />
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30">
      <FileText className="size-4 text-green-600 dark:text-green-500" />
      <span className="text-xs font-medium text-green-600 dark:text-green-500">Messages summarized</span>
    </div>
    <div className="h-px flex-1 bg-border" />
  </div>
);

export const ConversationSummary = () => {
  const [isReady, setIsReady] = useState(false);
  const step = 0.2;
  const firstRoundStart = 0;
  const summarizingGap = 3;
  const secondRoundStart = firstRoundStart + step * (FIRST_ROUND_MESSAGES.length - 1) + summarizingGap;
  const firstRoundDelays = FIRST_ROUND_MESSAGES.map((_, index) => `${(firstRoundStart + step * index).toFixed(1)}s`);
  const secondRoundDelays = SECOND_ROUND_MESSAGES.map((_, index) => `${(secondRoundStart + step * index).toFixed(1)}s`);

  useEffect(() => {
    const animationFrame = requestAnimationFrame(() => setIsReady(true));

    return () => cancelAnimationFrame(animationFrame);
  }, []);

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

        <div className="relative max-w-2xl mx-auto h-105">
          <div
            className={`conversation-demo absolute inset-0 flex flex-col transition-opacity duration-300 ${
              isReady ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <MessageList className="first-round" messages={FIRST_ROUND_MESSAGES} delays={firstRoundDelays} />
            <LoadingSpinner />
            <SummaryIndicator />
            <MessageList className="second-round" messages={SECOND_ROUND_MESSAGES} delays={secondRoundDelays} />
          </div>
        </div>
      </div>

      <style jsx global>{`
        .conversation-demo {
          --cycle: 7s;
        }

        .conversation-message {
          opacity: 0;
          animation: messageIn var(--cycle) ease-in-out infinite;
          animation-delay: var(--delay, 0s);
          animation-fill-mode: both;
        }

        .first-round {
          opacity: 0;
          animation: firstRoundCollapse var(--cycle) ease-in-out infinite;
          transform-origin: top;
        }

        .second-round {
          opacity: 0;
          animation: secondRoundReveal var(--cycle) ease-in-out infinite;
          transform-origin: top;
        }

        .summary-indicator {
          opacity: 0;
          animation: summaryTimeline var(--cycle) ease-in-out infinite;
        }

        @keyframes messageIn {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          10% {
            opacity: 0;
            transform: translateY(10px);
          }
          18% {
            opacity: 1;
            transform: translateY(0);
          }
          72% {
            opacity: 1;
            transform: translateY(0);
          }
          86% {
            opacity: 0;
            transform: translateY(-6px);
          }
          100% {
            opacity: 0;
            transform: translateY(-6px);
          }
        }

        @keyframes firstRoundCollapse {
          0% {
            opacity: 1;
            max-height: 520px;
            transform: translateY(0);
          }
          44% {
            opacity: 1;
            max-height: 520px;
            transform: translateY(0);
          }
          52% {
            opacity: 0;
            max-height: 0;
            transform: translateY(-8px);
          }
          100% {
            opacity: 0;
            max-height: 0;
            transform: translateY(-8px);
          }
        }

        @keyframes secondRoundReveal {
          0% {
            opacity: 0;
            max-height: 0;
            transform: translateY(6px);
          }
          52% {
            opacity: 0;
            max-height: 0;
            transform: translateY(6px);
          }
          60% {
            opacity: 1;
            max-height: 520px;
            transform: translateY(0);
          }
          100% {
            opacity: 1;
            max-height: 520px;
            transform: translateY(0);
          }
        }

        @keyframes loadingSpinnerTimeline {
          0% {
            opacity: 0;
            max-height: 0;
            margin: 0;
            transform: translateY(8px);
          }
          34% {
            opacity: 0;
            max-height: 0;
            margin: 0;
            transform: translateY(8px);
          }
          38% {
            opacity: 1;
            max-height: 60px;
            margin: 0.75rem 0;
            transform: translateY(0);
          }
          48% {
            opacity: 1;
            max-height: 60px;
            margin: 0.75rem 0;
            transform: translateY(0);
          }
          52% {
            opacity: 0;
            max-height: 0;
            margin: 0;
            transform: translateY(-8px);
          }
          100% {
            opacity: 0;
            max-height: 0;
            margin: 0;
            transform: translateY(-8px);
          }
        }

        @keyframes summaryTimeline {
          0% {
            opacity: 0;
            transform: translateY(6px);
          }
          48% {
            opacity: 0;
            transform: translateY(6px);
          }
          54% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .conversation-message,
          .first-round,
          .second-round,
          .summary-indicator {
            animation: none;
            opacity: 1;
            max-height: none;
            transform: none;
            margin: 0;
          }
        }
      `}</style>
    </section>
  );
};
