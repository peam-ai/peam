/**
 * Peam CLI
 */

import { SearchIndexBuilder } from '@peam-ai/builder';
import { createStoreFromConfig, type SearchIndexData } from '@peam-ai/search';
import chalk from 'chalk';
import { readFileSync } from 'fs';
import { join } from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { z } from 'zod';
import { SearchIndexSourceConfigSchema as SourceSchema } from './generated/source-config.zod';
import { FileBasedSearchIndexSourceOptionsSchema } from './generated/source-fileBased.zod';
import { SearchStoreConfigSchema as StoreSchema } from './generated/store-config.zod';
import { FileBasedSearchIndexStoreOptionsSchema } from './generated/store-fileBased.zod';

const packageJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8'));

// ============================================================================
// CLI SCHEMAS
// ============================================================================

const CliSchema = z.object({
  sources: z
    .array(SourceSchema)
    .min(1, 'At least one source is required')
    .default([
      {
        type: 'fileBased',
        config: FileBasedSearchIndexSourceOptionsSchema.parse({}),
      },
    ]),
  stores: z
    .array(StoreSchema)
    .min(1, 'At least one store is required')
    .default([
      {
        type: 'fileBased',
        config: FileBasedSearchIndexStoreOptionsSchema.parse({}),
      },
    ]),
  exclude: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .default([]),
  robotsTxt: z.union([z.string(), z.boolean()]).optional(),
  projectDir: z.string().default(process.cwd()),
});

// ============================================================================
// SCHEMA REGISTRY & METADATA EXTRACTION
// ============================================================================

const SOURCE_SCHEMAS: Record<string, z.ZodTypeAny> = Object.fromEntries(
  SourceSchema.options.map((option: z.ZodObject<z.ZodRawShape>) => {
    const typeLiteral = option.shape.type as z.ZodLiteral<string>;
    const configSchema = option.shape.config as z.ZodTypeAny;
    return [typeLiteral.value, configSchema];
  })
);

const STORE_SCHEMAS: Record<string, z.ZodTypeAny> = {
  [(StoreSchema.shape.type as z.ZodLiteral<string>).value]: StoreSchema.shape.config as z.ZodTypeAny,
};

const DEFAULT_SOURCE_TYPE = CliSchema.parse({}).sources[0]?.type;
const DEFAULT_STORE_TYPE = CliSchema.parse({}).stores[0]?.type;

interface SchemaMetadata {
  description: string;
  options: Record<string, { description: string; required: boolean; default?: unknown }>;
}

function resolveSchemaDescription(schema: z.ZodTypeAny): string {
  if (schema.description) return schema.description;

  if ('unwrap' in schema && typeof schema.unwrap === 'function') {
    const inner = schema.unwrap();
    return resolveSchemaDescription(inner);
  }

  return '';
}

function getSchemaMetadata(schema: z.ZodObject<z.ZodRawShape>): SchemaMetadata {
  const description = schema.description || '';
  const shape = schema.shape;
  const options: Record<string, { description: string; required: boolean; default?: unknown }> = {};

  for (const [key, value] of Object.entries(shape)) {
    if (key === 'type') continue; // Skip the discriminator field

    const zodType = value as z.ZodTypeAny;
    const desc = resolveSchemaDescription(zodType);

    const testResult = zodType.safeParse(undefined);
    const isOptional = testResult.success;

    let defaultValue: unknown = undefined;
    if (testResult.success && testResult.data !== undefined) {
      defaultValue = testResult.data;
    }

    options[key] = {
      description: desc,
      required: !isOptional && defaultValue === undefined,
      ...(defaultValue !== undefined && { default: defaultValue }),
    };
  }

  return { description, options };
}

// ============================================================================
// LOGGING
// ============================================================================

const logger = {
  success: (msg: string) => console.log(chalk.green('✓ ') + msg),
  error: (msg: string) => console.error(chalk.red('✗ ') + msg),
  warn: (msg: string) => console.warn(chalk.yellow('⚠ ') + msg),
  info: (msg: string) => console.log(chalk.blue('ℹ ') + msg),
  text: (msg: string) => console.log(msg),
  cyan: (text: string) => chalk.cyan(text),
  gray: (text: string) => chalk.gray(text),
  bold: (text: string) => chalk.bold(text),
  yellow: (text: string) => chalk.yellow(text),
};

