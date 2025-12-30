# FileKit - Implementation Guide

## Architecture Overview

FileKit follows a modular architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                     Public API Layer                        │
│  createUploader | createDropZone | createUploadQueue       │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                      Core Classes                            │
│     Uploader    │    DropZone    │    UploadQueue          │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                     Support Modules                          │
│  Upload │ Validation │ Preview │ Utils │ Events │ Config   │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                      React Adapter                           │
│   Provider │ Hooks │ Components                             │
└─────────────────────────────────────────────────────────────┘
```

## Design Decisions

### 1. Zero Dependencies

All functionality is implemented from scratch:
- Event system: Custom EventEmitter implementation
- HTTP: XMLHttpRequest (no fetch for progress support)
- Image processing: Canvas API
- File reading: FileReader API
- Unique IDs: Custom generator (no uuid)

### 2. Event-Driven Architecture

All state changes emit events, enabling:
- Loose coupling between components
- Easy testing and debugging
- React integration via subscription

```typescript
// Internal event emitter pattern
class EventEmitter<T extends Record<string, unknown[]>> {
  private listeners = new Map<keyof T, Set<Function>>()

  on<K extends keyof T>(event: K, handler: (...args: T[K]) => void): () => void
  off<K extends keyof T>(event: K, handler: (...args: T[K]) => void): void
  emit<K extends keyof T>(event: K, ...args: T[K]): void
}
```

### 3. Immutable File Items

FileItem objects are treated as immutable externally:
- Internal updates create new references
- Enables efficient React re-rendering
- Prevents accidental mutation

### 4. Configuration Merging

Configs use deep merge with defaults:
```typescript
const config = deepMerge(DEFAULT_CONFIG, userConfig)
```

### 5. Lazy Initialization

Resources are created on-demand:
- Previews generated only when requested
- XHR created only when upload starts
- Event listeners attached only when needed

## Module Breakdown

### 1. Types (`src/types.ts`)

All TypeScript interfaces and type aliases:
- FileStatus, FileItem, ChunkInfo
- UploadProgress, OverallProgress
- UploadError, UploadErrorCode
- UploaderConfig, DropZoneConfig, QueueConfig
- Validator, ValidationResult
- Event types and handlers

### 2. Errors (`src/errors.ts`)

Custom error classes:
```typescript
class UploadError extends Error {
  constructor(
    public code: UploadErrorCode,
    message: string,
    public file?: FileItem,
    public response?: unknown,
    public statusCode?: number
  )
}

