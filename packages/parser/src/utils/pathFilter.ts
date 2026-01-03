import { matchesExcludePattern } from './excludePatterns';
import type { RobotsParser } from './robotsParser';
import { isPathAllowedByRobots } from './robotsParser';

export type PathFilterReason =
  | 'included'
  | 'dynamic-route'
  | 'internal-route'
  | 'rsc-file'
  | 'segment-file'
  | 'static-asset'
  | 'robots-txt'
  | 'exclude-pattern';

export interface PathFilterResult {
  included: boolean;
  reason: PathFilterReason;
}

/**
 * Determines if a pathname should be included in the index
 * Returns both the decision and the reason for exclusion
 */
export function shouldIncludePath(
  pathname: string,
  robots: RobotsParser | null,
  excludePatterns: string[],
  respectRobotsTxt: boolean
): PathFilterResult {
  // Exclude routes with dynamic parameters (e.g., /session/[session_id])
  if (pathname.includes('[') && pathname.includes(']')) {
    return { included: false, reason: 'dynamic-route' };
  }

  // Exclude Next.js internal routes
  if (pathname.startsWith('/_not-found') || pathname.startsWith('/_global-error')) {
    return { included: false, reason: 'internal-route' };
  }

  // Exclude RSC files
  if (pathname.endsWith('.rsc')) {
    return { included: false, reason: 'rsc-file' };
  }

  // Exclude segment files
  if (pathname.includes('.segments/')) {
    return { included: false, reason: 'segment-file' };
  }

  // Exclude static assets
  if (pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|txt|xml|json|css|js|woff|woff2|ttf|eot)$/i)) {
    return { included: false, reason: 'static-asset' };
  }

  // Check robots.txt rules
  if (respectRobotsTxt && !isPathAllowedByRobots(pathname, robots)) {
    return { included: false, reason: 'robots-txt' };
  }

  // Check user-defined exclude patterns
  if (matchesExcludePattern(pathname, excludePatterns)) {
    return { included: false, reason: 'exclude-pattern' };
  }

  return { included: true, reason: 'included' };
}
