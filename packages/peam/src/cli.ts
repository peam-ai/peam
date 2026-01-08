/**
 * Peam Static Site Indexer
 *
 * Scans a static site output directory, discovers HTML files,
 * parses them into structured pages, and creates a searchable index.
 */

import { filePathToPathname, loadRobotsTxt, parseHTML, shouldIncludePath, type StructuredPage } from '@peam-ai/parser';
import { buildSearchIndex } from '@peam-ai/search';
import chalk from 'chalk';
import { Command } from 'commander';
import fg from 'fast-glob';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join, relative } from 'path';

const packageJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8'));

interface IndexerConfig {
  source: string;
  outputDir: string;
  indexFilename: string;
  respectRobotsTxt: boolean;
  robotsTxtPath?: string;
  exclude: string[];
  glob: string;
  projectDir: string;
}

interface DiscoveredPage {
  pathname: string;
  htmlFilePath: string;
  relativeHtmlPath: string;
}

function parseExcludePatterns(value: string): string[] {
  return value
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
}

const log = {
  success: (message: string) => console.log(chalk.green('✓ ') + message),
  error: (message: string) => console.error(chalk.red('✗ ') + message),
  warn: (message: string) => console.warn(chalk.yellow('⚠ ') + message),
  info: (message: string) => console.log(chalk.blue('ℹ ') + message),
  text: (message: string) => console.log(message),

  cyan: (text: string) => chalk.cyan(text),
  gray: (text: string) => chalk.gray(text),
  bold: (text: string) => chalk.bold(text),
  yellow: (text: string) => chalk.yellow(text),
  red: (text: string) => chalk.red(text),
  green: (text: string) => chalk.green(text),
};

async function discoverHtmlFiles(
  sourceDir: string,
  globPattern: string,
  projectDir: string
): Promise<DiscoveredPage[]> {
  const pages: DiscoveredPage[] = [];

  try {
    const sourceFullPath = join(projectDir, sourceDir);

    const htmlFiles = await fg(globPattern, {
      cwd: sourceFullPath,
      absolute: true,
      onlyFiles: true,
      dot: false,
      ignore: ['**/_next/**', '**/_astro/**', '**/404.{html,htm}', '**/500.{html,htm}'],
    });

    for (const htmlFilePath of htmlFiles) {
      const relativePath = relative(sourceFullPath, htmlFilePath);
      const pathname = filePathToPathname(relativePath);

      pages.push({
        pathname,
        htmlFilePath,
        relativeHtmlPath: relativePath,
      });
    }
  } catch (error) {
    log.warn(`Error discovering HTML files: ${error}`);
  }

  return pages;
}

async function indexPages(config: IndexerConfig): Promise<void> {
  log.text('\n' + log.bold(log.cyan('Peam Static Site Indexer')) + '\n');
  log.text(log.bold('Configuration:'));
  log.text(`  Project Directory: ${log.gray(config.projectDir)}`);
  log.text(`  Source Directory: ${log.gray(config.source)}`);
  log.text(`  Glob Pattern: ${log.gray(config.glob)}`);
  log.text(`  Output Directory: ${log.gray(config.outputDir)}`);
  log.text(`  Index Filename: ${log.gray(config.indexFilename)}`);
  log.text(`  Respect robots.txt: ${log.gray(config.respectRobotsTxt.toString())}`);
  if (config.exclude.length > 0) {
    log.text(`  Exclude Patterns: ${log.gray(config.exclude.join(', '))}`);
  }
  log.text('');

  const sourcePath = join(config.projectDir, config.source);
  if (!existsSync(sourcePath)) {
    log.error(`Source directory not found: ${sourcePath}`);
    log.text(log.yellow('   Please build your site first or specify the correct --source directory'));
    process.exit(1);
  }

  const searchPaths = [join(config.source, 'robots.txt'), 'public/robots.txt', 'robots.txt'];

  const robotsResult = config.respectRobotsTxt
    ? loadRobotsTxt(config.projectDir, searchPaths, config.robotsTxtPath)
    : null;

  if (robotsResult && config.respectRobotsTxt) {
    log.info(`robots.txt loaded from ${log.cyan(relative(config.projectDir, robotsResult.path))}`);
  } else if (config.respectRobotsTxt) {
    log.info('No robots.txt found, all paths will be indexed');
  }

  log.text(log.bold('Discovering HTML files...'));
  log.text('');
  log.text(`  Scanning: ${log.gray(config.source)}`);
  log.text(`  Pattern: ${log.gray(config.glob)}`);
  log.text('');

  const discoveredPages = await discoverHtmlFiles(config.source, config.glob, config.projectDir);

  if (discoveredPages.length === 0) {
    log.text('');
    log.warn('No HTML files found');
    log.text(log.yellow('   Check that your source directory contains HTML files'));
    log.text(log.yellow(`   Source: ${sourcePath}`));
    log.text(log.yellow(`   Pattern: ${config.glob}`));
    process.exit(1);
  }

  const uniquePages = new Map<string, DiscoveredPage>();
  for (const page of discoveredPages) {
    if (!uniquePages.has(page.pathname)) {
      uniquePages.set(page.pathname, page);
    }
  }

  log.text('');
  log.success(`Found ${log.bold(uniquePages.size.toString())} unique pages`);
  log.text('');
  log.text(log.bold('Processing pages...'));
  log.text('');

  const processedPages: Array<{
    path: string;
    htmlFile: string;
    structuredPage: StructuredPage;
  }> = [];

  for (const [pathname, page] of uniquePages) {
    const result = shouldIncludePath(pathname, robotsResult?.parser ?? null, config.exclude, config.respectRobotsTxt);

    if (!result.included) {
      // Log the specific reason for exclusion
      if (result.reason === 'robots-txt') {
        log.error(`Excluded by robots.txt: ${pathname}`);
      } else if (result.reason === 'exclude-pattern') {
        log.error(`Excluded by pattern: ${pathname}`);
      }
      continue;
    }

    try {
      const html = readFileSync(page.htmlFilePath, 'utf-8');

      const structuredPage = parseHTML(html);

      if (!structuredPage) {
        log.warn(`No content extracted from ${log.gray(pathname)}`);
        continue;
      }

      log.success(`${log.cyan(pathname)}`);

      processedPages.push({
        path: pathname,
        htmlFile: page.relativeHtmlPath,
        structuredPage,
      });
    } catch (error) {
      log.error(`Error processing ${log.gray(pathname)}: ${error}`);
    }
  }

  log.text('');
  log.success(`Successfully processed ${log.bold(processedPages.length.toString())} pages`);
  log.text('');
  log.text(log.bold('Creating search index...'));
  log.text('');

  const searchIndexData = await buildSearchIndex(processedPages);

  log.success(`Added ${log.bold(processedPages.length.toString())} pages to search index`);
  log.text('');
  log.text(log.bold('Saving index...'));
  log.text('');

  const outputPath = join(config.projectDir, config.outputDir);
  mkdirSync(outputPath, { recursive: true });

  const searchIndexFile = join(outputPath, config.indexFilename);
  writeFileSync(searchIndexFile, JSON.stringify(searchIndexData));

  log.success(`Index saved to: ${log.cyan(relative(config.projectDir, searchIndexFile))}`);
  log.text(`  Total pages indexed: ${log.bold(processedPages.length.toString())}`);
  log.text(
    `  Index size: ${log.bold((Buffer.byteLength(JSON.stringify(searchIndexData), 'utf8') / 1024).toFixed(2))} KB`
  );
  log.text('');
  log.success(log.bold('Indexing complete!'));
  log.text('');
}

