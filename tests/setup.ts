import { vi, beforeEach } from 'vitest'

// Mock URL.createObjectURL and URL.revokeObjectURL
const blobUrlMap = new Map<string, Blob>()
const fileNameMap = new Map<string, string>() // Map blob URL to original file name
let blobUrlCounter = 0

globalThis.URL.createObjectURL = vi.fn((blob: Blob) => {
  const url = `blob:mock-url-${++blobUrlCounter}`
  blobUrlMap.set(url, blob)
  // If the blob is from a File, store the file name
  if (blob instanceof File) {
    fileNameMap.set(url, blob.name)
  }
  return url
})

globalThis.URL.revokeObjectURL = vi.fn((url: string) => {
  blobUrlMap.delete(url)
  fileNameMap.delete(url)
})

// Mock Image
class MockImage {
  private _src = ''
  width = 0
  height = 0
  onload: (() => void) | null = null
  onerror: ((error: Error) => void) | null = null

  get src() {
    return this._src
  }

  set src(value: string) {
    this._src = value
    // Check if the original file name includes 'error'
    const originalFileName = fileNameMap.get(value) || value
    setTimeout(() => {
      if (originalFileName.includes('error')) {
        this.onerror?.(new Error('Failed to load image'))
      } else {
        this.width = 100
        this.height = 100
        this.onload?.()
      }
    }, 0)
  }
}

globalThis.Image = MockImage as unknown as typeof Image

// Mock FileReader
class MockFileReader {
  result: string | ArrayBuffer | null = null
  error: Error | null = null
  onload: ((event: ProgressEvent<FileReader>) => void) | null = null
  onerror: ((event: ProgressEvent<FileReader>) => void) | null = null
  onprogress: ((event: ProgressEvent<FileReader>) => void) | null = null

  readAsDataURL(blob: Blob): void {
    setTimeout(() => {
      this.result = `data:${blob.type};base64,mock-base64-data`
      this.onload?.({ target: this } as unknown as ProgressEvent<FileReader>)
    }, 0)
  }

  readAsText(blob: Blob, _encoding?: string): void {
    setTimeout(async () => {
      this.result = await blob.text()
      this.onload?.({ target: this } as unknown as ProgressEvent<FileReader>)
    }, 0)
  }

  readAsArrayBuffer(blob: Blob): void {
    setTimeout(async () => {
      this.result = await blob.arrayBuffer()
      this.onload?.({ target: this } as unknown as ProgressEvent<FileReader>)
    }, 0)
  }

  abort(): void {
    // No-op for mock
  }
}

globalThis.FileReader = MockFileReader as unknown as typeof FileReader

// Mock XMLHttpRequest
class MockXMLHttpRequest {
  static UNSENT = 0
  static OPENED = 1
  static HEADERS_RECEIVED = 2
  static LOADING = 3
  static DONE = 4

  readyState = 0
  status = 0
  statusText = ''
  response: unknown = null
  responseText = ''
  responseType = ''
  timeout = 0
  withCredentials = false

  private uploadListeners: Record<string, Array<(event: ProgressEvent) => void>> = {}

  upload = {
    addEventListener: (event: string, handler: (event: ProgressEvent) => void) => {
      if (!this.uploadListeners[event]) {
        this.uploadListeners[event] = []
      }
      this.uploadListeners[event].push(handler)
    },
    removeEventListener: (event: string, handler: (event: ProgressEvent) => void) => {
      const listeners = this.uploadListeners[event]
      if (listeners) {
        const index = listeners.indexOf(handler)
        if (index > -1) {
          listeners.splice(index, 1)
        }
      }
    },
    dispatchEvent: (event: string, progressEvent: ProgressEvent) => {
      const listeners = this.uploadListeners[event]
      if (listeners) {
        listeners.forEach(handler => handler(progressEvent))
      }
    },
    onprogress: null as ((event: ProgressEvent) => void) | null,
    onload: null as (() => void) | null,
    onerror: null as ((event: ProgressEvent) => void) | null,
  }

  onreadystatechange: (() => void) | null = null
  onload: (() => void) | null = null
  onerror: ((event: ProgressEvent) => void) | null = null
  ontimeout: (() => void) | null = null
  onabort: (() => void) | null = null

  private headers: Record<string, string> = {}
  private url = ''
  private aborted = false

  open(_method: string, url: string): void {
    this.url = url
    this.readyState = MockXMLHttpRequest.OPENED
  }

  setRequestHeader(name: string, value: string): void {
    this.headers[name] = value
  }

  send(_body?: Document | XMLHttpRequestBodyInit | null): void {
    if (this.aborted) return

    setTimeout(() => {
      if (this.aborted) return

      // Simulate progress using addEventListener
      const progressEvent1 = { loaded: 50, total: 100, lengthComputable: true } as ProgressEvent
      const progressEvent2 = { loaded: 100, total: 100, lengthComputable: true } as ProgressEvent

      // Dispatch to addEventListener listeners
      this.upload.dispatchEvent('progress', progressEvent1)
      this.upload.dispatchEvent('progress', progressEvent2)

      // Also call onprogress for backwards compatibility
      if (this.upload.onprogress) {
        this.upload.onprogress(progressEvent1)
        this.upload.onprogress(progressEvent2)
      }

      // Simulate success
      this.readyState = MockXMLHttpRequest.DONE
      this.status = this.url.includes('error') ? 500 : 200
      this.statusText = this.status === 200 ? 'OK' : 'Internal Server Error'
      this.responseText = JSON.stringify({ success: true, url: 'https://example.com/file' })
      this.response = this.responseText

      this.onreadystatechange?.()
      if (this.status >= 200 && this.status < 300) {
        this.onload?.()
      } else {
        this.onerror?.({ type: 'error' } as ProgressEvent)
      }
    }, 10)
  }

  abort(): void {
    this.aborted = true
    this.readyState = MockXMLHttpRequest.DONE
    this.status = 0
    this.onabort?.()
  }

  getAllResponseHeaders(): string {
    return 'content-type: application/json'
  }

  getResponseHeader(name: string): string | null {
    if (name.toLowerCase() === 'content-type') return 'application/json'
    return null
  }
}

globalThis.XMLHttpRequest = MockXMLHttpRequest as unknown as typeof XMLHttpRequest

// Mock Canvas
const mockCanvasContext = {
  drawImage: vi.fn(),
  getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(100 * 100 * 4) })),
  putImageData: vi.fn(),
  canvas: { width: 100, height: 100 },
}

HTMLCanvasElement.prototype.getContext = vi.fn((_type: string) => mockCanvasContext) as unknown as typeof HTMLCanvasElement.prototype.getContext

HTMLCanvasElement.prototype.toDataURL = vi.fn(
  (_type?: string, _quality?: number) => 'data:image/jpeg;base64,mock-base64-data'
)

HTMLCanvasElement.prototype.toBlob = vi.fn(
  (callback: BlobCallback, type?: string, _quality?: number) => {
    setTimeout(() => {
      callback(new Blob(['mock-image-data'], { type: type ?? 'image/png' }))
    }, 0)
  }
)

// Reset mocks between tests
beforeEach(() => {
  vi.clearAllMocks()
  blobUrlMap.clear()
  fileNameMap.clear()
  blobUrlCounter = 0
})
