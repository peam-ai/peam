import { createChat as createServerChat, type ChatRuntimeOptions, type DefaultChatRuntime } from 'peam/server';
import { getConfig } from './config';

export function createChat(options: ChatRuntimeOptions = {}): DefaultChatRuntime {
  const config = getConfig();

  return createServerChat({
    searchIndexStore: config.searchIndexStore,
    ...options,
  });
}
