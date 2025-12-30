// ============ FILE STATUS ============

export type FileStatus =
  | 'pending'
  | 'validating'
  | 'ready'
  | 'uploading'
  | 'processing'
  | 'completed'
  | 'error'
  | 'cancelled'
  | 'paused'

// ============ FILE CATEGORY ============

export type FileCategory = 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other'

// ============ CHUNK INFO ============

export interface ChunkInfo {
  index: number
  start: number
  end: number
  size: number
  uploaded: boolean
  retries: number
}

// ============ FILE ITEM ============

export interface FileItem {
  readonly id: string
  readonly file: File
  readonly name: string
  readonly size: number
  readonly type: string

  // Status
  status: FileStatus
  progress: number
  uploadedBytes: number

  // Image specific
  width?: number
  height?: number
  preview?: string

  // Chunk info
  chunks?: ChunkInfo[]
  currentChunk?: number
  totalChunks?: number

  // Response
  response?: unknown
  error?: UploadError

  // Metadata
  metadata: Record<string, unknown>

  // Timestamps
  readonly addedAt: Date
  startedAt?: Date
  completedAt?: Date
}

// ============ UPLOAD PROGRESS ============

export interface UploadProgress {
  file: FileItem
  loaded: number
  total: number
  percentage: number
  speed: number
  remainingTime: number

  // Chunk info (if chunked)
  currentChunk?: number
  totalChunks?: number
}

export interface OverallProgress {
  totalFiles: number
  completedFiles: number
  failedFiles: number
  totalBytes: number
  uploadedBytes: number
  percentage: number
  speed: number
  remainingTime: number
}

// ============ UPLOAD ERROR ============

export type UploadErrorCode =
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
  | 'CHUNK_FAILED'
  | 'UNKNOWN'

export interface UploadError extends Error {
  code: UploadErrorCode
  file?: FileItem
  response?: unknown
  statusCode?: number
}

// ============ VALIDATOR ============

export interface Validator {
  name: string
  validate: (file: File, existingFiles: FileItem[]) => void | Promise<void>
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

export interface ValidationError {
  code: string
  message: string
  file: File
}

export interface BatchValidationResult {
  valid: FileItem[]
  invalid: Array<{ file: File; errors: ValidationError[] }>
}

// ============ PREVIEW OPTIONS ============

export interface PreviewOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  type?: 'image/jpeg' | 'image/png' | 'image/webp'
}

export interface ImagePreviewResult {
  url: string
  width: number
  height: number
  revoke: () => void
}

export interface ImageDimensions {
  width: number
  height: number
}

// ============ COMPRESS OPTIONS ============

export interface CompressOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  type?: 'image/jpeg' | 'image/png' | 'image/webp'
}

// ============ UPLOADER CONFIG ============

export interface UploaderConfig {
  // Endpoint
  endpoint: string | ((file: FileItem) => string)

  // Request options
  method?: 'POST' | 'PUT' | 'PATCH'
  headers?: Record<string, string> | ((file: FileItem) => Record<string, string>)
  fieldName?: string
  withCredentials?: boolean
  timeout?: number

  // Validation
  maxFileSize?: number
  minFileSize?: number
  maxFiles?: number
  allowedTypes?: string[]
  blockedTypes?: string[]
  validators?: Validator[]

  // Image validation
  maxImageWidth?: number
  maxImageHeight?: number
  minImageWidth?: number
  minImageHeight?: number

  // Preview
  generatePreview?: boolean
  previewOptions?: PreviewOptions

  // Chunked upload
  chunked?: boolean
  chunkSize?: number
  parallelChunks?: number
  retryChunks?: number
  chunkEndpoint?: string
  mergeEndpoint?: string

  // Behavior
  autoUpload?: boolean
  sequential?: boolean

  // Transform
  transformFile?: (file: File) => File | Promise<File>
  transformRequest?: (formData: FormData, file: FileItem) => FormData

  // Callbacks
  onAdd?: (file: FileItem) => void | boolean | Promise<boolean>
  onRemove?: (file: FileItem) => void
  onProgress?: (progress: UploadProgress) => void
  onComplete?: (file: FileItem, response: unknown) => void
  onError?: (file: FileItem, error: UploadError) => void
  onAllComplete?: (files: FileItem[]) => void
}

// ============ UPLOADER INSTANCE ============

export interface Uploader {
  // Add files
  addFile(file: File): FileItem
  addFiles(files: File[] | FileList): FileItem[]

  // Remove files
  removeFile(fileId: string): void
  removeAll(): void

  // Upload
  upload(fileId?: string): Promise<void>
  uploadAll(): Promise<void>

  // Control
  pause(fileId?: string): void
  resume(fileId?: string): void
  cancel(fileId?: string): void
  retry(fileId?: string): void

