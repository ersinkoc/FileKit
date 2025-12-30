# API Reference

Complete API reference for FileKit.

## Core Functions

### createUploader

Creates an uploader instance for managing file uploads.

```typescript
function createUploader(config: UploaderConfig): Uploader
```

#### UploaderConfig

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `endpoint` | `string \| ((file: FileItem) => string)` | **Required** | Upload URL or function returning URL |
| `method` | `string` | `'POST'` | HTTP method |
| `fieldName` | `string` | `'file'` | Form field name for file |
| `headers` | `Record<string, string> \| ((file: FileItem) => Record<string, string>)` | `{}` | Request headers |
| `withCredentials` | `boolean` | `false` | Include cookies in request |
| `timeout` | `number` | `undefined` | Request timeout in ms |
| `maxFileSize` | `number` | `undefined` | Max file size in bytes |
| `minFileSize` | `number` | `undefined` | Min file size in bytes |
| `allowedTypes` | `string[]` | `undefined` | Allowed MIME types (glob patterns supported) |
| `blockedTypes` | `string[]` | `undefined` | Blocked MIME types |
| `maxFiles` | `number` | `undefined` | Max number of files |
| `autoUpload` | `boolean` | `false` | Auto upload when files added |
| `sequential` | `boolean` | `false` | Upload files sequentially |
| `multiple` | `boolean` | `true` | Allow multiple files |
| `generatePreview` | `boolean` | `false` | Generate preview for images |
| `chunked` | `boolean` | `false` | Enable chunked uploads |
| `chunkSize` | `number` | `5242880` | Chunk size in bytes (5MB) |
| `parallelChunks` | `number` | `3` | Number of parallel chunk uploads |
| `retryChunks` | `number` | `3` | Retry attempts per chunk |
| `validators` | `Validator[]` | `[]` | Custom validators |

#### Uploader Methods

```typescript
interface Uploader {
  // File management
  addFile(file: File): FileItem
  addFiles(files: File[] | FileList): FileItem[]
  removeFile(fileId: string): void
  removeAll(): void
  getFile(fileId: string): FileItem | undefined
  getFiles(): FileItem[]
  getFilesByStatus(status: FileStatus): FileItem[]

  // Upload control
  upload(fileId?: string): Promise<void>
  uploadAll(): Promise<void>
  pause(fileId?: string): void
  resume(fileId?: string): void
  cancel(fileId?: string): void
  retry(fileId?: string): void

  // State
  isUploading(): boolean
  isPaused(): boolean
  getProgress(): OverallProgress

  // Chunked upload state
  getState(fileId: string): UploadState | undefined
  resumeFromState(fileId: string, state: UploadState): void

  // Events
  on<E extends UploaderEvent>(event: E, handler: UploaderEventHandler<E>): () => void
  off<E extends UploaderEvent>(event: E, handler: UploaderEventHandler<E>): void

  // Configuration
  setConfig(config: Partial<UploaderConfig>): void
  getConfig(): UploaderConfig

  // Cleanup
  destroy(): void
}
```

#### Uploader Events

| Event | Payload | Description |
|-------|---------|-------------|
| `add` | `FileItem` | File added |
| `remove` | `FileItem` | File removed |
| `start` | `FileItem` | Upload started |
| `progress` | `UploadProgress` | Upload progress updated |
| `complete` | `FileItem, response` | Upload completed |
| `error` | `FileItem, UploadError` | Upload failed |
| `cancel` | `FileItem` | Upload cancelled |
| `pause` | `FileItem` | Upload paused |
| `resume` | `FileItem` | Upload resumed |
| `allComplete` | `FileItem[]` | All uploads completed |
| `chunkComplete` | `FileItem, chunkIndex, totalChunks` | Chunk uploaded |

---

### createDropZone

Creates a drop zone attached to a DOM element.

```typescript
function createDropZone(element: HTMLElement, config: DropZoneConfig): DropZone
```

