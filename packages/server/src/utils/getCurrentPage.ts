import { UIMessage } from 'ai';

/**
 * Metadata about the current page the user is on.
 */
export interface CurrentPageMetadata {
  /**
   * The title of the page (optional).
   */
  title?: string;
  /**
   * The origin of the page.
   */
  origin: string;
  /**
   * The path of the page (e.g., "/about").
   */
  path: string;
}

/**
 * Extracts the current page metadata from the request and message.
 */
export const getCurrentPage = ({
  request,
  message,
}: {
  request: Request;
  message: UIMessage;
}): CurrentPageMetadata | undefined => {
  const messageMetadata = (message.metadata ?? {}) as {
    currentPage?: CurrentPageMetadata;
  };
  const messageCurrentPage = messageMetadata.currentPage;

  if (messageCurrentPage && messageCurrentPage.path && messageCurrentPage.origin) {
    return {
      title: messageCurrentPage.title,
      origin: messageCurrentPage.origin,
      path: messageCurrentPage.path,
    };
  }

  try {
    if (request.headers.has('referer')) {
      const refererUrl = new URL(request.headers.get('referer') || '');
      return {
        path: refererUrl.pathname,
        origin: refererUrl.origin,
      };
    }
  } catch {
    // Invalid referer URL
  }

  return undefined;
};
