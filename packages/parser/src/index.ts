export { ParseOptions } from './parsers/parser';
export { StructuredPage } from './structuredPage';

export { matchesExcludePattern } from './utils/excludePatterns';
export { shouldIncludePath, type PathFilterReason, type PathFilterResult } from './utils/pathFilter';
export { filePathToPathname } from './utils/pathUtils';
export {
  createRobotsParser,
  isPathAllowedByRobots,
  loadRobotsTxt,
  type RobotsParser,
  type RobotsTxtResult,
} from './utils/robotsParser';

export { parseHTML } from './parseHtml';
