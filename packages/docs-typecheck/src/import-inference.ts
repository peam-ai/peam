import ts from 'typescript';
import type { CodeSample, ProcessedCodeSample } from './types.js';

interface ImportMapping {
  module: string;
  isType?: boolean;
  /** If set, import this name and alias it to the symbol name */
  importAs?: string;
}

/**
 * Mapping of known symbols to their source modules
 */
const SYMBOL_IMPORTS: Record<string, ImportMapping> = {
  // From 'peam/client'
  AskAI: { module: 'peam/client' },
  AskAIDialog: { module: 'peam/client' },
  AskAISidepane: { module: 'peam/client' },
  AskAIChat: { module: 'peam/client' },

  // Types from 'peam/client'
  AskAIBaseProps: { module: 'peam/client', isType: true },

  // From 'peam/server'
  createHandler: { module: 'peam/server' },

  // Types from 'peam/server'
  CreateHandlerOptions: { module: 'peam/server', isType: true },

  // From '@peam-ai/next'
  withPeam: { module: '@peam-ai/next' },

  // Types from '@peam-ai/next'
  PeamConfig: { module: '@peam-ai/next', isType: true },
  SearchExporterConfig: { module: '@peam-ai/next', isType: true },

  // AI SDK exports
  openai: { module: '@ai-sdk/openai' },
  anthropic: { module: '@ai-sdk/anthropic' },
  google: { module: '@ai-sdk/google' },
  createOpenAI: { module: '@ai-sdk/openai' },
  streamText: { module: 'ai' },
  generateText: { module: 'ai' },
  tool: { module: 'ai' },

  // Types from AI SDK
  LanguageModelV1: { module: 'ai', isType: true },
};

/**
 * Finds all identifiers used in the source code
 */