function probeSourceDirectory(projectDir: string): string | null {
  const commonDirs = ['.next', '.build', '.out'];

  for (const dir of commonDirs) {
    const fullPath = join(projectDir, dir);
    if (existsSync(fullPath)) {
      return dir;
    }
  }

  return null;
}

async function main() {
  const program = new Command();

  program
    .name('peam')
    .description('Peam static site indexer (Next.js, Hugo, etc.)')
    .version(packageJson.version)
    .option('--source <path>', 'Source directory containing HTML files (auto-detected if not provided)')
    .option('--glob <pattern>', 'Glob pattern for HTML files', '**/*.{html,htm}')
    .option('--output-dir <path>', 'Output directory for index', '.peam')
    .option('--index-filename <name>', 'Name of index file', 'index.json')
    .option('--ignore-robots-txt', 'Disable robots.txt checking')
    .option('--robots-path <path>', 'Custom path to robots.txt file')
    .option('--exclude <patterns>', 'Comma-separated exclude patterns', parseExcludePatterns, [])
    .option('--project-dir <path>', 'Project root directory', process.cwd())
    .addHelpText(
      'after',
      `
Examples:
  # Auto-detect build directory
  $ peam

  # Hugo
  $ peam --source public

  # Next.js
  $ peam --source .next

  # Custom output directory
  $ peam --source dist --glob "**/*.html"

  # Exclude patterns
  $ peam --exclude "/admin/**,/api/*,/private-*"

For Next.js 15+, the @peam-ai/next integration is recommended for production use.

More information: https://peam.ai
    `
    )
    .parse();

  const options = program.opts();

  try {
    let sourceDir = options.source;
    if (!sourceDir) {
      const probedDir = probeSourceDirectory(options.projectDir);
      if (probedDir) {
        sourceDir = probedDir;
        log.info(`Auto-detected source directory: ${log.cyan(probedDir)}`);
        log.text('');
      } else {
        log.error('No build output directory found');
        log.text(log.yellow('   Searched for: .next, .build, .out'));
        log.text(log.yellow('   Please build your site first or specify --source <directory>'));
        process.exit(1);
      }
    }

    const config: IndexerConfig = {
      source: sourceDir,
      glob: options.glob,
      outputDir: options.outputDir,
      indexFilename: options.indexFilename,
      respectRobotsTxt: !options.ignoreRobotsTxt,
      robotsTxtPath: options.robotsPath,
      exclude: options.exclude,
      projectDir: options.projectDir,
    };

    await indexPages(config);
  } catch (error) {
    log.text('');
    log.error(`Fatal error: ${error}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { indexPages, type IndexerConfig };
