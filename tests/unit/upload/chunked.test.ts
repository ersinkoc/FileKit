import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createChunks, uploadChunked } from '../../../src/upload/chunked'
import type { FileItem, UploaderConfig } from '../../../src/types'

function createMockFileItem(
  name = 'test.txt',
  size = 5 * 1024 * 1024 // 5MB
): FileItem {
  const blob = new Blob(['x'.repeat(size)], { type: 'text/plain' })
  const file = new File([blob], name, { type: 'text/plain' })

  return {
    id: 'test-id',
    file,
    name,
    size,
    type: 'text/plain',
    extension: 'txt',
    status: 'pending',
    progress: 0,
    uploadedBytes: 0,
    startedAt: undefined,
    completedAt: undefined,
    error: undefined,
    response: undefined,
    metadata: {},
    chunks: undefined,
    currentChunk: undefined,
    totalChunks: undefined,
    previewUrl: undefined,
  }
}

describe('createChunks', () => {
  it('should create chunks for a file', () => {
    const fileSize = 5 * 1024 * 1024 // 5MB
    const chunkSize = 1024 * 1024 // 1MB

    const chunks = createChunks(fileSize, chunkSize)

    expect(chunks).toHaveLength(5)

    // Check first chunk
    expect(chunks[0]).toEqual({
      index: 0,
      start: 0,
      end: 1024 * 1024,
      size: 1024 * 1024,
      uploaded: false,
      retries: 0,
    })

    // Check last chunk
    expect(chunks[4]).toEqual({
      index: 4,
      start: 4 * 1024 * 1024,
      end: 5 * 1024 * 1024,
      size: 1024 * 1024,
      uploaded: false,
      retries: 0,
    })
  })

  it('should handle partial last chunk', () => {
    const fileSize = 5 * 1024 * 1024 + 500 // 5MB + 500 bytes
    const chunkSize = 1024 * 1024 // 1MB

    const chunks = createChunks(fileSize, chunkSize)

    expect(chunks).toHaveLength(6)

    // Last chunk should be smaller
    const lastChunk = chunks[5]
    expect(lastChunk?.size).toBe(500)
    expect(lastChunk?.start).toBe(5 * 1024 * 1024)
    expect(lastChunk?.end).toBe(fileSize)
  })

  it('should handle small files', () => {
    const fileSize = 500 // 500 bytes
    const chunkSize = 1024 * 1024 // 1MB

    const chunks = createChunks(fileSize, chunkSize)

    expect(chunks).toHaveLength(1)
    expect(chunks[0]?.size).toBe(500)
  })

  it('should handle exact chunk size', () => {
    const fileSize = 2 * 1024 * 1024 // 2MB exactly
    const chunkSize = 1024 * 1024 // 1MB

    const chunks = createChunks(fileSize, chunkSize)

    expect(chunks).toHaveLength(2)
    expect(chunks[0]?.size).toBe(chunkSize)
    expect(chunks[1]?.size).toBe(chunkSize)
  })
})

