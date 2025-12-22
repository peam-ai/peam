import { StructuredPage } from '../structuredPage';
import { ParseOptions, Parser } from './parser';

export class CssSelectorParser implements Parser {
  parse(document: Document, options?: ParseOptions): StructuredPage | undefined {
    const title = document.querySelector('title')?.textContent;
    const description = document.querySelector('meta[name="description"]')?.getAttribute('content');
    const content = document.body.innerHTML;

    const bodyClone = document.body.cloneNode(true) as HTMLElement;
    bodyClone
      .querySelectorAll('script, style, noscript, iframe, [hidden], nav, header, footer, aside')
      .forEach((el) => el.remove());

    const textContent = bodyClone.textContent?.replace(/\s+/g, ' ').trim();

    if (
      !title ||
      title.trim().length === 0 ||
      !textContent ||
      textContent.trim().length === 0 ||
      !content ||
      content.trim().length === 0 ||
      !description ||
      description.trim().length === 0
    ) {
      return undefined;
    }

    const page: StructuredPage = {
      title,
      description,
      content,
      textContent,
      contentLength: textContent.length,
    };

    const htmlLang = document.documentElement.getAttribute('lang');
    if (htmlLang) {
      page.language = htmlLang;
    }

    const dir = document.documentElement.getAttribute('dir');
    if (dir) {
      page.direction = dir;
    }

    const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
    if (ogTitle && ogTitle !== page.title) {
      page.ogTitle = ogTitle;
    }

    const ogDescription = document.querySelector('meta[property="og:description"]')?.getAttribute('content');
    if (ogDescription) {
      page.ogDescription = ogDescription;
    }

    const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content');
    if (ogImage) {
      page.ogImage = ogImage;
    }

    const ogSiteName = document.querySelector('meta[property="og:site_name"]')?.getAttribute('content');
    if (ogSiteName) {
      page.siteName = ogSiteName;
    }

    const author = document.querySelector('meta[name="author"]')?.getAttribute('content');
    if (author) {
      page.author = author;
    }

    const keywords = document.querySelector('meta[name="keywords"]')?.getAttribute('content');
    if (keywords) {
      page.keywords = keywords
        .split(',')
        .map((k) => k.trim())
        .filter((k) => k);
    }

    const publishedTime = document.querySelector('meta[property="article:published_time"]')?.getAttribute('content');
    if (publishedTime) {
      page.publishedTime = publishedTime;
    }

    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
      .map((h) => h.textContent?.trim())
      .filter((h): h is string => !!h && h.length > 0);

    if (headings.length > 0) {
      page.headings = headings;
    }

    // Extract links if enabled
    if (options?.extractLinks !== false) {
      // Extract internal links
      const links = Array.from(document.querySelectorAll('a[href]'))
        .map((a) => a.getAttribute('href'))
        .filter((href): href is string => {
          if (!href) return false;
          return href.startsWith('/') && !href.startsWith('/_next') && !href.startsWith('/_');
        });

      if (links.length > 0) {
        page.internalLinks = Array.from(new Set(links));
      }

      // Extract external links
      const externalLinks = Array.from(document.querySelectorAll('a[href]'))
        .map((a) => a.getAttribute('href'))
        .filter((href): href is string => {
          if (!href) return false;
          return href.startsWith('http://') || href.startsWith('https://');
        });

      if (externalLinks.length > 0) {
        page.externalLinks = Array.from(new Set(externalLinks));
      }
    }

    // Extract images if enabled
    if (options?.extractImages !== false) {
      const images = Array.from(document.querySelectorAll('img[src], img[data-nimg], img[data-src]'))
        .map((img) => {
          const src = img.getAttribute('src') || img.getAttribute('data-src') || img.getAttribute('data-nimg');
          const alt = img.getAttribute('alt');
          return { src, alt };
        })
        .filter((img) => img.src && !img.src.startsWith('data:'));

      if (images.length > 0) {
        page.images = images.map((img) => img.src || '').filter((src) => src);
        page.imageAlts = images.map((img) => img.alt || '');
      }
    }

    return page;
  }
}
