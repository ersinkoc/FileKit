import { describe, it, expect } from 'vitest'
import {
  mergeConfig,
  validateConfig,
  DEFAULT_UPLOADER_CONFIG,
  DEFAULT_PREVIEW_OPTIONS,
} from '../../../src/core/config'
import type { UploaderConfig } from '../../../src/types'

describe('mergeConfig', () => {
  it('should merge user config with defaults', () => {
    const userConfig: Partial<UploaderConfig> = {
      endpoint: '/api/upload',
      maxFileSize: 5000,
    }

    const result = mergeConfig(userConfig)

    expect(result.endpoint).toBe('/api/upload')
    expect(result.maxFileSize).toBe(5000)
    expect(result.method).toBe(DEFAULT_UPLOADER_CONFIG.method)
    expect(result.fieldName).toBe(DEFAULT_UPLOADER_CONFIG.fieldName)
  })

  it('should deep merge preview options', () => {
    const userConfig: Partial<UploaderConfig> = {
      endpoint: '/api/upload',
      previewOptions: {
        maxWidth: 300,
      },
    }

    const result = mergeConfig(userConfig)

    expect(result.previewOptions?.maxWidth).toBe(300)
    expect(result.previewOptions?.maxHeight).toBe(DEFAULT_PREVIEW_OPTIONS.maxHeight)
    expect(result.previewOptions?.quality).toBe(DEFAULT_PREVIEW_OPTIONS.quality)
  })

  it('should preserve all user-specified values', () => {
    const userConfig: Partial<UploaderConfig> = {
      endpoint: '/api/upload',
      method: 'PUT',
      fieldName: 'document',
      withCredentials: true,
      timeout: 30000,
      chunked: true,
      chunkSize: 2048,
    }

    const result = mergeConfig(userConfig)

    expect(result.method).toBe('PUT')
    expect(result.fieldName).toBe('document')
    expect(result.withCredentials).toBe(true)
    expect(result.timeout).toBe(30000)
    expect(result.chunked).toBe(true)
    expect(result.chunkSize).toBe(2048)
  })
})

describe('validateConfig', () => {
  it('should pass with valid config', () => {
    const config: UploaderConfig = {
      endpoint: '/api/upload',
      maxFileSize: 10000,
      minFileSize: 100,
      maxFiles: 10,
    }

    expect(() => validateConfig(config)).not.toThrow()
  })

  it('should throw when endpoint is missing', () => {
    const config = {} as UploaderConfig
    expect(() => validateConfig(config)).toThrow('endpoint is required')
  })

  it('should throw when maxFileSize is not positive', () => {
    const config: UploaderConfig = {
      endpoint: '/api/upload',
      maxFileSize: 0,
    }
    expect(() => validateConfig(config)).toThrow('maxFileSize must be positive')
  })

  it('should throw when minFileSize is negative', () => {
    const config: UploaderConfig = {
      endpoint: '/api/upload',
      minFileSize: -1,
    }
    expect(() => validateConfig(config)).toThrow('minFileSize cannot be negative')
  })

  it('should throw when maxFileSize is less than minFileSize', () => {
    const config: UploaderConfig = {
      endpoint: '/api/upload',
      maxFileSize: 100,
      minFileSize: 1000,
    }
    expect(() => validateConfig(config)).toThrow(
      'maxFileSize must be greater than or equal to minFileSize'
    )
  })

  it('should throw when maxFiles is not positive', () => {
    const config: UploaderConfig = {
      endpoint: '/api/upload',
      maxFiles: 0,
    }
    expect(() => validateConfig(config)).toThrow('maxFiles must be positive')
  })

  it('should throw when chunkSize is not positive', () => {
    const config: UploaderConfig = {
      endpoint: '/api/upload',
      chunkSize: 0,
    }
    expect(() => validateConfig(config)).toThrow('chunkSize must be positive')
  })

  it('should throw when parallelChunks is not positive', () => {
    const config: UploaderConfig = {
      endpoint: '/api/upload',
      parallelChunks: -1,
    }
    expect(() => validateConfig(config)).toThrow('parallelChunks must be positive')
  })

  it('should throw when timeout is negative', () => {
    const config: UploaderConfig = {
      endpoint: '/api/upload',
      timeout: -1,
    }
    expect(() => validateConfig(config)).toThrow('timeout cannot be negative')
  })

  it('should accept endpoint as function', () => {
    const config: UploaderConfig = {
      endpoint: (file) => `/api/upload/${file.id}`,
    }
    expect(() => validateConfig(config)).not.toThrow()
  })
})
