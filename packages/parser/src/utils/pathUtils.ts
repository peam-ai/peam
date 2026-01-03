import { sep } from 'path';

const artifactPrefixes = [
  'server/pages/',
  'server/app/',
  'static/chunks/app/',
  'static/chunks/pages/',
  'static/',
  'server/',
];

/**
 * Convert file path to URL pathname
 *
 * Examples:
 *   index.html -> /
 *   about.html -> /about
 *   about/index.html -> /about/
 *   blog/post-1.html -> /blog/post-1
 *   blog/post-1/index.html -> /blog/post-1/
 *   server/pages/contact.html -> /contact
 *   server/app/about.html -> /about
 */
export function filePathToPathname(filePath: string): string {
  let pathname = filePath.split(sep).join('/');

  for (const prefix of artifactPrefixes) {
    if (pathname.startsWith(prefix)) {
      pathname = pathname.substring(prefix.length);
      break;
    }
  }

  pathname = pathname.replace(/\.html?$/, '');

  if (pathname === 'index' || pathname === '') {
    return '/';
  }

  if (pathname.endsWith('/index')) {
    pathname = pathname.slice(0, -5);
  }

  if (!pathname.startsWith('/')) {
    pathname = '/' + pathname;
  }

  return pathname;
}