// Factory functions for each error type
createFileTooLargeError(file, maxSize)
createInvalidTypeError(file, allowedTypes)
// ... etc
```

### 3. Utils (`src/utils/`)

#### `file.ts` - File utilities
```typescript
isImage(file: File): boolean
isVideo(file: File): boolean
isAudio(file: File): boolean
isPDF(file: File): boolean
getFileExtension(file: File | string): string
getFileCategory(file: File): FileCategory
```

#### `mime.ts` - MIME type mapping
```typescript
getMimeType(extension: string): string
getExtensionFromMime(mime: string): string
matchesMimePattern(type: string, pattern: string): boolean
```

#### `size.ts` - Size formatting
```typescript
formatFileSize(bytes: number): string  // "1.5 MB"
parseFileSize(size: string): number    // 1572864
```

#### `reader.ts` - File reading
```typescript
readAsDataURL(file: File): Promise<string>
readAsText(file: File, encoding?: string): Promise<string>
readAsArrayBuffer(file: File): Promise<ArrayBuffer>
readAsJSON<T>(file: File): Promise<T>
```

#### `id.ts` - Unique ID generation
```typescript
generateId(): string  // "file_abc123xyz"
```

### 4. Validation (`src/validation/`)

#### `validator.ts` - Validator factory
```typescript
function createValidator(config: ValidatorConfig): {
  validate(file: File): Promise<ValidationResult>
  validateMany(files: File[]): Promise<BatchValidationResult>
}
```

#### `validators.ts` - Built-in validators
```typescript
const validators = {
  fileName: (pattern: RegExp) => Validator
  extension: (allowed: string[]) => Validator
  aspectRatio: (options: AspectRatioOptions) => Validator
  noDuplicates: () => Validator
}
```

#### `size.ts` - Size validation
```typescript
validateFileSize(file: File, options: SizeOptions): ValidationResult
```

#### `type.ts` - Type validation
```typescript
validateFileType(file: File, options: TypeOptions): ValidationResult
```

#### `image.ts` - Image validation
```typescript
validateImageDimensions(file: File, options: DimensionOptions): Promise<ValidationResult>
```

### 5. Preview (`src/preview/`)

#### `image-preview.ts` - Preview generation
```typescript
function createImagePreview(
  file: File,
  options?: PreviewOptions
): Promise<{
  url: string
  width: number
  height: number
  revoke: () => void
}>
```

#### `dimensions.ts` - Dimension detection
```typescript
function getImageDimensions(file: File): Promise<{width: number, height: number}>
```

#### `compress.ts` - Image compression
```typescript
function compressImage(file: File, options?: CompressOptions): Promise<File>
```

### 6. Upload (`src/upload/`)

#### `xhr.ts` - XHR upload
```typescript
function uploadWithXHR(
  file: FileItem,
  config: UploaderConfig,
  callbacks: UploadCallbacks
): {
  abort: () => void
  promise: Promise<unknown>
}
```

#### `chunked.ts` - Chunked upload
```typescript
function uploadChunked(
  file: FileItem,
  config: UploaderConfig,
  callbacks: ChunkedCallbacks
): {
  abort: () => void
  pause: () => void
  resume: () => void
  promise: Promise<unknown>
}
```

#### `progress.ts` - Progress calculation
```typescript
function calculateProgress(
  loaded: number,
  total: number,
  startTime: number
): {
  percentage: number
  speed: number
  remainingTime: number
}
```

#### `retry.ts` - Retry logic
```typescript
function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<T>
```

### 7. Core (`src/core/`)

#### `file-item.ts` - FileItem class
```typescript
class FileItemImpl implements FileItem {
  // All FileItem properties
  // Internal update methods
  // Preview management
}
```

#### `uploader.ts` - Main Uploader
```typescript
class UploaderImpl implements Uploader {
  // File management
  // Upload control
  // Event handling
  // Configuration
}
```

#### `drop-zone.ts` - DropZone
```typescript
class DropZoneImpl implements DropZone {
  // DOM event handling
  // File type detection
  // Visual feedback
  // Uploader integration
}
```

#### `queue.ts` - Upload Queue
```typescript
class UploadQueueImpl implements UploadQueue {
  // Queue management
  // Concurrency control
  // Auto-retry
  // Progress aggregation
}
```

#### `config.ts` - Configuration
```typescript
function mergeConfig(userConfig: Partial<UploaderConfig>): UploaderConfig
function validateConfig(config: UploaderConfig): void
```

### 8. React Adapter (`src/adapters/react/`)

#### `context.ts` - React Context
```typescript
const FileKitContext = createContext<FileKitContextValue | null>(null)
```

#### `provider.tsx` - Provider Component
```typescript
function FileKitProvider({ children, ...config }: FileKitProviderProps)
```

#### `hooks/useUploader.ts`
```typescript
function useUploader(config?: UploaderConfig): UseUploaderResult
```

#### `hooks/useDropZone.ts`
```typescript
function useDropZone(config?: DropZoneConfig): UseDropZoneResult
```

#### `hooks/useFileSelect.ts`
```typescript
function useFileSelect(options?: FileSelectOptions): UseFileSelectResult
```

#### `hooks/useImagePreview.ts`
```typescript
function useImagePreview(file: File | null, options?: PreviewOptions): UseImagePreviewResult
```

#### `components/DropZone.tsx`
```typescript
function DropZone(props: DropZoneProps): JSX.Element
```

#### `components/FileInput.tsx`
```typescript
function FileInput(props: FileInputProps): JSX.Element
```

#### `components/FileList.tsx`
```typescript
function FileList(props: FileListProps): JSX.Element
```

#### `components/UploadProgress.tsx`
```typescript
function UploadProgress(props: UploadProgressProps): JSX.Element
```

#### `components/ImagePreview.tsx`
```typescript
function ImagePreview(props: ImagePreviewProps): JSX.Element
```

## State Management

### FileItem State Machine

```
         ┌──────────┐
         │ pending  │
         └────┬─────┘
              │ validate()
         ┌────▼─────┐
         │validating│
         └────┬─────┘
              │ success / failure
    ┌─────────┼─────────┐
    │         │         │
┌───▼───┐ ┌───▼───┐ ┌───▼───┐
│ ready │ │ error │ │cancel │
└───┬───┘ └───────┘ └───────┘
    │ upload()
┌───▼─────┐
│uploading│◄────────┐
└───┬─────┘         │
    │               │ resume()
    ├───────────────┤
    │ pause()       │
┌───▼───┐           │
│paused │───────────┘
└───────┘
    │ complete / error / cancel
┌───▼──────┐  ┌───────┐  ┌────────┐
│processing│  │ error │  │cancelled│
└───┬──────┘  └───────┘  └────────┘
    │