#### DropZone Methods

```typescript
interface DropZone {
  uploader: Uploader
  isDragActive(): boolean
  isDragAccept(): boolean
  isDragReject(): boolean
  open(): void
  destroy(): void
}
```

---

### createUploadQueue

Creates a queue for managing concurrent uploads.

```typescript
function createUploadQueue(config: UploadQueueConfig): UploadQueue
```

#### UploadQueueConfig

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `endpoint` | `string` | **Required** | Upload URL |
| `concurrent` | `number` | `3` | Max concurrent uploads |
| `autoStart` | `boolean` | `true` | Start queue automatically |

---

### createValidator

Creates a custom validator.

```typescript
function createValidator(
  name: string,
  validate: (file: File, existingFiles: FileItem[]) => Promise<void> | void
): Validator
```

---

## Preview Functions

### createImagePreview

Creates a preview URL for an image file.

```typescript
function createImagePreview(
  file: File,
  options?: PreviewOptions
): Promise<string>
```

#### PreviewOptions

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `maxWidth` | `number` | `200` | Max preview width |
| `maxHeight` | `number` | `200` | Max preview height |
| `quality` | `number` | `0.8` | JPEG quality (0-1) |

---

### getImageDimensions

Gets the dimensions of an image file.

```typescript
function getImageDimensions(file: File): Promise<{ width: number; height: number }>
```

---

### compressImage

Compresses an image file.

```typescript
function compressImage(
  file: File,
  options?: CompressOptions
): Promise<File>
```

#### CompressOptions

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `maxWidth` | `number` | `1920` | Max output width |
| `maxHeight` | `number` | `1080` | Max output height |
| `quality` | `number` | `0.8` | Output quality (0-1) |
| `type` | `string` | `'image/jpeg'` | Output MIME type |

---

## Utility Functions

### File Type Checks

```typescript
function isImage(file: File): boolean
function isVideo(file: File): boolean
function isAudio(file: File): boolean
function isDocument(file: File): boolean
function getFileExtension(filename: string): string
function getMimeType(filename: string): string
```

### File Size

```typescript
function formatFileSize(bytes: number, options?: FormatOptions): string
function parseFileSize(str: string): number
```

### File Reading

```typescript
function readAsDataURL(file: File): Promise<string>
function readAsText(file: File, encoding?: string): Promise<string>
function readAsArrayBuffer(file: File): Promise<ArrayBuffer>
```

---

## Types

### FileItem

```typescript
interface FileItem {
  id: string
  file: File
  name: string
  size: number
  type: string
  extension: string
  status: FileStatus
  progress: number
  uploadedBytes: number
  startedAt?: Date
  completedAt?: Date
  error?: UploadError
  response?: unknown
  metadata: Record<string, unknown>
  preview?: string
  chunks?: ChunkInfo[]
  currentChunk?: number
  totalChunks?: number
}
```

### FileStatus

```typescript
type FileStatus =
  | 'pending'
  | 'ready'
  | 'uploading'
  | 'paused'
  | 'completed'
  | 'error'
  | 'cancelled'
```

### UploadProgress

```typescript
interface UploadProgress {
  file: FileItem
  loaded: number
  total: number
  percentage: number
  speed: number
  remainingTime: number
  currentChunk?: number
  totalChunks?: number
}
```

### UploadError

```typescript
interface UploadError extends Error {
  code: ErrorCode
  file?: FileItem
  status?: number
  response?: unknown
}

type ErrorCode =
  | 'FILE_TOO_LARGE'
  | 'FILE_TOO_SMALL'
  | 'INVALID_TYPE'
  | 'MAX_FILES_EXCEEDED'
  | 'INVALID_DIMENSIONS'
  | 'VALIDATION_FAILED'
  | 'NETWORK_ERROR'
  | 'SERVER_ERROR'
  | 'TIMEOUT'
  | 'CANCELLED'
```
