import debug from 'debug';

/**
 * Create a namespaced logger
 * @param namespace - The namespace for the logger (e.g., 'peam:parser', 'peam:adapter')
 * @returns A debug logger instance
 */
export function createLogger(namespace: string) {
  return debug(namespace);
}

export const loggers = {
  parser: createLogger('peam:parser'),
  adapter: createLogger('peam:adapter'),
  next: createLogger('peam:next'),
  server: createLogger('peam:server'),
  ai: createLogger('peam:ai'),
  ui: createLogger('peam:ui'),
  search: createLogger('peam:search'),
};