┌───▼─────┐
│completed│
└─────────┘
```

### Uploader State

```typescript
interface UploaderState {
  files: Map<string, FileItem>
  uploading: Set<string>
  paused: Set<string>
  config: UploaderConfig
}
```

### Queue State

```typescript
interface QueueState {
  pending: string[]
  active: Set<string>
  completed: string[]
  failed: string[]
  running: boolean
  paused: boolean
}
```

## Memory Management

### Blob URL Cleanup

```typescript
// Track all created blob URLs
const blobUrls = new Set<string>()

function createBlobUrl(blob: Blob): string {
  const url = URL.createObjectURL(blob)
  blobUrls.add(url)
  return url
}

function revokeBlobUrl(url: string): void {
  URL.revokeObjectURL(url)
  blobUrls.delete(url)
}

// Cleanup on destroy
function destroy(): void {
  blobUrls.forEach(url => URL.revokeObjectURL(url))
  blobUrls.clear()
}
```

### XHR Cleanup

```typescript
// Track active XHRs
const activeXhrs = new Map<string, XMLHttpRequest>()

function uploadFile(file: FileItem): void {
  const xhr = new XMLHttpRequest()
  activeXhrs.set(file.id, xhr)

  xhr.onloadend = () => {
    activeXhrs.delete(file.id)
  }
}

function cancelFile(fileId: string): void {
  const xhr = activeXhrs.get(fileId)
  if (xhr) {
    xhr.abort()
    activeXhrs.delete(fileId)
  }
}
```

## Error Handling Strategy

### Validation Errors
- Thrown synchronously during addFile
- Contains error code and message
- File not added to uploader

### Upload Errors
- Emitted via 'error' event
- File status set to 'error'
- Error attached to file.error
- Can be retried

### Network Errors
- Detected via xhr.onerror
- Automatically retried based on config
- Final failure emits error event

## Performance Optimizations

### 1. Batch Updates
```typescript
// Batch multiple file additions
function addFiles(files: File[]): FileItem[] {
  const items: FileItem[] = []

  // Validate all first
  for (const file of files) {
    items.push(createFileItem(file))
  }

  // Single state update
  this.updateState({ files: [...this.state.files, ...items] })

  // Single event
  this.emit('filesAdded', items)

  return items
}
```

### 2. Debounced Progress
```typescript
// Throttle progress updates to 60fps
const throttledProgress = throttle((progress) => {
  this.emit('progress', progress)
}, 16)
```

### 3. Lazy Preview Loading
```typescript
// Only generate preview when accessed
get preview(): string | undefined {
  if (!this._preview && this._shouldGeneratePreview) {
    this.generatePreview()
  }
  return this._preview
}
```

## Testing Strategy

### Unit Tests
- Each module tested in isolation
- Mock all external dependencies
- Test all branches and edge cases

### Integration Tests
- Complete upload workflows
- Real DOM for DropZone
- Simulated XHR responses

### React Tests
- @testing-library/react
- Test hook behavior
- Component rendering and interactions

### Mocking

```typescript
// Mock XMLHttpRequest
class MockXHR {
  upload = { addEventListener: vi.fn() }
  open = vi.fn()
  send = vi.fn()
  abort = vi.fn()
  setRequestHeader = vi.fn()

  // Simulate progress
  simulateProgress(loaded: number, total: number) {
    this.upload.onprogress({ loaded, total })
  }

  // Simulate completion
  simulateComplete(response: unknown) {
    this.status = 200
    this.responseText = JSON.stringify(response)
    this.onload()
  }
}

// Mock File
function createMockFile(name: string, size: number, type: string): File {
  const blob = new Blob(['x'.repeat(size)], { type })
  return new File([blob], name, { type })
}

// Mock Image
function mockImageLoad(width: number, height: number) {
  Object.defineProperty(Image.prototype, 'src', {
    set(src) {
      setTimeout(() => {
        this.width = width
        this.height = height
        this.onload()
      }, 0)
    }
  })
}
```

## Build Configuration

### tsup.config.ts
```typescript
export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    minify: true,
    treeshake: true,
  },
  {
    entry: ['src/adapters/react/index.ts'],
    outDir: 'dist',
    format: ['esm', 'cjs'],
    dts: true,
    external: ['react'],
    esbuildOptions(options) {
      options.outbase = 'src/adapters'
    },
  },
])
```

### vitest.config.ts
```typescript
export default defineConfig({
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      threshold: {
        lines: 100,
        branches: 100,
        functions: 100,
        statements: 100,
      },
    },
    setupFiles: ['./tests/setup.ts'],
  },
})
```
