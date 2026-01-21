/**
 * Global type declarations for documentation code samples.
 * These provide types for placeholder functions and variables
 * commonly used in documentation examples.
 *
 * Wrapped in `declare global` to ensure these are available globally
 * even when moduleDetection is set to "force" (for top-level await support).
 */

import type { NextConfig } from 'next';
import type * as ReactTypes from 'react';
import type { PeamConfig } from '@peam-ai/next';
import type { SearchIndexData } from 'peam/search';
import type { SearchEngine } from 'peam/search';

export {};

declare global {
  // React namespace for JSX and React types
  namespace React {
    export import ReactNode = ReactTypes.ReactNode;
    export import ReactElement = ReactTypes.ReactElement;
    export import FC = ReactTypes.FC;
    export import ComponentType = ReactTypes.ComponentType;
    export import PropsWithChildren = ReactTypes.PropsWithChildren;
  }

  // Placeholder types - using proper types from internal packages
  type User = {
    id: string;
    name: string;
    email?: string;
    [key: string]: unknown;
  };

  type Message = {
    id: string;
    content: string;
    role?: 'user' | 'assistant' | 'system';
    [key: string]: unknown;
  };

  // Search index type from internal package
  type SearchIndex = SearchIndexData;

  // Search engine placeholder - properly typed
  const mySearchEngine: SearchEngine;
  const myCustomSearchIndex: SearchIndexData;
  const nextConfig: NextConfig;
  const peamConfig: PeamConfig;
}
