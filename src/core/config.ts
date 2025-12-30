import type { PreviewOptions, QueueConfig, UploaderConfig } from '../types'

/**
 * Default preview options
 */
export const DEFAULT_PREVIEW_OPTIONS: Required<PreviewOptions> = {
  maxWidth: 200,
  maxHeight: 200,
  quality: 0.8,
  type: 'image/jpeg',
}

/**
 * Default uploader configuration
 */
export const DEFAULT_UPLOADER_CONFIG: Partial<UploaderConfig> = {
  method: 'POST',
  fieldName: 'file',
  withCredentials: false,
  timeout: 0,

  chunked: false,
  chunkSize: 1024 * 1024, // 1MB
  parallelChunks: 1,
  retryChunks: 3,

  autoUpload: false,
  sequential: false,
  generatePreview: false,

  previewOptions: DEFAULT_PREVIEW_OPTIONS,
}

/**
 * Default queue configuration
 */
export const DEFAULT_QUEUE_CONFIG: Partial<QueueConfig> = {
  ...DEFAULT_UPLOADER_CONFIG,
  concurrent: 3,
  autoStart: false,
  retries: 3,
  retryDelay: 1000,
}

/**
 * Merge user config with defaults
 */
export function mergeConfig<T extends UploaderConfig>(
  userConfig: Partial<T>,
  defaults: Partial<T> = DEFAULT_UPLOADER_CONFIG as Partial<T>
): T {
  const merged = { ...defaults, ...userConfig } as T

  // Deep merge preview options
  if (userConfig.previewOptions || defaults.previewOptions) {
    merged.previewOptions = {
      ...DEFAULT_PREVIEW_OPTIONS,
      ...defaults.previewOptions,
      ...userConfig.previewOptions,
    }
  }

  return merged
}

/**
 * Validate configuration
 */
export function validateConfig(config: UploaderConfig): void {
  if (!config.endpoint) {
    throw new Error('endpoint is required')
  }

  if (config.maxFileSize !== undefined && config.maxFileSize <= 0) {
    throw new Error('maxFileSize must be positive')
  }

  if (config.minFileSize !== undefined && config.minFileSize < 0) {
    throw new Error('minFileSize cannot be negative')
  }

  if (
    config.maxFileSize !== undefined &&
    config.minFileSize !== undefined &&
    config.maxFileSize < config.minFileSize
  ) {
    throw new Error('maxFileSize must be greater than or equal to minFileSize')
  }

  if (config.maxFiles !== undefined && config.maxFiles <= 0) {
    throw new Error('maxFiles must be positive')
  }

  if (config.chunkSize !== undefined && config.chunkSize <= 0) {
    throw new Error('chunkSize must be positive')
  }

  if (config.parallelChunks !== undefined && config.parallelChunks <= 0) {
    throw new Error('parallelChunks must be positive')
  }

  if (config.timeout !== undefined && config.timeout < 0) {
    throw new Error('timeout cannot be negative')
  }
}