  // Query
  getFile(fileId: string): FileItem | undefined
  getFiles(): FileItem[]
  getFilesByStatus(status: FileStatus): FileItem[]

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

// ============ UPLOADER EVENTS ============

export type UploaderEvent =
  | 'add'
  | 'remove'
  | 'start'
  | 'progress'
  | 'complete'
  | 'error'
  | 'pause'
  | 'resume'
  | 'cancel'
  | 'allComplete'
  | 'chunkComplete'

export type UploaderEventMap = {
  add: [file: FileItem]
  remove: [file: FileItem]
  start: [file: FileItem]
  progress: [progress: UploadProgress]
  complete: [file: FileItem, response: unknown]
  error: [file: FileItem, error: UploadError]
  pause: [file: FileItem]
  resume: [file: FileItem]
  cancel: [file: FileItem]
  allComplete: [files: FileItem[]]
  chunkComplete: [file: FileItem, chunkIndex: number, totalChunks: number]
}

export type UploaderEventHandler<E extends UploaderEvent> = (
  ...args: UploaderEventMap[E]
) => void

// ============ UPLOAD STATE ============

export interface UploadState {
  fileId: string
  fileName: string
  fileSize: number
  uploadedBytes: number
  chunks: ChunkInfo[]
  metadata: Record<string, unknown>
}

// ============ DROP ZONE CONFIG ============

export interface DropZoneConfig extends UploaderConfig {
  // Drop zone specific
  multiple?: boolean
  clickable?: boolean
  acceptDirectories?: boolean

  // Visual feedback
  activeClass?: string
  acceptClass?: string
  rejectClass?: string

  // Callbacks
  onDragEnter?: (event: DragEvent) => void
  onDragOver?: (event: DragEvent) => void
  onDragLeave?: (event: DragEvent) => void
  onDrop?: (files: FileItem[], event: DragEvent) => void
}

// ============ DROP ZONE INSTANCE ============

export interface DropZone {
  readonly uploader: Uploader

  // State
  isDragActive(): boolean
  isDragAccept(): boolean
  isDragReject(): boolean

  // Manual trigger
  open(): void

  // Cleanup
  destroy(): void
}

// ============ QUEUE CONFIG ============

export interface QueueConfig extends UploaderConfig {
  concurrent?: number
  autoStart?: boolean
  retries?: number
  retryDelay?: number
}

// ============ QUEUE INSTANCE ============

export interface UploadQueue {
  // Add files
  add(file: File): FileItem
  addMany(files: File[] | FileList): FileItem[]

  // Control
  start(): void
  pause(): void
  resume(): void
  clear(): void

  // Query
  getQueue(): FileItem[]
  getPending(): FileItem[]
  getCompleted(): FileItem[]
  getFailed(): FileItem[]

  // State
  isRunning(): boolean
  isPaused(): boolean
  getProgress(): OverallProgress

  // Events
  on<E extends QueueEvent>(event: E, handler: QueueEventHandler<E>): () => void
  off<E extends QueueEvent>(event: E, handler: QueueEventHandler<E>): void

  // Cleanup
  destroy(): void
}

// ============ QUEUE EVENTS ============

export type QueueEvent =
  | 'start'
  | 'pause'
  | 'resume'
  | 'progress'
  | 'fileStart'
  | 'fileComplete'
  | 'fileError'
  | 'complete'

export type QueueEventMap = {
  start: []
  pause: []
  resume: []
  progress: [progress: OverallProgress]
  fileStart: [file: FileItem]
  fileComplete: [file: FileItem, response: unknown]
  fileError: [file: FileItem, error: UploadError]
  complete: [files: FileItem[]]
}

export type QueueEventHandler<E extends QueueEvent> = (...args: QueueEventMap[E]) => void

// ============ VALIDATOR CONFIG ============

export interface ValidatorConfig {
  maxFileSize?: number
  minFileSize?: number
  allowedTypes?: string[]
  blockedTypes?: string[]
  maxImageWidth?: number
  maxImageHeight?: number
  minImageWidth?: number
  minImageHeight?: number
  validators?: Validator[]
}

// ============ SIZE VALIDATION OPTIONS ============

export interface SizeValidationOptions {
  min?: number
  max?: number
}

// ============ TYPE VALIDATION OPTIONS ============

export interface TypeValidationOptions {
  allowed?: string[]
  blocked?: string[]
}

// ============ DIMENSION VALIDATION OPTIONS ============

export interface DimensionValidationOptions {
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
}

// ============ ASPECT RATIO OPTIONS ============

export interface AspectRatioOptions {
  min?: number
  max?: number
  exact?: number
}

// ============ UPLOAD CALLBACKS ============

export interface UploadCallbacks {
  onProgress?: (loaded: number, total: number) => void
  onComplete?: (response: unknown) => void
  onError?: (error: UploadError) => void
}

export interface ChunkedUploadCallbacks extends UploadCallbacks {
  onChunkComplete?: (chunkIndex: number, totalChunks: number) => void
  onPause?: () => void
  onResume?: () => void
}

// ============ XHR UPLOAD RESULT ============

export interface XHRUploadHandle {
  abort: () => void
  promise: Promise<unknown>
}

// ============ CHUNKED UPLOAD HANDLE ============

export interface ChunkedUploadHandle {
  abort: () => void
  pause: () => void
  resume: () => void
  promise: Promise<unknown>
}

// ============ RETRY OPTIONS ============

export interface RetryOptions {
  maxRetries: number
  delay: number
  shouldRetry?: (error: unknown, attempt: number) => boolean
}
