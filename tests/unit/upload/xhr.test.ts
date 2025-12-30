import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { uploadWithXHR } from '../../../src/upload/xhr'
import type { FileItem, UploaderConfig } from '../../../src/types'

function createMockFileItem(name = 'test.txt', size = 1024): FileItem {
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

describe('uploadWithXHR', () => {
  let originalXHR: typeof XMLHttpRequest
  let mockXHRInstances: MockXHR[] = []

  class MockXHR {
    static DONE = 4
    readyState = 0
    status = 0
    statusText = ''
    responseText = ''
    timeout = 0
    withCredentials = false

    onload: (() => void) | null = null
    onerror: (() => void) | null = null
    ontimeout: (() => void) | null = null
    onabort: (() => void) | null = null

    private headers: Record<string, string> = {}
    private url = ''
    private method = ''

    upload = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }

    constructor() {
      mockXHRInstances.push(this)
    }

    open(method: string, url: string): void {
      this.method = method
      this.url = url
    }

    setRequestHeader(name: string, value: string): void {
      this.headers[name] = value
    }

    send = vi.fn()
    abort = vi.fn()

    getHeaders(): Record<string, string> {
      return this.headers
    }

    getUrl(): string {
      return this.url
    }

    getMethod(): string {
      return this.method
    }

    simulateProgress(loaded: number, total: number): void {
      const progressHandler = this.upload.addEventListener.mock.calls.find(
        (call) => call[0] === 'progress'
      )?.[1]
      if (progressHandler) {
        progressHandler({ loaded, total, lengthComputable: true })
      }
    }

    simulateSuccess(response: unknown): void {
      this.readyState = MockXHR.DONE
      this.status = 200
      this.statusText = 'OK'
      this.responseText = typeof response === 'string' ? response : JSON.stringify(response)
      this.onload?.()
    }

    simulateError(): void {
      this.readyState = MockXHR.DONE
      this.onerror?.()
    }

    simulateServerError(status: number, response: unknown): void {
      this.readyState = MockXHR.DONE
      this.status = status
      this.statusText = 'Server Error'
      this.responseText = typeof response === 'string' ? response : JSON.stringify(response)
      this.onload?.()
    }

    simulateTimeout(): void {
      this.ontimeout?.()
    }

    simulateAbort(): void {
      this.onabort?.()
    }
  }

  beforeEach(() => {
    mockXHRInstances = []
    originalXHR = globalThis.XMLHttpRequest
    globalThis.XMLHttpRequest = MockXHR as unknown as typeof XMLHttpRequest
  })

  afterEach(() => {
    globalThis.XMLHttpRequest = originalXHR
    vi.restoreAllMocks()
  })

  it('should upload a file successfully', async () => {
    const file = createMockFileItem()
    const config: UploaderConfig = { endpoint: '/upload' }
    const onComplete = vi.fn()
    const onProgress = vi.fn()

    const handle = uploadWithXHR(file, config, { onComplete, onProgress })

    const xhr = mockXHRInstances[0]
    expect(xhr).toBeDefined()

    // Simulate progress
    xhr.simulateProgress(50, 100)
    expect(onProgress).toHaveBeenCalledWith(50, 100)

    // Simulate completion
    xhr.simulateSuccess({ url: '/uploaded/file.txt' })

    const result = await handle.promise
    expect(result).toEqual({ url: '/uploaded/file.txt' })
    expect(onComplete).toHaveBeenCalledWith({ url: '/uploaded/file.txt' })
  })

  it('should use endpoint function', async () => {
    const file = createMockFileItem()
    const config: UploaderConfig = {
      endpoint: (f) => `/upload/${f.id}`,
    }

    const handle = uploadWithXHR(file, config, {})

    const xhr = mockXHRInstances[0]
    expect(xhr.getUrl()).toBe('/upload/test-id')

    xhr.simulateSuccess({})
    await handle.promise
  })

  it('should set custom headers', async () => {
    const file = createMockFileItem()
    const config: UploaderConfig = {
      endpoint: '/upload',
      headers: { 'X-Custom': 'value', Authorization: 'Bearer token' },
    }

    const handle = uploadWithXHR(file, config, {})

    const xhr = mockXHRInstances[0]
    const headers = xhr.getHeaders()
    expect(headers['X-Custom']).toBe('value')
    expect(headers['Authorization']).toBe('Bearer token')

    xhr.simulateSuccess({})
    await handle.promise
  })

  it('should use headers function', async () => {
    const file = createMockFileItem()
    const config: UploaderConfig = {
      endpoint: '/upload',
      headers: (f) => ({ 'X-File-Id': f.id }),
    }

    const handle = uploadWithXHR(file, config, {})

    const xhr = mockXHRInstances[0]
    const headers = xhr.getHeaders()
    expect(headers['X-File-Id']).toBe('test-id')

    xhr.simulateSuccess({})
    await handle.promise
  })

  it('should set withCredentials', async () => {
    const file = createMockFileItem()
    const config: UploaderConfig = {
      endpoint: '/upload',
      withCredentials: true,
    }

    const handle = uploadWithXHR(file, config, {})

    const xhr = mockXHRInstances[0]
    expect(xhr.withCredentials).toBe(true)

    xhr.simulateSuccess({})
    await handle.promise
  })

  it('should set timeout', async () => {
    const file = createMockFileItem()
    const config: UploaderConfig = {
      endpoint: '/upload',
      timeout: 30000,
    }

    const handle = uploadWithXHR(file, config, {})

    const xhr = mockXHRInstances[0]
    expect(xhr.timeout).toBe(30000)

    xhr.simulateSuccess({})
    await handle.promise
  })

  it('should use custom method', async () => {
    const file = createMockFileItem()
    const config: UploaderConfig = {
      endpoint: '/upload',
      method: 'PUT',
    }

    const handle = uploadWithXHR(file, config, {})

    const xhr = mockXHRInstances[0]
    expect(xhr.getMethod()).toBe('PUT')

    xhr.simulateSuccess({})
    await handle.promise
  })

  it('should use custom fieldName', async () => {
    const file = createMockFileItem()
    const config: UploaderConfig = {
      endpoint: '/upload',
      fieldName: 'document',
    }

    const handle = uploadWithXHR(file, config, {})

    const xhr = mockXHRInstances[0]
    expect(xhr.send).toHaveBeenCalled()

    xhr.simulateSuccess({})
    await handle.promise
  })

  it('should handle server error', async () => {
    const file = createMockFileItem()
    const config: UploaderConfig = { endpoint: '/upload' }
    const onError = vi.fn()

    const handle = uploadWithXHR(file, config, { onError })

    const xhr = mockXHRInstances[0]
    xhr.simulateServerError(500, { error: 'Server error' })

    await expect(handle.promise).rejects.toMatchObject({
      code: 'SERVER_ERROR',
    })
    expect(onError).toHaveBeenCalled()
  })

  it('should handle network error', async () => {
    const file = createMockFileItem()
    const config: UploaderConfig = { endpoint: '/upload' }
    const onError = vi.fn()

    const handle = uploadWithXHR(file, config, { onError })

    const xhr = mockXHRInstances[0]
    xhr.simulateError()

    await expect(handle.promise).rejects.toMatchObject({
      code: 'NETWORK_ERROR',
    })
    expect(onError).toHaveBeenCalled()
  })

  it('should handle timeout', async () => {
    const file = createMockFileItem()
    const config: UploaderConfig = { endpoint: '/upload', timeout: 1000 }
    const onError = vi.fn()

    const handle = uploadWithXHR(file, config, { onError })

    const xhr = mockXHRInstances[0]
    xhr.simulateTimeout()

    await expect(handle.promise).rejects.toMatchObject({
      code: 'TIMEOUT',
    })
    expect(onError).toHaveBeenCalled()
  })

  it('should handle abort', async () => {
    const file = createMockFileItem()
    const config: UploaderConfig = { endpoint: '/upload' }
    const onError = vi.fn()

    const handle = uploadWithXHR(file, config, { onError })

    const xhr = mockXHRInstances[0]

    handle.abort()
    xhr.simulateAbort()

    await expect(handle.promise).rejects.toMatchObject({
      code: 'CANCELLED',
    })
    expect(onError).toHaveBeenCalled()
  })

  it('should apply transformRequest', async () => {
    const file = createMockFileItem()
    const transformRequest = vi.fn((formData) => {
      formData.append('extra', 'value')
      return formData
    })
    const config: UploaderConfig = {
      endpoint: '/upload',
      transformRequest,
    }

    const handle = uploadWithXHR(file, config, {})

    expect(transformRequest).toHaveBeenCalled()

    const xhr = mockXHRInstances[0]
    xhr.simulateSuccess({})
    await handle.promise
  })

  it('should update file uploadedBytes and progress', async () => {
    const file = createMockFileItem('test.txt', 1000)
    const config: UploaderConfig = { endpoint: '/upload' }

    const handle = uploadWithXHR(file, config, {})

    const xhr = mockXHRInstances[0]
    xhr.simulateProgress(500, 1000)

    expect(file.uploadedBytes).toBe(500)
    expect(file.progress).toBe(50)

    xhr.simulateSuccess({})
    await handle.promise
  })

  it('should handle non-JSON response', async () => {
    const file = createMockFileItem()
    const config: UploaderConfig = { endpoint: '/upload' }
    const onComplete = vi.fn()

    const handle = uploadWithXHR(file, config, { onComplete })

    const xhr = mockXHRInstances[0]
    xhr.responseText = 'plain text response'
    xhr.status = 200
    xhr.readyState = MockXHR.DONE
    xhr.onload?.()

    const result = await handle.promise
    expect(result).toBe('plain text response')
    expect(onComplete).toHaveBeenCalledWith('plain text response')
  })

  it('should handle non-JSON error response', async () => {
    const file = createMockFileItem()
    const config: UploaderConfig = { endpoint: '/upload' }
    const onError = vi.fn()

    const handle = uploadWithXHR(file, config, { onError })

    const xhr = mockXHRInstances[0]
    xhr.responseText = 'Server Error'
    xhr.status = 500
    xhr.readyState = MockXHR.DONE
    xhr.onload?.()

    await expect(handle.promise).rejects.toMatchObject({
      code: 'SERVER_ERROR',
    })
  })

  it('should ignore events after abort', async () => {
    const file = createMockFileItem()
    const config: UploaderConfig = { endpoint: '/upload' }
    const onProgress = vi.fn()
    const onComplete = vi.fn()

    const handle = uploadWithXHR(file, config, { onProgress, onComplete })

    // Abort first
    handle.abort()

    const xhr = mockXHRInstances[0]

    // These should be ignored after abort
    xhr.simulateProgress(100, 100)

    // Force calling onload with success
    xhr.status = 200
    xhr.responseText = '{}'
    xhr.onload?.()

    // Wait a bit
    await new Promise((r) => setTimeout(r, 10))

    // Should not have called onComplete after abort
    expect(onComplete).not.toHaveBeenCalled()
  })
})
