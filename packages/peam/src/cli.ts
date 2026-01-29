/**
 * Peam CLI
 */

import { createBuilderFromConfig } from '@peam-ai/builder';
import { createStoreFromConfig, type SearchIndexData } from '@peam-ai/search';
import chalk from 'chalk';
import { readFileSync } from 'fs';
import { join } from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { z } from 'zod';
import { SearchBuilderConfigSchema as BuilderSchema } from './generated/builder-config.zod';
import { FileBasedSearchIndexBuilderOptionsSchema } from './generated/builder-fileBased.zod';
import { SearchStoreConfigSchema as StoreSchema } from './generated/store-config.zod';
import { FileBasedSearchIndexStoreOptionsSchema } from './generated/store-fileBased.zod';

const packageJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8'));

// ============================================================================
// CLI SCHEMAS
// ============================================================================

const CliSchema = z.object({
  builders: z
    .array(BuilderSchema)
    .min(1, 'At least one builder is required')
    .default([
      {
        type: 'fileBased',
        config: FileBasedSearchIndexBuilderOptionsSchema.parse({}),
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
  projectDir: z.string().default(process.cwd()),
});

// ============================================================================
// SCHEMA REGISTRY & METADATA EXTRACTION
// ============================================================================

const BUILDER_SCHEMAS = Object.fromEntries(
  BuilderSchema.options.map((option) => {
    const typeLiteral = option.shape.type as z.ZodLiteral<string>;
    const configSchema = option.shape.config;
    return [typeLiteral.value, configSchema];
  })
);

const STORE_SCHEMAS = {
  [(StoreSchema.shape.type as z.ZodLiteral<string>).value]: StoreSchema.shape.config,
};

const DEFAULT_BUILDER_TYPE = CliSchema.parse({}).builders[0]?.type;
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
  logger.text('  1. ' + logger.cyan('Builders') + ' discover and parse content');
  logger.text('  2. ' + logger.cyan('Stores') + ' save the generated index');
  logger.text('');
  logger.text(logger.bold('Available builders:'));
  Object.entries(BUILDER_SCHEMAS).forEach(([type]) => {
    logger.text(`  ${logger.cyan(type)}`);
  });
  logger.text('');
  logger.text(logger.bold('Available stores:'));
  Object.entries(STORE_SCHEMAS).forEach(([type]) => {
    logger.text(`  ${logger.cyan(type)}`);
  });
  logger.text('');
  logger.text(logger.bold('Learn more:'));
  logger.text(`  ${logger.cyan('peam --help builders')}   Show builder details`);
  logger.text(`  ${logger.cyan('peam --help stores')}     Show store details`);
  logger.text('');
}

function showComponentHelp(title: string, schemas: Record<string, z.ZodObject<z.ZodRawShape>>): void {
  logger.text('');
  logger.text(logger.bold(logger.cyan(title)));
  logger.text('');
  Object.entries(schemas).forEach(([type, schema]) => {
    const meta = getSchemaMetadata(schema);
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

function parseComponents(args: string[]): { builders: unknown[]; stores: unknown[] } {
  const builders: unknown[] = [];
  const stores: unknown[] = [];
  let current: { type: string; config: Record<string, unknown> } | null = null;

  const parseValue = (value: string): unknown => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (!isNaN(Number(value))) return Number(value);
    return value;
  };

  const startComponent = (
    type: string | undefined,
    schemas: Record<string, z.ZodObject<z.ZodRawShape>>,
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
      case '--builder':
        if (args[i + 1] && !args[i + 1].startsWith('--')) {
          const nextType = args[i + 1];
          if (!(nextType in BUILDER_SCHEMAS)) {
            logger.error(`Unknown ${arg}: ${nextType}`);
            logger.text(logger.yellow(`Available: ${Object.keys(BUILDER_SCHEMAS).join(', ')}`));
            process.exit(1);
          }
          startComponent(nextType, BUILDER_SCHEMAS, builders, arg);
          i++;
        } else {
          startComponent(DEFAULT_BUILDER_TYPE, BUILDER_SCHEMAS, builders, arg);
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
          logger.error(`${arg} must come after --builder or --store`);
          process.exit(1);
        }
        const target = current as { type: string; config: Record<string, unknown> };
        target.config[arg.slice(2)] = parseValue(args[++i]);
        break;
      }
    }
  }

  return { builders, stores };
}

// ============================================================================
// EXECUTION
// ============================================================================

async function runPipeline(cli: z.infer<typeof CliSchema>): Promise<void> {
  logger.text('');
  logger.text(logger.bold(logger.cyan('Peam CLI')));
  logger.text('');

  const allIndexData = [];

  for (const [i, builder] of cli.builders.entries()) {
    const typedBuilder = builder;
    logger.text(logger.bold(`Builder ${i + 1}/${cli.builders.length}: ${typedBuilder.type}`));
    logger.text(`  ${logger.gray(JSON.stringify(typedBuilder, null, 2))}`);
    logger.text('');

    const instance = createBuilderFromConfig(typedBuilder);

    const data = await instance.build();

    if (!data) {
      logger.warn(`No data from builder ${i + 1}`);
      continue;
    }

    logger.success(`Indexed ${logger.bold(String(pageCount(data)))} pages`);
    logger.text('');
    allIndexData.push(data);
  }

  if (allIndexData.length === 0) {
    logger.error('No data generated');
    process.exit(1);
  }

  const merged = allIndexData[0]; // TODO: merge strategy

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
    if (next === 'builders') return showComponentHelp('Builders', BUILDER_SCHEMAS);
    if (next === 'stores') return showComponentHelp('Stores', STORE_SCHEMAS);
    return showTopLevelHelp();
  }

  if (args.includes('--version') || args.includes('-v')) {
    return logger.text(packageJson.version);
  }

  try {
    const { builders, stores } = parseComponents(args);

    const config = CliSchema.parse({
      builders: builders.length > 0 ? builders : undefined,
      stores: stores.length > 0 ? stores : undefined,
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
