/**
 * ts-to-zod configuration.
 *
 * @type {import("ts-to-zod").TsToZodConfig}
 */
module.exports = [
  {
    name: "builder-fileBased",
    input: "../builder/src/FileBasedSearchIndexBuilder.ts",
    output: "src/generated/builder-fileBased.zod.ts",
    nameFilter: (name) => name === "FileBasedSearchIndexBuilderOptions",
    getSchemaName: (id) => `${id}Schema`,
  },
  {
    name: "builder-prerender",
    input: "../builder/src/PrerenderSearchIndexBuilder.ts",
    output: "src/generated/builder-prerender.zod.ts",
    nameFilter: (name) => ["PrerenderSearchIndexBuilderOptions", "PrerenderPage"].includes(name),
    getSchemaName: (id) => `${id}Schema`,
  },
  {
    name: "builder-config",
    input: "../builder/src/config.ts",
    output: "src/generated/builder-config.zod.ts",
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

