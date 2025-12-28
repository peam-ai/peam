import { type CurrentPageMetadata } from '@peam/ai';
import { UIMessage } from 'ai';

export const getCurrentPage = ({
  request,
  message,
}: {
  request: Request;
  message: UIMessage;
}): CurrentPageMetadata | undefined => {
  const messageMetadata = message.metadata as { currentPage?: { title: string; origin: string; path: string } };
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