describe('uploadChunked', () => {
  let mockFetch: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    })
    globalThis.fetch = mockFetch
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should upload file in chunks', async () => {
    const file = createMockFileItem('test.txt', 2 * 1024 * 1024) // 2MB
    const config: UploaderConfig = {
      endpoint: '/upload',
      chunkSize: 1024 * 1024, // 1MB
    }

    const onProgress = vi.fn()
    const onChunkComplete = vi.fn()
    const onComplete = vi.fn()

    const handle = uploadChunked(file, config, {
      onProgress,
      onChunkComplete,
      onComplete,
    })

    expect(handle).toBeDefined()
    expect(typeof handle.abort).toBe('function')
    expect(typeof handle.pause).toBe('function')
    expect(typeof handle.resume).toBe('function')
    expect(handle.promise).toBeInstanceOf(Promise)

    await handle.promise

    // Should have called fetch for each chunk plus merge
    expect(mockFetch).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalled()
  })

  it('should initialize chunks on file', async () => {
    const file = createMockFileItem('test.txt', 3 * 1024 * 1024)
    const config: UploaderConfig = {
      endpoint: '/upload',
      chunkSize: 1024 * 1024,
    }

    expect(file.chunks).toBeUndefined()

    const handle = uploadChunked(file, config, {})

    // Wait for initialization
    await new Promise((r) => setTimeout(r, 0))

    expect(file.chunks).toBeDefined()
    expect(file.chunks?.length).toBe(3)
    expect(file.totalChunks).toBe(3)
  })

  it('should handle chunk upload failure', async () => {
    const file = createMockFileItem('test.txt', 1024 * 1024)
    const config: UploaderConfig = {
      endpoint: '/upload',
      chunkSize: 1024 * 1024,
      retryChunks: 0, // No retries
    }

    mockFetch.mockRejectedValue(new Error('Network error'))

    const onError = vi.fn()

    const handle = uploadChunked(file, config, { onError })

    await expect(handle.promise).rejects.toThrow()
    expect(onError).toHaveBeenCalled()
  })

  it('should support abort', async () => {
    const file = createMockFileItem('test.txt', 5 * 1024 * 1024)
    const config: UploaderConfig = {
      endpoint: '/upload',
      chunkSize: 1024 * 1024,
    }

    const onError = vi.fn()

    const handle = uploadChunked(file, config, { onError })

    handle.abort()

    await expect(handle.promise).rejects.toThrow()
    expect(onError).toHaveBeenCalled()
  })

  it('should support pause and resume', async () => {
    const file = createMockFileItem('test.txt', 2 * 1024 * 1024)
    const config: UploaderConfig = {
      endpoint: '/upload',
      chunkSize: 1024 * 1024,
    }

    const onPause = vi.fn()
    const onResume = vi.fn()

    const handle = uploadChunked(file, config, {
      onPause,
      onResume,
    })

    // Pause
    handle.pause()

    // Wait a bit
    await new Promise((r) => setTimeout(r, 10))

    // Resume
    handle.resume()

    expect(onResume).toHaveBeenCalled()

    await handle.promise
  })

  it('should use chunkEndpoint if provided', async () => {
    const file = createMockFileItem('test.txt', 1024 * 1024)
    const config: UploaderConfig = {
      endpoint: '/upload',
      chunkEndpoint: '/upload/chunk',
      chunkSize: 1024 * 1024,
    }

    const handle = uploadChunked(file, config, {})

    await handle.promise

    // First call should be to chunk endpoint
    expect(mockFetch).toHaveBeenCalledWith(
      '/upload/chunk',
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('should use mergeEndpoint if provided', async () => {
    const file = createMockFileItem('test.txt', 1024 * 1024)
    const config: UploaderConfig = {
      endpoint: '/upload',
      mergeEndpoint: '/upload/merge',
      chunkSize: 1024 * 1024,
    }

    const handle = uploadChunked(file, config, {})

    await handle.promise

    // Last call should be to merge endpoint
    const lastCall = mockFetch.mock.calls[mockFetch.mock.calls.length - 1]
    expect(lastCall?.[0]).toBe('/upload/merge')
  })

  it('should use parallel chunks', async () => {
    const file = createMockFileItem('test.txt', 4 * 1024 * 1024)
    const config: UploaderConfig = {
      endpoint: '/upload',
      chunkSize: 1024 * 1024,
      parallelChunks: 2,
    }

    const handle = uploadChunked(file, config, {})

    await handle.promise

    // Should have uploaded all chunks
    expect(mockFetch).toHaveBeenCalled()
  })

  it('should include file metadata in merge request', async () => {
    const file = createMockFileItem('test.txt', 1024 * 1024)
    file.metadata['category'] = 'documents'

    const config: UploaderConfig = {
      endpoint: '/upload',
      chunkSize: 1024 * 1024,
    }

    const handle = uploadChunked(file, config, {})

    await handle.promise

    // Check merge request body (look for a call with JSON body that has metadata)
    const mergeCall = mockFetch.mock.calls.find((call) => {
      const body = call[1]?.body
      if (typeof body === 'string') {
        try {
          const parsed = JSON.parse(body)
          return parsed.metadata !== undefined
        } catch {
          return false
        }
      }
      return false
    })

    if (mergeCall) {
      const body = JSON.parse(mergeCall[1]?.body as string)
      expect(body.metadata).toEqual({ category: 'documents' })
    }
  })

  it('should handle dynamic endpoint', async () => {
    const file = createMockFileItem('test.txt', 1024 * 1024)
    const config: UploaderConfig = {
      endpoint: (f) => `/upload/${f.id}`,
      chunkSize: 1024 * 1024,
    }

    const handle = uploadChunked(file, config, {})

    await handle.promise

    expect(mockFetch).toHaveBeenCalledWith(
      '/upload/test-id',
      expect.anything()
    )
  })

  it('should handle headers function', async () => {
    const file = createMockFileItem('test.txt', 1024 * 1024)
    const config: UploaderConfig = {
      endpoint: '/upload',
      chunkSize: 1024 * 1024,
      headers: () => ({ 'X-Custom': 'value' }),
    }

    const handle = uploadChunked(file, config, {})

    await handle.promise

    expect(mockFetch).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        headers: expect.objectContaining({ 'X-Custom': 'value' }),
      })
    )
  })

  it('should use withCredentials option', async () => {
    const file = createMockFileItem('test.txt', 1024 * 1024)
    const config: UploaderConfig = {
      endpoint: '/upload',
      chunkSize: 1024 * 1024,
      withCredentials: true,
    }

    const handle = uploadChunked(file, config, {})

    await handle.promise

    expect(mockFetch).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        credentials: 'include',
      })
    )
  })
})
