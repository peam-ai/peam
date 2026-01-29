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
    name: "exporter-fileBased",
    input: "../search/src/exporters/FileBasedSearchIndexExporter.ts",
    output: "src/generated/exporter-fileBased.zod.ts",
    nameFilter: (name) => name === "FileBasedSearchIndexExporterOptions",
    getSchemaName: (id) => `${id}Schema`,
  },
  {
    name: "exporter-config",
    input: "../search/src/exporters/config.ts",
    output: "src/generated/exporter-config.zod.ts",
    getSchemaName: (id) => `${id}Schema`,
    skipValidation: true,
  },
];