const PEAM_DOCUMENT_IDS_KEY = 'peam.documentIds';

const pageCount = (data: SearchIndexData): number => {
  const raw = data.data?.[PEAM_DOCUMENT_IDS_KEY];
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.length;
    } catch {
      // fall back below
    }
  }
  if (Array.isArray(raw)) return raw.length;
  return data.keys.length;
};

// ============================================================================
// HELP RENDERING
// ============================================================================

function showTopLevelHelp(): void {
  logger.text('');
  logger.text(logger.bold(logger.cyan('Peam Static Site Indexer')));
  logger.text('');
  logger.text('Build search indexes from your content and export them to various destinations.');
  logger.text('');
  logger.text(logger.bold('How it works:'));
  logger.text('  1. ' + logger.cyan('Sources') + ' discover and parse content');
  logger.text('  2. ' + logger.cyan('Stores') + ' save the generated index');
  logger.text('');
  logger.text(logger.bold('Available sources:'));
  Object.entries(SOURCE_SCHEMAS).forEach(([type]) => {
    logger.text(`  ${logger.cyan(type)}`);
  });
  logger.text('');
  logger.text(logger.bold('Available stores:'));
  Object.entries(STORE_SCHEMAS).forEach(([type]) => {
    logger.text(`  ${logger.cyan(type)}`);
  });
  logger.text('');
  logger.text(logger.bold('Learn more:'));
  logger.text(`  ${logger.cyan('peam --help sources')}   Show source details`);
  logger.text(`  ${logger.cyan('peam --help stores')}     Show store details`);
  logger.text('');
}

function showComponentHelp(title: string, schemas: Record<string, z.ZodTypeAny>): void {
  logger.text('');
  logger.text(logger.bold(logger.cyan(title)));
  logger.text('');
  Object.entries(schemas).forEach(([type, schema]) => {
    const meta = getSchemaMetadata(schema as z.ZodObject<z.ZodRawShape>);
    logger.text(logger.bold(logger.cyan(type)));
    logger.text(`  ${meta.description}`);
    logger.text('');
    logger.text('  Options:');
    Object.entries(meta.options).forEach(([name, opt]) => {
      const req = opt.required ? logger.yellow(' (required)') : '';
      const def = 'default' in opt ? logger.gray(` [${JSON.stringify(opt.default)}]`) : '';
      logger.text(`    --${name}${req}${def}`);
      logger.text(`      ${logger.gray(opt.description)}`);
    });
    logger.text('');
  });
}

// ============================================================================
// PARSING HELPERS
// ============================================================================

function parseComponents(args: string[]): {
  sources: unknown[];
  stores: unknown[];
  filterOptions: { exclude: string[]; robotsTxt?: string | boolean };
} {
  const sources: unknown[] = [];
  const stores: unknown[] = [];
  const filterOptions: { exclude: string[]; robotsTxt?: string | boolean } = {
    exclude: [],
  };
  let current: { type: string; config: Record<string, unknown> } | null = null;

  const parseValue = (value: string): unknown => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (!isNaN(Number(value))) return Number(value);
    return value;
  };

  const startComponent = (
    type: string | undefined,
    schemas: Record<string, z.ZodTypeAny>,
    target: unknown[],
    label: string
  ) => {
    if (!type || !(type in schemas)) {
      logger.error(`Unknown ${label}: ${type}`);
      logger.text(logger.yellow(`Available: ${Object.keys(schemas).join(', ')}`));
      process.exit(1);
    }
    current = { type, config: {} };
    target.push(current);
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--exclude': {
        filterOptions.exclude.push(String(args[++i] ?? ''));
        break;
      }
      case '--robotsTxt': {
        filterOptions.robotsTxt = parseValue(args[++i]) as string | boolean;
        break;
      }
      case '--source':
        if (args[i + 1] && !args[i + 1].startsWith('--')) {
          const nextType = args[i + 1];
          if (!(nextType in SOURCE_SCHEMAS)) {
            logger.error(`Unknown ${arg}: ${nextType}`);
            logger.text(logger.yellow(`Available: ${Object.keys(SOURCE_SCHEMAS).join(', ')}`));
            process.exit(1);
          }
          startComponent(nextType, SOURCE_SCHEMAS, sources, arg);
          i++;
        } else {
          startComponent(DEFAULT_SOURCE_TYPE, SOURCE_SCHEMAS, sources, arg);
        }
        break;
      case '--store':
        if (args[i + 1] && !args[i + 1].startsWith('--')) {
          const nextType = args[i + 1];
          if (!(nextType in STORE_SCHEMAS)) {
            logger.error(`Unknown ${arg}: ${nextType}`);
            logger.text(logger.yellow(`Available: ${Object.keys(STORE_SCHEMAS).join(', ')}`));
            process.exit(1);
          }
          startComponent(nextType, STORE_SCHEMAS, stores, arg);
          i++;
        } else {
          startComponent(DEFAULT_STORE_TYPE, STORE_SCHEMAS, stores, arg);
        }
        break;
      default: {
        if (!arg.startsWith('--')) break;
        if (!current) {
          logger.error(`${arg} must come after --source or --store`);
          process.exit(1);
        }
        const target = current as { type: string; config: Record<string, unknown> };
        target.config[arg.slice(2)] = parseValue(args[++i]);
        break;
      }
    }
  }

  return { sources, stores, filterOptions };
}

