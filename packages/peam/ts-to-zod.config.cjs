/**
 * ts-to-zod configuration.
 *
 * @type {import("ts-to-zod").TsToZodConfig}
 */
module.exports = [
  {
    name: "source-fileBased",
    input: "../builder/src/sources/FileBasedSearchIndexSource.ts",
    output: "src/generated/source-fileBased.zod.ts",
    nameFilter: (name) => name === "FileBasedSearchIndexSourceOptions",
    getSchemaName: (id) => `${id}Schema`,
  },
  {
    name: "source-prerender",
    input: "../builder/src/sources/PrerenderSearchIndexSource.ts",
    output: "src/generated/source-prerender.zod.ts",
    nameFilter: (name) => ["PrerenderSearchIndexSourceOptions", "PrerenderPage"].includes(name),
    getSchemaName: (id) => `${id}Schema`,
  },
  {
    name: "source-config",
    input: "../builder/src/sources/config.ts",
    output: "src/generated/source-config.zod.ts",
    getSchemaName: (id) => `${id}Schema`,
    skipValidation: true,
  },
  {
    name: "store-fileBased",
    input: "../search/src/stores/FileBasedSearchIndexStore.ts",
    output: "src/generated/store-fileBased.zod.ts",
    nameFilter: (name) => name === "FileBasedSearchIndexStoreOptions",
    getSchemaName: (id) => `${id}Schema`,
  },
  {
    name: "store-config",
    input: "../search/src/stores/config.ts",
    output: "src/generated/store-config.zod.ts",
    getSchemaName: (id) => `${id}Schema`,
    skipValidation: true,
  },
];