function findUsedIdentifiers(sourceCode: string): Set<string> {
  const identifiers = new Set<string>();

  try {
    const sourceFile = ts.createSourceFile('sample.ts', sourceCode, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

    function visit(node: ts.Node) {
      if (ts.isIdentifier(node)) {
        identifiers.add(node.text);
      }
      ts.forEachChild(node, visit);
    }

    visit(sourceFile);
  } catch {
    // If parsing fails, fall back to regex-based extraction
    const identifierRegex = /\b([A-Za-z_$][A-Za-z0-9_$]*)\b/g;
    let match;
    while ((match = identifierRegex.exec(sourceCode)) !== null) {
      identifiers.add(match[1]);
    }
  }

  return identifiers;
}

/**
 * Finds identifiers that are declared locally in the source
 */
function findLocalDeclarations(sourceCode: string): Set<string> {
  const declarations = new Set<string>();

  try {
    const sourceFile = ts.createSourceFile('sample.ts', sourceCode, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

    function visit(node: ts.Node) {
      // Variable declarations
      if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
        declarations.add(node.name.text);
      }
      // Function declarations
      if (ts.isFunctionDeclaration(node) && node.name) {
        declarations.add(node.name.text);
      }
      // Class declarations
      if (ts.isClassDeclaration(node) && node.name) {
        declarations.add(node.name.text);
      }
      // Interface declarations
      if (ts.isInterfaceDeclaration(node)) {
        declarations.add(node.name.text);
      }
      // Type alias declarations
      if (ts.isTypeAliasDeclaration(node)) {
        declarations.add(node.name.text);
      }
      // Enum declarations
      if (ts.isEnumDeclaration(node)) {
        declarations.add(node.name.text);
      }
      // Parameters
      if (ts.isParameter(node) && ts.isIdentifier(node.name)) {
        declarations.add(node.name.text);
      }

      ts.forEachChild(node, visit);
    }

    visit(sourceFile);
  } catch {
    // Parsing failed, return empty set
  }

  return declarations;
}

/**
 * Extracts existing imports from the source code
 */
function findExistingImports(sourceCode: string): Set<string> {
  const imported = new Set<string>();

  try {
    const sourceFile = ts.createSourceFile('sample.ts', sourceCode, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

    for (const statement of sourceFile.statements) {
      if (ts.isImportDeclaration(statement)) {
        const clause = statement.importClause;
        if (clause) {
          // Default import
          if (clause.name) {
            imported.add(clause.name.text);
          }
          // Named imports
          if (clause.namedBindings) {
            if (ts.isNamedImports(clause.namedBindings)) {
              for (const element of clause.namedBindings.elements) {
                imported.add(element.name.text);
              }
            } else if (ts.isNamespaceImport(clause.namedBindings)) {
              imported.add(clause.namedBindings.name.text);
            }
          }
        }
      }
    }
  } catch {
    // Parsing failed, return empty set
  }

  return imported;
}

/**
 * Generates import statements for missing symbols
 */
function generateImports(missingSymbols: Map<string, ImportMapping>): string[] {
  const imports: string[] = [];

  // Group by module
  const byModule = new Map<
    string,
    { values: Set<string>; types: Set<string>; aliases: Array<{ from: string; to: string }> }
  >();

  for (const [symbol, mapping] of missingSymbols) {
    if (!byModule.has(mapping.module)) {
      byModule.set(mapping.module, { values: new Set(), types: new Set(), aliases: [] });
    }

    const group = byModule.get(mapping.module)!;

    if (mapping.importAs) {
      group.aliases.push({ from: mapping.importAs, to: symbol });
    } else if (mapping.isType) {
      group.types.add(symbol);
    } else {
      group.values.add(symbol);
    }
  }

  // Generate import statements
  for (const [module, { values, types, aliases }] of byModule) {
    const allSymbols: string[] = [];

    // Add value imports
    allSymbols.push(...values);

    // Add aliased imports
    for (const { from, to } of aliases) {
      allSymbols.push(`${from} as ${to}`);
    }

    // Add type imports with 'type' prefix
    for (const t of Array.from(types).sort()) {
      allSymbols.push(`type ${t}`);
    }

    if (allSymbols.length > 0) {
      imports.push(`import { ${allSymbols.join(', ')} } from '${module}';`);
    }
  }

  return imports.sort();
}

/**
 * Processes a code sample to add inferred imports
 */
export function addInferredImports(sample: CodeSample): ProcessedCodeSample {
  const usedIdentifiers = findUsedIdentifiers(sample.source);
  const localDeclarations = findLocalDeclarations(sample.source);
  const existingImports = findExistingImports(sample.source);

  const missingSymbols = new Map<string, ImportMapping>();

  for (const identifier of usedIdentifiers) {
    // Skip if already imported
    if (existingImports.has(identifier)) {
      continue;
    }

    // Skip if declared locally
    if (localDeclarations.has(identifier)) {
      continue;
    }

    // Skip built-ins and keywords
    if (isBuiltinOrKeyword(identifier)) {
      continue;
    }

    // Check if it's a known symbol
    const mapping = SYMBOL_IMPORTS[identifier];
    if (mapping) {
      missingSymbols.set(identifier, mapping);
    }
  }

  const addedImports = generateImports(missingSymbols);
  const processedSource = addedImports.length > 0 ? `${addedImports.join('\n')}\n\n${sample.source}` : sample.source;

  return {
    ...sample,
    processedSource,
    addedImports,
  };
}

/**
 * Checks if an identifier is a built-in or keyword
 */
function isBuiltinOrKeyword(identifier: string): boolean {
  const builtins = new Set([
    // JavaScript keywords
    'const',
    'let',
    'var',
    'function',
    'class',
    'if',
    'else',
    'for',
    'while',
    'do',
    'switch',
    'case',
    'break',
    'continue',
    'return',
    'try',
    'catch',
    'finally',
    'throw',
    'async',
    'await',
    'import',
    'export',
    'default',
    'from',
    'as',
    'new',
    'this',
    'super',
    'extends',
    'implements',
    'interface',
    'type',
    'enum',
    'namespace',
    'module',
    'declare',
    'public',
    'private',
    'protected',
    'static',
    'readonly',
    'abstract',
    // Global objects
    'console',
    'window',
    'document',
    'globalThis',
    'JSON',
    'Math',
    'Date',
    'Array',
    'Object',
    'String',
    'Number',
    'Boolean',
    'Symbol',
    'Map',
    'Set',
    'Promise',
    'Error',
    'RegExp',
    'Function',
    // Common globals
    'setTimeout',
    'setInterval',
    'clearTimeout',
    'clearInterval',
    'fetch',
    'Response',
    'Request',
    'Headers',
    'URL',
    'URLSearchParams',
    // Literals
    'true',
    'false',
    'null',
    'undefined',
    'NaN',
    'Infinity',
    // TypeScript
    'any',
    'unknown',
    'never',
    'void',
    'string',
    'number',
    'boolean',
    'bigint',
    'symbol',
    'object',
  ]);

  return builtins.has(identifier);
}
