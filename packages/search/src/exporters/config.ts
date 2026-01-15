import { FileBasedSearchIndexExporter, FileBasedSearchIndexExporterOptions } from './FileBasedSearchIndexExporter';
import { SearchIndexExporter } from './SearchIndexExporter';

export type SearchExporterConfig = {
  type: 'fileBased';
  config: FileBasedSearchIndexExporterOptions;
};

/**
 * Creates a SearchIndexExporter instance from a SearchExporterConfig
 */
export function createExporterFromConfig(exporterConfig: SearchExporterConfig): SearchIndexExporter {
  if (exporterConfig.type === 'fileBased') {
    return new FileBasedSearchIndexExporter({
      ...exporterConfig.config,
    });
  }

  throw new Error(`Unknown exporter type: ${exporterConfig.type}`);
}