// ============================================================================
// EXECUTION
// ============================================================================

async function runPipeline(cli: z.infer<typeof CliSchema>): Promise<void> {
  logger.text('');
  logger.text(logger.bold(logger.cyan('Peam CLI')));
  logger.text('');

  for (const [i, source] of cli.sources.entries()) {
    const typedSource = source;
    logger.text(logger.bold(`Source ${i + 1}/${cli.sources.length}: ${typedSource.type}`));
    logger.text(`  ${logger.gray(JSON.stringify(typedSource, null, 2))}`);
    logger.text('');
  }

  const pipeline = SearchIndexBuilder.fromConfigs(cli.sources, {
    exclude: cli.exclude,
    robotsTxt: cli.robotsTxt,
  });
  const merged = await pipeline.build();

  if (!merged) {
    logger.error('No data generated');
    process.exit(1);
  }

  for (const [i, store] of cli.stores.entries()) {
    logger.text(logger.bold(`Store ${i + 1}/${cli.stores.length}: ${store.type}`));
    logger.text(`  ${logger.gray(JSON.stringify(store, null, 2))}`);
    logger.text('');

    const instance = createStoreFromConfig(store);
    await instance.export(merged);
  }

  logger.success(`Saved ${logger.bold(String(pageCount(merged)))} pages`);
  logger.text(`Size: ${logger.bold((Buffer.byteLength(JSON.stringify(merged), 'utf8') / 1024).toFixed(2))} KB`);

  logger.success(logger.bold('Pipeline complete!'));
  logger.text('');
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  yargs(hideBin(process.argv)).scriptName('peam').version(packageJson.version).help(false).parse();

  const args = process.argv.slice(2);

  // Custom help
  if (args.includes('--help') || args.includes('-h')) {
    const idx = args.indexOf('--help') >= 0 ? args.indexOf('--help') : args.indexOf('-h');
    const next = args[idx + 1];
    if (next === 'sources') return showComponentHelp('Sources', SOURCE_SCHEMAS);
    if (next === 'stores') return showComponentHelp('Stores', STORE_SCHEMAS);
    return showTopLevelHelp();
  }

  if (args.includes('--version') || args.includes('-v')) {
    return logger.text(packageJson.version);
  }

  try {
    const { sources, stores, filterOptions } = parseComponents(args);

    const config = CliSchema.parse({
      sources: sources.length > 0 ? sources : undefined,
      stores: stores.length > 0 ? stores : undefined,
      exclude: filterOptions.exclude.length > 0 ? filterOptions.exclude : undefined,
      robotsTxt: filterOptions.robotsTxt,
      projectDir: process.cwd(),
    });
    await runPipeline(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('Validation failed:');
      error.issues.forEach((err) => {
        logger.text(logger.yellow(`  ${err.path.join('.')}: ${err.message}`));
      });
    } else {
      logger.error(`Error: ${error}`);
    }
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export default main;
