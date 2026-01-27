/**
 * Peam Static Site Indexer
 *
 * Scans a static site output directory, discovers HTML files,
 * parses them into structured pages, and creates a searchable index.
 */

import { createBuilderFromConfig, type SearchBuilderConfig } from '@peam-ai/builder';
import { createExporterFromConfig, type SearchExporterConfig } from '@peam-ai/search';
import chalk from 'chalk';
import { Command } from 'commander';
import { existsSync, readFileSync } from 'fs';
import { join, relative } from 'path';

const packageJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8'));

interface IndexerConfig {
  source: string;
  searchBuilder: SearchBuilderConfig;
  searchExporter: SearchExporterConfig;
  respectRobotsTxt: boolean;
  robotsTxtPath?: string;
  exclude: string[];
  glob: string;
  projectDir: string;
}

function parseExcludePatterns(value: string): string[] {
  return value
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
}

/**
 * Parse exporterConfig key=value pairs
 */
function parseExporterConfigEntry(value: string, previous: string[] = []): string[] {
  return [...previous, value];
}

/**
 * Parse builderConfig key=value pairs
 */
function parseBuilderConfigEntry(value: string, previous: string[] = []): string[] {
  return [...previous, value];
}

/**
 * Parse command line options and extract builder configuration dynamically.
 * Supports --builderConfig key=value pairs
 */
function parseBuilderConfig(
  options: Record<string, unknown>,
  builderType: string,
  sourceDir: string,
  glob: string,
  respectRobotsTxt: boolean,
  robotsTxtPath: string | undefined,
  exclude: string[],
  projectDir: string
): SearchBuilderConfig {
  const builderConfig: Record<string, unknown> = {
    sourceDir,
    glob,
    respectRobotsTxt,
    exclude,
    projectDir,
  };

  if (robotsTxtPath) {
    builderConfig.robotsTxtPath = robotsTxtPath;
  }

  // Parse key=value pairs from --builderConfig options
  if (Array.isArray(options.builderConfig)) {
    for (const entry of options.builderConfig) {
      if (typeof entry === 'string') {
        const [key, ...valueParts] = entry.split('=');
        const value = valueParts.join('=');
        if (key && value !== undefined) {
          builderConfig[key.trim()] = value.trim();
        }
      }
    }
  }

  return {
    type: builderType,
    config: builderConfig,
  } as unknown as SearchBuilderConfig;
}

/**
 * Parse command line options and extract exporter configuration dynamically.
 * Supports --exporterConfig key=value pairs
 */
function parseExporterConfig(options: Record<string, unknown>, exporterType: string): SearchExporterConfig {
  const exporterConfig: Record<string, unknown> = {};

  // Parse key=value pairs from --exporterConfig options
  if (Array.isArray(options.exporterConfig)) {
    for (const entry of options.exporterConfig) {
      if (typeof entry === 'string') {
        const [key, ...valueParts] = entry.split('=');
        const value = valueParts.join('=');
        if (key && value !== undefined) {
          exporterConfig[key.trim()] = value.trim();
        }
      }
    }
  }

  return {
    type: exporterType,
    config: exporterConfig,
  } as unknown as SearchExporterConfig;
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

async function indexPages(config: IndexerConfig): Promise<void> {
  log.text('\n' + log.bold(log.cyan('Peam Static Site Indexer')) + '\n');
  log.text(log.bold('Configuration:'));
  log.text(`  Project Directory: ${log.gray(config.projectDir)}`);
  log.text(`  Source Directory: ${log.gray(config.source)}`);
  log.text(`  Glob Pattern: ${log.gray(config.glob)}`);
  log.text(`  Exporter Type: ${log.gray(config.searchExporter.type)}`);
  log.text(`  Exporter Config: ${log.gray(JSON.stringify(config.searchExporter.config, null, 2))}`);
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

  log.text(log.bold('Building search index from HTML files...'));
  log.text('');

  // Use builder to create the search index
  const builder = createBuilderFromConfig(config.searchBuilder);
  const searchIndexData = await builder.build();

  if (!searchIndexData) {
    log.text('');
    log.warn('No search index data generated');
    log.text(log.yellow('   Check that your source directory contains HTML files'));
    log.text(log.yellow(`   Source: ${sourcePath}`));
    if (config.searchBuilder.type === 'fileBased') {
      log.text(log.yellow(`   Pattern: ${config.searchBuilder.config.glob}`));
    }
    process.exit(1);
  }

  log.text('');
  log.success(`Successfully indexed ${log.bold(searchIndexData.keys.length.toString())} pages`);
  log.text('');
  log.text(log.bold('Saving index...'));
  log.text('');

  const searchIndexExporter = createExporterFromConfig(config.searchExporter);
  await searchIndexExporter.export(searchIndexData);

  const indexPathDisplay =
    config.searchExporter.type === 'fileBased'
      ? relative(config.projectDir, join(config.projectDir, config.searchExporter.config.indexPath))
      : 'configured location';

  log.success(`Index saved to: ${log.cyan(indexPathDisplay)}`);
  log.text(`  Total pages indexed: ${log.bold(searchIndexData.keys.length.toString())}`);
  log.text(
    `  Index size: ${log.bold((Buffer.byteLength(JSON.stringify(searchIndexData), 'utf8') / 1024).toFixed(2))} KB`
  );
  log.text('');
  log.success(log.bold('Indexing complete!'));
  log.text('');
}

function probeSourceDirectory(projectDir: string): string | null {
  const commonDirs = ['.next', '.build', '.out', 'dist'];

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
    .option('--builder <type>', 'Search builder type', 'fileBased')
    .option('--builderConfig <key=value>', 'Builder config entry (repeatable)', parseBuilderConfigEntry, [])
    .option('--exporter <type>', 'Search exporter type', 'fileBased')
    .option('--exporterConfig <key=value>', 'Exporter config entry (repeatable)', parseExporterConfigEntry, [
      `baseDir=${process.cwd()}`,
      'indexPath=.peam/index.json',
    ])
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

  # Custom index path using file-based exporter
  $ peam --source dist --exporterConfig indexPath=.search/index.json

  # Multiple exporter config entries
  $ peam --exporterConfig indexPath=custom/index.json --exporterConfig baseDir=/tmp

  # Exclude patterns
  $ peam --exclude "/admin/**,/api/*,/private-*"

  # Custom builder configuration
  $ peam --builder fileBased --builderConfig glob=**/*.html

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

    const searchBuilder = parseBuilderConfig(
      options,
      options.builder,
      sourceDir,
      options.glob,
      !options.ignoreRobotsTxt,
      options.robotsPath,
      options.exclude,
      options.projectDir
    );

    const searchExporter = parseExporterConfig(options, options.exporter);

    const config: IndexerConfig = {
      source: sourceDir,
      glob: options.glob,
      searchBuilder,
      searchExporter,
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
