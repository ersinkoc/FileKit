import { describe, it, expect } from 'vitest'
import {
  createUploadError,
  createFileTooLargeError,
  createFileTooSmallError,
  createInvalidTypeError,
  createMaxFilesExceededError,
  createInvalidDimensionsError,
  createValidationFailedError,
  createNetworkError,
  createServerError,
  createTimeoutError,
  createCancelledError,
  createChunkFailedError,
  createUnknownError,
  isUploadError,
} from '../../src/errors'
import type { FileItem } from '../../src/types'

function createMockFile(name = 'test.txt', type = 'text/plain', size = 1024): File {
  const blob = new Blob(['x'.repeat(size)], { type })
  return new File([blob], name, { type })
}

function createMockFileItem(): FileItem {
  return {
    id: 'test-id',
    file: createMockFile(),
    name: 'test.txt',
    size: 1024,
    type: 'text/plain',
    status: 'pending',
    progress: 0,
    uploadedBytes: 0,
    metadata: {},
    addedAt: new Date(),
  }
}

describe('createUploadError', () => {
  it('should create error with all properties', () => {
    const fileItem = createMockFileItem()
    const error = createUploadError('NETWORK_ERROR', 'Connection failed', fileItem, { data: 'test' }, 500)

    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('UploadError')
    expect(error.code).toBe('NETWORK_ERROR')
    expect(error.message).toBe('Connection failed')
    expect(error.file).toBe(fileItem)
    expect(error.response).toEqual({ data: 'test' })
    expect(error.statusCode).toBe(500)
  })
})

describe('createFileTooLargeError', () => {
  it('should create error with file name and max size', () => {
    const file = createMockFile('large.zip', 'application/zip', 10000)
    const error = createFileTooLargeError(file, 5000)

    expect(error.code).toBe('FILE_TOO_LARGE')
    expect(error.message).toContain('large.zip')
    expect(error.message).toContain('KB') // 5000 bytes = 4.88 KB
  })
})

describe('createFileTooSmallError', () => {
  it('should create error with file name and min size', () => {
    const file = createMockFile('small.txt', 'text/plain', 100)
    const error = createFileTooSmallError(file, 1000)

    expect(error.code).toBe('FILE_TOO_SMALL')
    expect(error.message).toContain('small.txt')
  })
})

describe('createInvalidTypeError', () => {
  it('should create error with file type and allowed types', () => {
    const file = createMockFile('doc.exe', 'application/x-msdownload')
    const error = createInvalidTypeError(file, ['image/*', 'application/pdf'])

    expect(error.code).toBe('INVALID_TYPE')
    expect(error.message).toContain('doc.exe')
    expect(error.message).toContain('application/x-msdownload')
  })
})

describe('createMaxFilesExceededError', () => {
  it('should create error with max files count', () => {
    const error = createMaxFilesExceededError(10)

    expect(error.code).toBe('MAX_FILES_EXCEEDED')
    expect(error.message).toContain('10')
  })
})

describe('createInvalidDimensionsError', () => {
  it('should create error with dimension message', () => {
    const file = createMockFile('image.jpg', 'image/jpeg')
    const error = createInvalidDimensionsError(file, 'Width 2000px exceeds maximum 1920px')

    expect(error.code).toBe('INVALID_DIMENSIONS')
    expect(error.message).toContain('image.jpg')
    expect(error.message).toContain('2000')
  })
})

describe('createValidationFailedError', () => {
  it('should create error with validator name and message', () => {
    const file = createMockFile('test.txt')
    const error = createValidationFailedError(file, 'customValidator', 'File name is invalid')

    expect(error.code).toBe('VALIDATION_FAILED')
    expect(error.message).toContain('test.txt')
    expect(error.message).toContain('customValidator')
    expect(error.message).toContain('File name is invalid')
  })
})

describe('createNetworkError', () => {
  it('should create network error', () => {
    const error = createNetworkError()

    expect(error.code).toBe('NETWORK_ERROR')
    expect(error.message).toContain('Network error')
  })

  it('should attach file item', () => {
    const fileItem = createMockFileItem()
    const error = createNetworkError(fileItem)

    expect(error.file).toBe(fileItem)
  })
})

describe('createServerError', () => {
  it('should create server error with status code', () => {
    const error = createServerError(500, { error: 'Internal error' })

    expect(error.code).toBe('SERVER_ERROR')
    expect(error.statusCode).toBe(500)
    expect(error.response).toEqual({ error: 'Internal error' })
  })
})

describe('createTimeoutError', () => {
  it('should create timeout error', () => {
    const error = createTimeoutError()

    expect(error.code).toBe('TIMEOUT')
    expect(error.message).toContain('timed out')
  })
})

describe('createCancelledError', () => {
  it('should create cancelled error', () => {
    const error = createCancelledError()

    expect(error.code).toBe('CANCELLED')
    expect(error.message).toContain('cancelled')
  })
})

describe('createChunkFailedError', () => {
  it('should create chunk failed error', () => {
    const error = createChunkFailedError(5, 10)

    expect(error.code).toBe('CHUNK_FAILED')
    expect(error.message).toContain('6') // chunkIndex + 1
    expect(error.message).toContain('10')
  })
})

describe('createUnknownError', () => {
  it('should wrap Error object', () => {
    const original = new Error('Something went wrong')
    const error = createUnknownError(original)

    expect(error.code).toBe('UNKNOWN')
    expect(error.message).toBe('Something went wrong')
  })

  it('should handle non-Error values', () => {
    const error = createUnknownError('string error')

    expect(error.code).toBe('UNKNOWN')
    expect(error.message).toBe('Unknown error occurred')
  })
})

describe('isUploadError', () => {
  it('should return true for UploadError', () => {
    const error = createNetworkError()
    expect(isUploadError(error)).toBe(true)
  })

  it('should return false for regular Error', () => {
    const error = new Error('Regular error')
    expect(isUploadError(error)).toBe(false)
  })

  it('should return false for non-Error values', () => {
    expect(isUploadError('string')).toBe(false)
    expect(isUploadError(null)).toBe(false)
    expect(isUploadError(undefined)).toBe(false)
    expect(isUploadError(42)).toBe(false)
  })
})
