import pico from 'picocolors';
import type { Formatter } from 'picocolors/types';

const PEAM_LOGGING_KEY = 'PEAM_LOGGING';

export type LoggerColor = 'white' | 'red' | 'yellow' | 'dim';

export interface Logger {
  error(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  debug(message: string, ...args: unknown[]): void;
}

function readBrowserLoggingSetting(): string | undefined {
  try {
    const g = globalThis as unknown as { localStorage?: { getItem(key: string): string | null } };
    if (!g.localStorage) return undefined;
    return g.localStorage.getItem(PEAM_LOGGING_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

function readServerLoggingSetting(): string | undefined {
  try {
    return typeof process !== 'undefined' && typeof process.env !== 'undefined' && PEAM_LOGGING_KEY in process.env
      ? process.env[PEAM_LOGGING_KEY]
      : undefined;
  } catch {
    return undefined;
  }
}

function isLoggingEnabled(): boolean {
  const serverSetting = readServerLoggingSetting();
  if (serverSetting !== undefined) return Boolean(serverSetting);

  const browserSetting = readBrowserLoggingSetting();
  if (browserSetting !== undefined) return Boolean(browserSetting);

  return false;
}

/**
 * Creates a basic logger with colors for Edge/browser/Node.
 */
function createLogger(namespace?: string): Logger {
  return {
    error: (message, ...args) => print(message, args, { namespace, color: 'red' }),
    warn: (message, ...args) => print(message, args, { namespace, color: 'yellow' }),
    debug: (message, ...args) => print(message, args, { namespace, color: 'yellow' }),
  };
}

type PrintOptions = {
  namespace?: string;
  color?: LoggerColor;
};

function print(message: string, args: unknown[], { namespace, color = 'white' }: PrintOptions) {
  if (!isLoggingEnabled()) return;

  const colorize = (pico as unknown as Record<string, Formatter>)[color] ?? pico.white;
  const header = `${colorize('[Peam]')} `;
  const ns = namespace ? `${pico.dim(namespace)} ` : '';

  console.log(header + ns + colorize(String(message)), ...args);
}

export const loggers = {
  parser: createLogger('peam:parser'),
  adapter: createLogger('peam:adapter'),
  next: createLogger('peam:next'),
  server: createLogger('peam:server'),
  ai: createLogger('peam:ai'),
  ui: createLogger('peam:ui'),
  search: createLogger('peam:search'),
  builder: createLogger('peam:builder'),
};
