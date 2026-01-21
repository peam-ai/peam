/**
 * Global type declarations for documentation code samples.
 * These provide liberal types for placeholder functions and variables
 * commonly used in documentation examples.
 *
 * Wrapped in `declare global` to ensure these are available globally
 * even when moduleDetection is set to "force" (for top-level await support).
 */

import type * as ReactTypes from 'react';

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
  
  // Placeholder functions - all accept any args and return Promise<any>
  function fetchData(...args: any[]): Promise<any>;
  function fetchUser(...args: any[]): Promise<any>;
  function saveData(...args: any[]): Promise<any>;
  function processItem(...args: any[]): Promise<any>;
  function handleRequest(...args: any[]): Promise<any>;
  function sendEmail(...args: any[]): Promise<any>;
  function transform(...args: any[]): any;

  // Placeholder types
  type User = {
    id: string;
    name: string;
    [key: string]: any;
  };
  
  type Message = {
    id: string;
    content: string;
    [key: string]: any;
  };
  
  // Next.js types
  type NextConfig = Record<string, any>;
  
  // Search index type
  type SearchIndex = Record<string, any>;
  
  // Search engine placeholder
  const mySearchEngine: any;
  const myCustomSearchIndex: any;
  const nextConfig: any;
}
