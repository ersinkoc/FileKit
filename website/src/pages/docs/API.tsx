import CodeBlock from '../../components/CodeBlock'

export default function APIReference() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-3xl font-bold text-white mb-4">API Reference</h1>
      <p className="text-zinc-400 text-lg mb-8">
        Complete API reference for FileKit.
      </p>

      {/* createUploader */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">createUploader</h2>
        <p className="text-zinc-400 mb-4">
          Creates a new uploader instance.
        </p>
        <CodeBlock
          code={`function createUploader(config: UploaderConfig): Uploader`}
          language="typescript"
        />

        <h3 className="text-xl font-semibold text-white mt-6 mb-3">UploaderConfig</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-3 px-4 text-zinc-300 font-medium">Property</th>
                <th className="text-left py-3 px-4 text-zinc-300 font-medium">Type</th>
                <th className="text-left py-3 px-4 text-zinc-300 font-medium">Default</th>
                <th className="text-left py-3 px-4 text-zinc-300 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="text-zinc-400">
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">endpoint</code></td>
                <td className="py-3 px-4">string | (file) =&gt; string</td>
                <td className="py-3 px-4">Required</td>
                <td className="py-3 px-4">Upload URL</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">maxFileSize</code></td>
                <td className="py-3 px-4">number</td>
                <td className="py-3 px-4">Infinity</td>
                <td className="py-3 px-4">Max file size in bytes</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">minFileSize</code></td>
                <td className="py-3 px-4">number</td>
                <td className="py-3 px-4">0</td>
                <td className="py-3 px-4">Min file size in bytes</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">allowedTypes</code></td>
                <td className="py-3 px-4">string[]</td>
                <td className="py-3 px-4">['*/*']</td>
                <td className="py-3 px-4">Allowed MIME types</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">maxFiles</code></td>
                <td className="py-3 px-4">number</td>
                <td className="py-3 px-4">Infinity</td>
                <td className="py-3 px-4">Max number of files</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">autoUpload</code></td>
                <td className="py-3 px-4">boolean</td>
                <td className="py-3 px-4">false</td>
                <td className="py-3 px-4">Auto upload on add</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">sequential</code></td>
                <td className="py-3 px-4">boolean</td>
                <td className="py-3 px-4">false</td>
                <td className="py-3 px-4">Upload one at a time</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">headers</code></td>
                <td className="py-3 px-4">object | () =&gt; object</td>
                <td className="py-3 px-4">{'{}'}</td>
                <td className="py-3 px-4">Request headers</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">withCredentials</code></td>
                <td className="py-3 px-4">boolean</td>
                <td className="py-3 px-4">false</td>
                <td className="py-3 px-4">Include cookies</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">fieldName</code></td>
                <td className="py-3 px-4">string</td>
                <td className="py-3 px-4">'file'</td>
                <td className="py-3 px-4">Form field name</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">retries</code></td>
                <td className="py-3 px-4">number</td>
                <td className="py-3 px-4">0</td>
                <td className="py-3 px-4">Retry attempts</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">retryDelay</code></td>
                <td className="py-3 px-4">number</td>
                <td className="py-3 px-4">1000</td>
                <td className="py-3 px-4">Retry delay in ms</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">chunked</code></td>
                <td className="py-3 px-4">ChunkedConfig</td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4">Chunked upload config</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">validators</code></td>
                <td className="py-3 px-4">Validator[]</td>
                <td className="py-3 px-4">[]</td>
                <td className="py-3 px-4">Custom validators</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-xl font-semibold text-white mt-6 mb-3">Uploader Methods</h3>
        <CodeBlock
          code={`interface Uploader {
  // File management
  addFile(file: File): FileItem
  addFiles(files: File[]): FileItem[]
  removeFile(id: string): void
  removeAll(): void
  getFile(id: string): FileItem | undefined
  getFiles(): FileItem[]
  getFilesByStatus(status: FileStatus): FileItem[]

  // Upload control
  upload(id: string): Promise<void>
  uploadAll(): Promise<void>
  cancel(id: string): void
  cancelAll(): void
  retry(id: string): void
  retryAll(): void

  // Progress
  getProgress(): UploadProgress

  // Configuration
  getConfig(): UploaderConfig
  setConfig(config: Partial<UploaderConfig>): void

  // Events
  on(event: string, handler: Function): void
  off(event: string, handler: Function): void

  // Cleanup
  destroy(): void
}`}
          language="typescript"
        />
      </section>

      {/* createDropZone */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">createDropZone</h2>
        <p className="text-zinc-400 mb-4">
          Creates a drop zone for drag and drop uploads.
        </p>
        <CodeBlock
          code={`function createDropZone(
  element: HTMLElement,
  config?: DropZoneConfig
): DropZone`}
          language="typescript"
        />

        <h3 className="text-xl font-semibold text-white mt-6 mb-3">DropZoneConfig</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-3 px-4 text-zinc-300 font-medium">Property</th>
                <th className="text-left py-3 px-4 text-zinc-300 font-medium">Type</th>
                <th className="text-left py-3 px-4 text-zinc-300 font-medium">Default</th>
              </tr>
            </thead>
            <tbody className="text-zinc-400">
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">accept</code></td>
                <td className="py-3 px-4">string[]</td>
                <td className="py-3 px-4">['*/*']</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">multiple</code></td>
                <td className="py-3 px-4">boolean</td>
                <td className="py-3 px-4">true</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">maxFiles</code></td>
                <td className="py-3 px-4">number</td>
                <td className="py-3 px-4">Infinity</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">disabled</code></td>
                <td className="py-3 px-4">boolean</td>
                <td className="py-3 px-4">false</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">clickable</code></td>
                <td className="py-3 px-4">boolean</td>
                <td className="py-3 px-4">true</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">noKeyboard</code></td>
                <td className="py-3 px-4">boolean</td>
                <td className="py-3 px-4">false</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-xl font-semibold text-white mt-6 mb-3">DropZone Methods</h3>
        <CodeBlock
          code={`interface DropZone {
  enable(): void
  disable(): void
  isDragActive(): boolean
  open(): void
  getConfig(): DropZoneConfig
  setConfig(config: Partial<DropZoneConfig>): void
  on(event: string, handler: Function): void
  off(event: string, handler: Function): void
  destroy(): void
}`}
          language="typescript"
        />
      </section>

      {/* createValidator */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">createValidator</h2>
        <p className="text-zinc-400 mb-4">
          Creates a file validator.
        </p>
        <CodeBlock
          code={`function createValidator(config?: ValidatorConfig): Validator

interface ValidatorConfig {
  maxFileSize?: number
  minFileSize?: number
  allowedTypes?: string[]
  validators?: CustomValidator[]
}

interface Validator {
  validate(file: File): ValidationResult
  validateAll(files: File[]): ValidationResult[]
}

interface ValidationResult {
  valid: boolean
  file: File
  errors: ValidationError[]
}

interface CustomValidator {
  name: string
  validate: (file: File) => void | Promise<void>
}`}
          language="typescript"
        />
      </section>

      {/* createUploadQueue */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">createUploadQueue</h2>
        <p className="text-zinc-400 mb-4">
          Creates an upload queue with concurrency control.
        </p>
        <CodeBlock
          code={`function createUploadQueue(config?: QueueConfig): UploadQueue

interface QueueConfig {
  concurrency?: number  // Default: 3
  autoStart?: boolean   // Default: true
}

interface UploadQueue {
  add(task: () => Promise<void>): void
  pause(): void
  resume(): void
  clear(): void
  getSize(): number
  isPaused(): boolean
}`}
          language="typescript"
        />
      </section>

      {/* Preview functions */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Preview Functions</h2>

        <h3 className="text-xl font-semibold text-white mt-6 mb-3">createImagePreview</h3>
        <CodeBlock
          code={`function createImagePreview(
  file: File,
  options?: PreviewOptions
): Promise<string>

interface PreviewOptions {
  maxWidth?: number   // Default: 800
  maxHeight?: number  // Default: 800
  quality?: number    // Default: 0.8
  type?: string       // Default: 'image/jpeg'
}`}
          language="typescript"
        />

        <h3 className="text-xl font-semibold text-white mt-6 mb-3">getImageDimensions</h3>
        <CodeBlock
          code={`function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }>`}
          language="typescript"
        />

        <h3 className="text-xl font-semibold text-white mt-6 mb-3">compressImage</h3>
        <CodeBlock
          code={`function compressImage(
  file: File,
  options?: CompressOptions
): Promise<File>

interface CompressOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  type?: string
}`}
          language="typescript"
        />
      </section>

      {/* Utility functions */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Utility Functions</h2>
        <CodeBlock
          code={`// File type checks
function isImage(file: File): boolean
function isVideo(file: File): boolean
function matchesMimePattern(type: string, pattern: string): boolean

// File info
function getFileExtension(filename: string): string
function getFileCategory(file: File): 'image' | 'video' | 'audio' | 'document' | 'other'
function getMimeType(filename: string): string

// Size formatting
function formatFileSize(bytes: number): string
function parseFileSize(size: string): number

// File reading
function readAsDataURL(file: File): Promise<string>
function readAsText(file: File, encoding?: string): Promise<string>
function readAsArrayBuffer(file: File): Promise<ArrayBuffer>`}
          language="typescript"
        />
      </section>

      {/* Types */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Types</h2>
        <CodeBlock
          code={`type FileStatus = 'pending' | 'uploading' | 'completed' | 'error' | 'cancelled'

interface FileItem {
  id: string
  file: File
  name: string
  status: FileStatus
  progress: number
  uploadedBytes: number
  speed: number
  remainingTime: number
  response?: unknown
  error?: FileKitError
  metadata: Record<string, unknown>
}

interface UploadProgress {
  totalFiles: number
  completedFiles: number
  totalBytes: number
  uploadedBytes: number
  percentage: number
}

interface ChunkInfo {
  index: number
  total: number
  start: number
  end: number
  size: number
  blob: Blob
}

interface FileKitError extends Error {
  code: string
  details?: Record<string, unknown>
}`}
          language="typescript"
        />
      </section>

      {/* Events */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Events</h2>

        <h3 className="text-xl font-semibold text-white mt-6 mb-3">Uploader Events</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-3 px-4 text-zinc-300 font-medium">Event</th>
                <th className="text-left py-3 px-4 text-zinc-300 font-medium">Arguments</th>
              </tr>
            </thead>
            <tbody className="text-zinc-400">
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">add</code></td>
                <td className="py-3 px-4">(file: FileItem)</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">remove</code></td>
                <td className="py-3 px-4">(file: FileItem)</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">start</code></td>
                <td className="py-3 px-4">(file: FileItem)</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">progress</code></td>
                <td className="py-3 px-4">(file: FileItem)</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">complete</code></td>
                <td className="py-3 px-4">(file: FileItem)</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">error</code></td>
                <td className="py-3 px-4">(file: FileItem, error: FileKitError)</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">cancel</code></td>
                <td className="py-3 px-4">(file: FileItem)</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">allComplete</code></td>
                <td className="py-3 px-4">()</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-xl font-semibold text-white mt-6 mb-3">DropZone Events</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-3 px-4 text-zinc-300 font-medium">Event</th>
                <th className="text-left py-3 px-4 text-zinc-300 font-medium">Arguments</th>
              </tr>
            </thead>
            <tbody className="text-zinc-400">
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">drop</code></td>
                <td className="py-3 px-4">(files: File[])</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">dragenter</code></td>
                <td className="py-3 px-4">()</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">dragleave</code></td>
                <td className="py-3 px-4">()</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">dragover</code></td>
                <td className="py-3 px-4">(event: DragEvent)</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">error</code></td>
                <td className="py-3 px-4">(error: FileKitError)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Error codes */}
      <section>
        <h2 className="text-2xl font-semibold text-white mb-4">Error Codes</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-3 px-4 text-zinc-300 font-medium">Code</th>
                <th className="text-left py-3 px-4 text-zinc-300 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="text-zinc-400">
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">FILE_TOO_LARGE</code></td>
                <td className="py-3 px-4">File exceeds max size</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">FILE_TOO_SMALL</code></td>
                <td className="py-3 px-4">File below min size</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">INVALID_TYPE</code></td>
                <td className="py-3 px-4">File type not allowed</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">MAX_FILES_EXCEEDED</code></td>
                <td className="py-3 px-4">Max files limit reached</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">UPLOAD_ABORTED</code></td>
                <td className="py-3 px-4">Upload was cancelled</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">NETWORK_ERROR</code></td>
                <td className="py-3 px-4">Network request failed</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">SERVER_ERROR</code></td>
                <td className="py-3 px-4">Server returned error</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">TIMEOUT</code></td>
                <td className="py-3 px-4">Request timed out</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">VALIDATION_ERROR</code></td>
                <td className="py-3 px-4">Custom validation failed</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
