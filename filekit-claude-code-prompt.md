# FileKit - Zero-Dependency File Uploads with Drag & Drop and Chunked Transfer

## Package Identity

- **NPM Package**: `@oxog/filekit`
- **GitHub Repository**: `https://github.com/ersinkoc/filekit`
- **Documentation Site**: `https://filekit.oxog.dev`
- **License**: MIT
- **Author**: Ersin KOÇ
- **Created**: 2025-12-29

**NO social media, Discord, email, or external links.**

## Package Description

Zero-dependency file upload toolkit with drag & drop, chunked transfers, and progress tracking.

FileKit is a lightweight library for managing file uploads in web applications. Features file upload with real-time progress tracking, drag and drop zones with visual feedback, multiple file selection, comprehensive file validation (type, size, image dimensions), automatic image preview generation, chunked uploads for large files with parallel transfer, resume interrupted uploads, upload queue with concurrency control, pause/resume/cancel functionality, retry failed uploads, image compression before upload, and comprehensive React integration with useUploader, useDropZone, useFileSelect, useImagePreview hooks and DropZone, FileInput, FileList, UploadProgress, ImagePreview components—all under 4KB with zero runtime dependencies.

---

## NON-NEGOTIABLE RULES

These rules are ABSOLUTE and must be followed without exception:

### 1. ZERO DEPENDENCIES
```json
{
  "dependencies": {}  // MUST BE EMPTY - NO EXCEPTIONS
}
```
Implement EVERYTHING from scratch. No runtime dependencies allowed.

### 2. 100% TEST COVERAGE & 100% SUCCESS RATE
- Every line of code must be tested
- Every branch must be tested
- All tests must pass (100% success rate)
- Use Vitest for testing
- Coverage report must show 100%

### 3. DEVELOPMENT WORKFLOW
Create these documents FIRST, before any code:
1. **SPECIFICATION.md** - Complete package specification
2. **IMPLEMENTATION.md** - Architecture and design decisions
3. **TASKS.md** - Ordered task list with dependencies

Only after these documents are complete, implement the code following TASKS.md sequentially.

### 4. TYPESCRIPT STRICT MODE
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true
  }
}
```

### 5. NO EXTERNAL LINKS
- ❌ No social media (Twitter, LinkedIn, etc.)
- ❌ No Discord/Slack links
- ❌ No email addresses
- ❌ No donation/sponsor links
- ✅ Only GitHub repo and documentation site allowed

### 6. BUNDLE SIZE TARGET
- Core package: < 4KB minified + gzipped
- With React adapter: < 6KB
- Tree-shakeable

---

## CORE TYPES

```typescript
// ============ FILE STATUS ============

type FileStatus =
  | 'pending'
  | 'validating'
  | 'ready'
  | 'uploading'
  | 'processing'
  | 'completed'
  | 'error'
  | 'cancelled'
  | 'paused'

// ============ FILE ITEM ============

interface FileItem {
  id: string
  file: File
  name: string
  size: number
  type: string
  
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
  addedAt: Date
  startedAt?: Date
  completedAt?: Date
}

interface ChunkInfo {
  index: number
  start: number
  end: number
  size: number
  uploaded: boolean
  retries: number
}

// ============ UPLOAD PROGRESS ============

interface UploadProgress {
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

interface OverallProgress {
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

interface UploadError extends Error {
  code: UploadErrorCode
  file?: FileItem
  response?: unknown
  statusCode?: number
}

type UploadErrorCode =
  | 'FILE_TOO_LARGE'
  | 'FILE_TOO_SMALL'
  | 'INVALID_TYPE'
  | 'MAX_FILES_EXCEEDED'
  | 'INVALID_DIMENSIONS'
  | 'VALIDATION_FAILED'
  | 'NETWORK_ERROR'
  | 'SERVER_ERROR'
  | 'CANCELLED'
  | 'CHUNK_FAILED'
  | 'UNKNOWN'

// ============ VALIDATOR ============

interface Validator {
  name: string
  validate: (file: File, existingFiles: FileItem[]) => void | Promise<void>
}

interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

interface ValidationError {
  code: string
  message: string
  file: File
}

// ============ UPLOADER CONFIG ============

interface UploaderConfig {
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

// ============ PREVIEW OPTIONS ============

interface PreviewOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  type?: 'image/jpeg' | 'image/png' | 'image/webp'
}

// ============ UPLOADER INSTANCE ============

interface Uploader {
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
  on<E extends UploaderEvent>(event: E, handler: EventHandler<E>): () => void
  off<E extends UploaderEvent>(event: E, handler: EventHandler<E>): void
  
  // Configuration
  setConfig(config: Partial<UploaderConfig>): void
  getConfig(): UploaderConfig
  
  // Cleanup
  destroy(): void
}

type UploaderEvent =
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

interface UploadState {
  fileId: string
  fileName: string
  fileSize: number
  uploadedBytes: number
  chunks: ChunkInfo[]
  metadata: Record<string, unknown>
}

// ============ DROP ZONE CONFIG ============

interface DropZoneConfig extends UploaderConfig {
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

interface DropZone {
  uploader: Uploader
  
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

interface QueueConfig extends UploaderConfig {
  concurrent?: number
  autoStart?: boolean
  retries?: number
  retryDelay?: number
}

// ============ QUEUE INSTANCE ============

interface UploadQueue {
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
  on<E extends QueueEvent>(event: E, handler: EventHandler<E>): () => void
  off<E extends QueueEvent>(event: E, handler: EventHandler<E>): void
  
  // Cleanup
  destroy(): void
}

type QueueEvent =
  | 'start'
  | 'pause'
  | 'resume'
  | 'progress'
  | 'fileStart'
  | 'fileComplete'
  | 'fileError'
  | 'complete'
```

---

## FACTORY FUNCTION

```typescript
import { createUploader } from '@oxog/filekit'

// ===== BASIC USAGE =====

const uploader = createUploader({
  endpoint: '/api/upload',
})

// Add and upload file
const fileItem = uploader.addFile(file)
await uploader.upload(fileItem.id)


// ===== FULL CONFIGURATION =====

const uploader = createUploader({
  // Endpoint
  endpoint: '/api/upload',
  // or dynamic
  endpoint: (file) => `/api/upload/${file.metadata.category}`,
  
  // Request options
  method: 'POST',
  headers: {
    'Authorization': 'Bearer token',
  },
  fieldName: 'file',
  withCredentials: true,
  timeout: 60000,
  
  // Validation
  maxFileSize: 10 * 1024 * 1024,  // 10MB
  minFileSize: 1024,              // 1KB
  maxFiles: 10,
  allowedTypes: ['image/*', 'application/pdf'],
  blockedTypes: ['application/exe'],
  
  // Image validation
  maxImageWidth: 4000,
  maxImageHeight: 4000,
  minImageWidth: 100,
  minImageHeight: 100,
  
  // Preview
  generatePreview: true,
  previewOptions: {
    maxWidth: 200,
    maxHeight: 200,
    quality: 0.8,
  },
  
  // Chunked upload
  chunked: true,
  chunkSize: 1024 * 1024,  // 1MB
  parallelChunks: 3,
  retryChunks: 3,
  
  // Behavior
  autoUpload: false,
  sequential: false,
  
  // Transform
  transformFile: async (file) => {
    if (file.type.startsWith('image/')) {
      return await compressImage(file, { quality: 0.8 })
    }
    return file
  },
  
  transformRequest: (formData, file) => {
    formData.append('metadata', JSON.stringify(file.metadata))
    return formData
  },
  
  // Callbacks
  onAdd: (file) => {
    console.log('File added:', file.name)
    return true  // Return false to reject
  },
  
  onRemove: (file) => {
    console.log('File removed:', file.name)
  },
  
  onProgress: (progress) => {
    console.log(`${progress.file.name}: ${progress.percentage}%`)
    console.log(`Speed: ${formatFileSize(progress.speed)}/s`)
    console.log(`Remaining: ${progress.remainingTime}s`)
  },
  
  onComplete: (file, response) => {
    console.log('Completed:', file.name, response)
  },
  
  onError: (file, error) => {
    console.error('Error:', file.name, error.message)
  },
  
  onAllComplete: (files) => {
    console.log('All uploads complete:', files.length)
  },
})
```

---

## FILE MANAGEMENT

```typescript
const uploader = createUploader({ endpoint: '/api/upload' })


// ============ ADD FILES ============

// Single file
const fileItem = uploader.addFile(file)

// Multiple files
const fileItems = uploader.addFiles(files)

// From FileList (input.files)
const fileItems = uploader.addFiles(inputElement.files)


// ============ FILE ITEM ============

const file = uploader.getFile(fileId)

file.id           // 'file_abc123'
file.name         // 'document.pdf'
file.size         // 1024000
file.type         // 'application/pdf'
file.status       // 'pending' | 'uploading' | 'completed' | ...
file.progress     // 0-100
file.uploadedBytes // Bytes uploaded so far
file.preview      // Data URL (for images)
file.response     // Server response
file.error        // Error object if failed
file.metadata     // Custom metadata


// ============ QUERY FILES ============

// Get all files
const allFiles = uploader.getFiles()

// Get by status
const pending = uploader.getFilesByStatus('pending')
const uploading = uploader.getFilesByStatus('uploading')
const completed = uploader.getFilesByStatus('completed')
const failed = uploader.getFilesByStatus('error')


// ============ REMOVE FILES ============

// Remove single file
uploader.removeFile(fileId)

// Remove all files
uploader.removeAll()


// ============ ADD METADATA ============

const fileItem = uploader.addFile(file)
fileItem.metadata = {
  category: 'documents',
  description: 'Monthly report',
  tags: ['report', 'finance'],
}
```

---

## UPLOAD CONTROL

```typescript
const uploader = createUploader({ endpoint: '/api/upload' })


// ============ UPLOAD ============

// Upload single file
await uploader.upload(fileId)

// Upload all pending files
await uploader.uploadAll()


// ============ PAUSE / RESUME ============

// Pause single file
uploader.pause(fileId)

// Pause all uploads
uploader.pause()

// Resume single file
uploader.resume(fileId)

// Resume all uploads
uploader.resume()


// ============ CANCEL ============

// Cancel single file
uploader.cancel(fileId)

// Cancel all uploads
uploader.cancel()


// ============ RETRY ============

// Retry failed file
uploader.retry(fileId)

// Retry all failed files
const failed = uploader.getFilesByStatus('error')
failed.forEach(file => uploader.retry(file.id))


// ============ STATE ============

uploader.isUploading()  // true if any file uploading
uploader.isPaused()     // true if all paused

const progress = uploader.getProgress()
// {
//   totalFiles: 5,
//   completedFiles: 2,
//   failedFiles: 0,
//   totalBytes: 5000000,
//   uploadedBytes: 2500000,
//   percentage: 50,
//   speed: 1024000,
//   remainingTime: 2.5
// }
```

---

## EVENTS

```typescript
const uploader = createUploader({ endpoint: '/api/upload' })


// ============ FILE EVENTS ============

// File added
uploader.on('add', (file) => {
  console.log('Added:', file.name)
})

// File removed
uploader.on('remove', (file) => {
  console.log('Removed:', file.name)
})

// Upload started
uploader.on('start', (file) => {
  console.log('Started:', file.name)
})

// Progress update
uploader.on('progress', (progress) => {
  console.log(`${progress.file.name}: ${progress.percentage}%`)
})

// Upload complete
uploader.on('complete', (file, response) => {
  console.log('Complete:', file.name, response)
})

// Upload error
uploader.on('error', (file, error) => {
  console.error('Error:', file.name, error)
})

// Upload paused
uploader.on('pause', (file) => {
  console.log('Paused:', file.name)
})

// Upload resumed
uploader.on('resume', (file) => {
  console.log('Resumed:', file.name)
})

// Upload cancelled
uploader.on('cancel', (file) => {
  console.log('Cancelled:', file.name)
})


// ============ BATCH EVENTS ============

// All uploads complete
uploader.on('allComplete', (files) => {
  console.log('All complete:', files.length, 'files')
})


// ============ CHUNK EVENTS ============

// Chunk upload complete (chunked mode)
uploader.on('chunkComplete', (file, chunkIndex, totalChunks) => {
  console.log(`Chunk ${chunkIndex + 1}/${totalChunks} complete`)
})


// ============ UNSUBSCRIBE ============

const unsubscribe = uploader.on('progress', handler)

// Later...
unsubscribe()

// Or
uploader.off('progress', handler)
```

---

## DROP ZONE

```typescript
import { createDropZone } from '@oxog/filekit'


// ============ BASIC DROP ZONE ============

const dropZone = createDropZone(element, {
  endpoint: '/api/upload',
})

// Access uploader
const files = dropZone.uploader.getFiles()
await dropZone.uploader.uploadAll()


// ============ FULL CONFIGURATION ============

const dropZone = createDropZone(document.getElementById('drop-area'), {
  // Uploader options
  endpoint: '/api/upload',
  maxFileSize: 10 * 1024 * 1024,
  allowedTypes: ['image/*', 'application/pdf'],
  autoUpload: true,
  
  // Drop zone specific
  multiple: true,
  clickable: true,
  acceptDirectories: false,
  
  // Visual feedback classes
  activeClass: 'drop-active',
  acceptClass: 'drop-accept',
  rejectClass: 'drop-reject',
  
  // Callbacks
  onDragEnter: (event) => {
    console.log('Drag entered')
  },
  
  onDragOver: (event) => {
    // Called repeatedly while dragging over
  },
  
  onDragLeave: (event) => {
    console.log('Drag left')
  },
  
  onDrop: (files, event) => {
    console.log('Dropped:', files.length, 'files')
  },
})


// ============ STATE ============

dropZone.isDragActive()  // true if dragging over
dropZone.isDragAccept()  // true if files are acceptable
dropZone.isDragReject()  // true if files are rejected


// ============ PROGRAMMATIC OPEN ============

// Open file dialog
dropZone.open()


// ============ CLEANUP ============

dropZone.destroy()
```

---

## FILE VALIDATION

```typescript
import { createUploader, createValidator, validators } from '@oxog/filekit'


// ============ BUILT-IN VALIDATION ============

const uploader = createUploader({
  endpoint: '/api/upload',
  
  // Size
  maxFileSize: 10 * 1024 * 1024,  // 10MB max
  minFileSize: 1024,              // 1KB min
  
  // Type (supports wildcards)
  allowedTypes: [
    'image/jpeg',
    'image/png',
    'image/*',       // Any image
    'video/*',       // Any video
    'application/pdf',
  ],
  
  // Block specific types
  blockedTypes: [
    'application/x-msdownload',
    'application/exe',
  ],
  
  // Max files
  maxFiles: 10,
  
  // Image dimensions
  maxImageWidth: 4000,
  maxImageHeight: 4000,
  minImageWidth: 100,
  minImageHeight: 100,
})


// ============ BUILT-IN VALIDATORS ============

const uploader = createUploader({
  endpoint: '/api/upload',
  
  validators: [
    // File name pattern
    validators.fileName(/^[a-zA-Z0-9_-]+\.[a-z]+$/),
    
    // File extension
    validators.extension(['jpg', 'jpeg', 'png', 'gif', 'pdf']),
    
    // Aspect ratio (for images)
    validators.aspectRatio({ min: 1, max: 2 }),
    
    // Square images only
    validators.aspectRatio({ exact: 1 }),
    
    // No duplicates
    validators.noDuplicates(),
  ],
})


// ============ CUSTOM VALIDATORS ============

const uploader = createUploader({
  endpoint: '/api/upload',
  
  validators: [
    {
      name: 'custom-check',
      validate: async (file, existingFiles) => {
        // Check file content
        const content = await readFileHeader(file)
        if (!isValidHeader(content)) {
          throw new Error('Invalid file format')
        }
      },
    },
    
    {
      name: 'max-total-size',
      validate: (file, existingFiles) => {
        const totalSize = existingFiles.reduce((sum, f) => sum + f.size, 0)
        if (totalSize + file.size > 100 * 1024 * 1024) {
          throw new Error('Total size exceeds 100MB')
        }
      },
    },
  ],
})


// ============ STANDALONE VALIDATOR ============

const validator = createValidator({
  maxFileSize: 10 * 1024 * 1024,
  allowedTypes: ['image/*'],
  maxImageWidth: 4000,
  maxImageHeight: 4000,
})

// Validate single file
const result = await validator.validate(file)
// { valid: true }
// or
// { valid: false, errors: [{ code: 'FILE_TOO_LARGE', message: '...' }] }

// Validate multiple files
const results = await validator.validateMany(files)
// {
//   valid: FileItem[],
//   invalid: [{ file: File, errors: ValidationError[] }]
// }
```

---

## IMAGE PREVIEW

```typescript
import { 
  createImagePreview, 
  getImageDimensions,
  isImage,
} from '@oxog/filekit'


// ============ CREATE PREVIEW ============

// Basic preview
const preview = await createImagePreview(file)
img.src = preview.url

// With options
const preview = await createImagePreview(file, {
  maxWidth: 200,
  maxHeight: 200,
  quality: 0.8,
  type: 'image/jpeg',
})

// Cleanup when done (revokes object URL)
preview.revoke()


// ============ PREVIEW OBJECT ============

const preview = await createImagePreview(file)

preview.url      // Data URL or Object URL
preview.width    // Preview width
preview.height   // Preview height
preview.revoke() // Cleanup function


// ============ GET DIMENSIONS ============

const { width, height } = await getImageDimensions(file)
console.log(`Image is ${width}x${height}`)


// ============ CHECK IF IMAGE ============

if (isImage(file)) {
  const preview = await createImagePreview(file)
}


// ============ AUTO PREVIEW IN UPLOADER ============

const uploader = createUploader({
  endpoint: '/api/upload',
  
  generatePreview: true,
  previewOptions: {
    maxWidth: 150,
    maxHeight: 150,
    quality: 0.7,
  },
})

uploader.on('add', (file) => {
  if (file.preview) {
    // Preview URL is available
    img.src = file.preview
  }
  
  if (file.width && file.height) {
    // Image dimensions are available
    console.log(`${file.width}x${file.height}`)
  }
})
```

---

## CHUNKED UPLOAD

```typescript
import { createUploader } from '@oxog/filekit'


// ============ ENABLE CHUNKED UPLOAD ============

const uploader = createUploader({
  endpoint: '/api/upload',
  
  // Enable chunked mode
  chunked: true,
  
  // Chunk size (default: 1MB)
  chunkSize: 1024 * 1024,
  
  // Parallel chunks (default: 1)
  parallelChunks: 3,
  
  // Retry failed chunks
  retryChunks: 3,
  
  // Optional: Different endpoints
  chunkEndpoint: '/api/upload/chunk',
  mergeEndpoint: '/api/upload/merge',
})


// ============ CHUNK PROGRESS ============

uploader.on('progress', (progress) => {
  console.log('File:', progress.file.name)
  console.log('Overall:', progress.percentage + '%')
  console.log('Chunk:', progress.currentChunk, '/', progress.totalChunks)
})

uploader.on('chunkComplete', (file, chunkIndex, totalChunks) => {
  console.log(`Chunk ${chunkIndex + 1}/${totalChunks} uploaded`)
})


// ============ CHUNK INFO ============

const file = uploader.getFile(fileId)

file.chunks       // Array of ChunkInfo
file.currentChunk // Current chunk index
file.totalChunks  // Total chunks

// ChunkInfo
// {
//   index: 0,
//   start: 0,
//   end: 1048576,
//   size: 1048576,
//   uploaded: true,
//   retries: 0
// }


// ============ RESUME INTERRUPTED UPLOAD ============

// Save state before page unload
window.addEventListener('beforeunload', () => {
  const files = uploader.getFilesByStatus('uploading')
  files.forEach(file => {
    const state = uploader.getState(file.id)
    localStorage.setItem(`upload_${file.id}`, JSON.stringify(state))
  })
})

// Resume on page load
const savedState = localStorage.getItem('upload_file123')
if (savedState) {
  const state = JSON.parse(savedState)
  
  // Need to re-add the file first
  const fileItem = uploader.addFile(originalFile)
  
  // Then resume from saved state
  uploader.resumeFromState(fileItem.id, state)
  await uploader.upload(fileItem.id)
}


// ============ SERVER-SIDE HANDLING ============

// Chunk endpoint receives:
// - file: Blob (chunk data)
// - chunkIndex: number
// - totalChunks: number
// - fileId: string
// - fileName: string
// - fileSize: number

// Merge endpoint receives:
// - fileId: string
// - fileName: string
// - totalChunks: number
```

---

## UPLOAD QUEUE

```typescript
import { createUploadQueue } from '@oxog/filekit'


// ============ CREATE QUEUE ============

const queue = createUploadQueue({
  endpoint: '/api/upload',
  
  // Concurrency
  concurrent: 3,
  
  // Auto-start when files added
  autoStart: true,
  
  // Retry configuration
  retries: 3,
  retryDelay: 1000,
  
  // Other uploader options...
  maxFileSize: 10 * 1024 * 1024,
  allowedTypes: ['image/*'],
})


// ============ ADD FILES ============

// Add single file
const fileItem = queue.add(file)

// Add multiple files
const fileItems = queue.addMany(files)


// ============ CONTROL ============

// Start queue (if autoStart: false)
queue.start()

// Pause queue
queue.pause()

// Resume queue
queue.resume()

// Clear queue (remove all pending)
queue.clear()


// ============ QUERY ============

// Get all files in queue
const allFiles = queue.getQueue()

// Get by status
const pending = queue.getPending()
const completed = queue.getCompleted()
const failed = queue.getFailed()


// ============ STATE ============

queue.isRunning()  // true if uploading
queue.isPaused()   // true if paused

const progress = queue.getProgress()


// ============ EVENTS ============

queue.on('start', () => {
  console.log('Queue started')
})

queue.on('pause', () => {
  console.log('Queue paused')
})

queue.on('resume', () => {
  console.log('Queue resumed')
})

queue.on('progress', (progress) => {
  console.log(`Overall: ${progress.percentage}%`)
})

queue.on('fileStart', (file) => {
  console.log('Uploading:', file.name)
})

queue.on('fileComplete', (file, response) => {
  console.log('Completed:', file.name)
})

queue.on('fileError', (file, error) => {
  console.error('Failed:', file.name, error)
})

queue.on('complete', (files) => {
  console.log('All done!', files.length, 'files uploaded')
})


// ============ CLEANUP ============

queue.destroy()
```

---

## REACT INTEGRATION

```tsx
import {
  // Provider
  FileKitProvider,
  
  // Hooks
  useUploader,
  useDropZone,
  useFileSelect,
  useImagePreview,
  
  // Components
  DropZone,
  FileInput,
  FileList,
  UploadProgress,
  ImagePreview,
} from '@oxog/filekit/react'


// ============ PROVIDER ============

function App() {
  return (
    <FileKitProvider
      endpoint="/api/upload"
      maxFileSize={10 * 1024 * 1024}
      allowedTypes={['image/*', 'application/pdf']}
      generatePreview
    >
      <MyApp />
    </FileKitProvider>
  )
}


// ============ useUploader HOOK ============

function FileUploader() {
  const {
    // Files
    files,
    addFile,
    addFiles,
    removeFile,
    removeAll,
    
    // Upload
    upload,
    uploadAll,
    
    // Control
    pause,
    resume,
    cancel,
    retry,
    
    // State
    isUploading,
    isPaused,
    progress,
    
    // Config
    setConfig,
  } = useUploader({
    endpoint: '/api/upload',
    autoUpload: false,
    onComplete: (file) => {
      console.log('Uploaded:', file.name)
    },
    onError: (file, error) => {
      console.error('Error:', error)
    },
  })
  
  const handleFiles = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files))
    }
  }
  
  return (
    <div>
      <input type="file" multiple onChange={handleFiles} />
      
      <ul>
        {files.map(file => (
          <li key={file.id}>
            {file.preview && (
              <img src={file.preview} alt="" width={50} />
            )}
            <span>{file.name}</span>
            <span>{file.status}</span>
            {file.status === 'uploading' && (
              <progress value={file.progress} max={100} />
            )}
            <button onClick={() => removeFile(file.id)}>Remove</button>
          </li>
        ))}
      </ul>
      
      <div>
        <button onClick={uploadAll} disabled={isUploading}>
          Upload All
        </button>
        {isUploading && (
          <>
            <button onClick={() => pause()}>Pause</button>
            <button onClick={() => cancel()}>Cancel</button>
          </>
        )}
        {isPaused && (
          <button onClick={() => resume()}>Resume</button>
        )}
      </div>
      
      <div>
        Overall: {progress.percentage}% ({progress.completedFiles}/{progress.totalFiles})
      </div>
    </div>
  )
}


// ============ useDropZone HOOK ============

function DropUploader() {
  const {
    // Props to spread
    getRootProps,
    getInputProps,
    
    // State
    isDragActive,
    isDragAccept,
    isDragReject,
    
    // Files
    files,
    
    // Open dialog
    open,
    
    // Uploader access
    uploader,
  } = useDropZone({
    endpoint: '/api/upload',
    allowedTypes: ['image/*'],
    maxFiles: 10,
    autoUpload: true,
  })
  
  return (
    <div
      {...getRootProps()}
      className={`
        dropzone
        ${isDragActive ? 'active' : ''}
        ${isDragAccept ? 'accept' : ''}
        ${isDragReject ? 'reject' : ''}
      `}
    >
      <input {...getInputProps()} />
      
      {isDragActive ? (
        isDragAccept ? (
          <p>Drop files here...</p>
        ) : (
          <p>These files are not accepted</p>
        )
      ) : (
        <p>Drag & drop files, or click to select</p>
      )}
      
      {files.length > 0 && (
        <ul>
          {files.map(file => (
            <li key={file.id}>
              {file.name} - {file.status}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}


// ============ useFileSelect HOOK ============

function SelectButton() {
  const {
    open,
    files,
    clear,
  } = useFileSelect({
    multiple: true,
    accept: 'image/*',
    onSelect: (files) => {
      console.log('Selected:', files)
    },
  })
  
  return (
    <div>
      <button onClick={open}>
        Select Files ({files.length})
      </button>
      {files.length > 0 && (
        <button onClick={clear}>Clear</button>
      )}
    </div>
  )
}


// ============ useImagePreview HOOK ============

function ImageUploader() {
  const [file, setFile] = useState<File | null>(null)
  
  const {
    preview,
    isLoading,
    error,
    dimensions,
  } = useImagePreview(file, {
    maxWidth: 300,
    maxHeight: 300,
  })
  
  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={e => setFile(e.target.files?.[0] || null)}
      />
      
      {isLoading && <div>Loading preview...</div>}
      
      {error && <div className="error">{error.message}</div>}
      
      {preview && (
        <div>
          <img src={preview} alt="Preview" />
          {dimensions && (
            <p>{dimensions.width} × {dimensions.height}</p>
          )}
        </div>
      )}
    </div>
  )
}
```

---

## REACT COMPONENTS

```tsx
// ============ DropZone COMPONENT ============

<DropZone
  endpoint="/api/upload"
  allowedTypes={['image/*']}
  maxFiles={10}
  maxFileSize={5 * 1024 * 1024}
  autoUpload
  
  onFilesAdded={(files) => console.log('Added:', files)}
  onUploadStart={(file) => console.log('Started:', file.name)}
  onUploadProgress={(progress) => console.log(progress.percentage)}
  onUploadComplete={(file, response) => console.log('Done:', file.name)}
  onUploadError={(file, error) => console.error(error)}
  onAllComplete={(files) => console.log('All done!')}
  
  className="my-dropzone"
  activeClassName="dragging"
  acceptClassName="accepting"
  rejectClassName="rejecting"
>
  {({ isDragActive, isDragAccept, files, progress }) => (
    <div className="dropzone-content">
      {isDragActive ? (
        isDragAccept ? (
          <p>Drop files here!</p>
        ) : (
          <p>File type not accepted</p>
        )
      ) : (
        <>
          <UploadIcon />
          <p>Drag & drop or click to upload</p>
          <p className="hint">Max 10 files, 5MB each</p>
        </>
      )}
      
      {files.length > 0 && (
        <FileList files={files} showProgress showPreview />
      )}
    </div>
  )}
</DropZone>


// ============ FileInput COMPONENT ============

<FileInput
  multiple
  accept="image/*,application/pdf"
  maxFiles={5}
  maxFileSize={10 * 1024 * 1024}
  onChange={(files) => setSelectedFiles(files)}
  onError={(errors) => setErrors(errors)}
>
  <button className="select-button">
    <FolderIcon />
    Select Files
  </button>
</FileInput>

// Or as styled input
<FileInput
  accept="image/*"
  className="styled-input"
  placeholder="Choose an image..."
/>


// ============ FileList COMPONENT ============

<FileList
  files={files}
  
  // Display options
  showPreview
  showSize
  showProgress
  showStatus
  
  // Actions
  onRemove={(file) => removeFile(file.id)}
  onRetry={(file) => retry(file.id)}
  onCancel={(file) => cancel(file.id)}
  
  // Customization
  previewSize={60}
  className="file-list"
  itemClassName="file-item"
  
  // Custom render
  renderItem={(file, actions) => (
    <div className="custom-item">
      {file.preview && <img src={file.preview} />}
      <span>{file.name}</span>
      <button onClick={actions.remove}>×</button>
    </div>
  )}
/>


// ============ UploadProgress COMPONENT ============

<UploadProgress
  progress={progress}
  
  // Display options
  showPercentage
  showSpeed
  showRemaining
  showFileCount
  showBytes
  
  // Customization
  className="upload-progress"
  barClassName="progress-bar"
/>

// Minimal
<UploadProgress progress={progress} />

// Detailed
<UploadProgress
  progress={progress}
  showPercentage
  showSpeed
  showRemaining
  showFileCount
/>


// ============ ImagePreview COMPONENT ============

<ImagePreview
  file={file}
  
  // Size
  maxWidth={200}
  maxHeight={200}
  
  // Quality
  quality={0.8}
  
  // Fallback
  fallback={<Placeholder />}
  
  // Loading
  loading={<Spinner />}
  
  // Callbacks
  onLoad={(dimensions) => console.log(dimensions)}
  onError={(error) => console.error(error)}
  
  // Customization
  className="image-preview"
  alt="Preview"
/>
```

---

## UTILITY FUNCTIONS

```typescript
import {
  // Size
  formatFileSize,
  parseFileSize,
  
  // Type checking
  isImage,
  isVideo,
  isAudio,
  isPDF,
  getFileExtension,
  getMimeType,
  getFileCategory,
  
  // File reading
  readAsDataURL,
  readAsText,
  readAsArrayBuffer,
  readAsJSON,
  
  // Image utilities
  getImageDimensions,
  createImagePreview,
  compressImage,
  
  // Validation
  validateFileSize,
  validateFileType,
  validateImageDimensions,
} from '@oxog/filekit'


// ============ SIZE FORMATTING ============

formatFileSize(1024)              // '1 KB'
formatFileSize(1536000)           // '1.46 MB'
formatFileSize(1073741824)        // '1 GB'
formatFileSize(1099511627776)     // '1 TB'

parseFileSize('10 MB')            // 10485760
parseFileSize('1.5GB')            // 1610612736
parseFileSize('500KB')            // 512000


// ============ TYPE CHECKING ============

isImage(file)       // true if image/*
isVideo(file)       // true if video/*
isAudio(file)       // true if audio/*
isPDF(file)         // true if application/pdf

getFileExtension('document.pdf')     // 'pdf'
getFileExtension(file)               // 'jpg'

getMimeType('pdf')                   // 'application/pdf'
getMimeType('jpg')                   // 'image/jpeg'
getMimeType('mp4')                   // 'video/mp4'

getFileCategory(file)                // 'image' | 'video' | 'audio' | 'document' | 'other'


// ============ FILE READING ============

// As data URL
const dataUrl = await readAsDataURL(file)

// As text
const text = await readAsText(file)
const text = await readAsText(file, 'utf-8')

// As array buffer
const buffer = await readAsArrayBuffer(file)

// As JSON
const data = await readAsJSON(file)


// ============ IMAGE UTILITIES ============

// Get dimensions
const { width, height } = await getImageDimensions(file)

// Create preview
const preview = await createImagePreview(file, {
  maxWidth: 200,
  maxHeight: 200,
  quality: 0.8,
})

// Compress image
const compressed = await compressImage(file, {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.8,
  type: 'image/jpeg',
})
// Returns new File object


// ============ VALIDATION ============

// Size
const sizeResult = validateFileSize(file, {
  min: 1024,
  max: 10 * 1024 * 1024,
})
// { valid: true } or { valid: false, error: 'File too large' }

// Type
const typeResult = validateFileType(file, {
  allowed: ['image/*', 'application/pdf'],
  blocked: ['image/gif'],
})

// Image dimensions
const dimResult = await validateImageDimensions(file, {
  minWidth: 100,
  minHeight: 100,
  maxWidth: 4000,
  maxHeight: 4000,
})
```

---

## TECHNICAL REQUIREMENTS

| Requirement | Value |
|-------------|-------|
| Runtime | Browser |
| Module | ESM + CJS |
| TypeScript | Strict mode |
| Dependencies | ZERO |
| Test Coverage | 100% |
| Bundle Size | < 4KB core |

---

## PROJECT STRUCTURE

```
filekit/
├── src/
│   ├── index.ts                    # Main exports
│   ├── types.ts                    # Type definitions
│   │
│   ├── core/
│   │   ├── uploader.ts             # Main Uploader class
│   │   ├── file-item.ts            # FileItem class
│   │   ├── drop-zone.ts            # DropZone class
│   │   ├── queue.ts                # Upload queue
│   │   └── config.ts               # Configuration
│   │
│   ├── upload/
│   │   ├── xhr.ts                  # XHR upload
│   │   ├── chunked.ts              # Chunked upload
│   │   ├── progress.ts             # Progress tracking
│   │   └── retry.ts                # Retry logic
│   │
│   ├── validation/
│   │   ├── validator.ts            # Validator class
│   │   ├── validators.ts           # Built-in validators
│   │   ├── size.ts                 # Size validation
│   │   ├── type.ts                 # Type validation
│   │   └── image.ts                # Image validation
│   │
│   ├── preview/
│   │   ├── image-preview.ts        # Image preview
│   │   ├── dimensions.ts           # Image dimensions
│   │   └── compress.ts             # Image compression
│   │
│   ├── utils/
│   │   ├── file.ts                 # File utilities
│   │   ├── mime.ts                 # MIME type utilities
│   │   ├── size.ts                 # Size formatting
│   │   └── reader.ts               # File reader utilities
│   │
│   ├── adapters/
│   │   └── react/
│   │       ├── index.ts
│   │       ├── provider.tsx
│   │       ├── context.ts
│   │       ├── hooks/
│   │       │   ├── useUploader.ts
│   │       │   ├── useDropZone.ts
│   │       │   ├── useFileSelect.ts
│   │       │   └── useImagePreview.ts
│   │       └── components/
│   │           ├── DropZone.tsx
│   │           ├── FileInput.tsx
│   │           ├── FileList.tsx
│   │           ├── UploadProgress.tsx
│   │           └── ImagePreview.tsx
│   │
│   └── errors.ts                   # Error definitions
│
├── tests/
│   ├── unit/
│   │   ├── core/
│   │   ├── upload/
│   │   ├── validation/
│   │   └── preview/
│   ├── integration/
│   │   ├── uploader.test.ts
│   │   ├── dropzone.test.ts
│   │   ├── chunked.test.ts
│   │   └── react.test.tsx
│   └── fixtures/
│
├── examples/
│   ├── basic/
│   ├── dropzone/
│   ├── chunked/
│   ├── queue/
│   ├── validation/
│   └── react/
│
├── website/
│   └── [See WEBSITE section]
│
├── .github/
│   └── workflows/
│       └── deploy-website.yml
│
├── SPECIFICATION.md
├── IMPLEMENTATION.md
├── TASKS.md
├── README.md
├── CHANGELOG.md
├── LICENSE
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── vitest.config.ts
```

---

## DOCUMENTATION WEBSITE

Build a modern documentation site using React + Vite.

### Technology Stack (MANDATORY)

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18+ | UI framework |
| **Vite** | 5+ | Build tool |
| **TypeScript** | 5+ | Type safety |
| **Tailwind CSS** | 3+ | Styling (npm, NOT CDN) |
| **shadcn/ui** | Latest | UI components |
| **React Router** | 6+ | Routing |
| **Lucide React** | Latest | Icons |
| **Framer Motion** | Latest | Animations |
| **Prism.js** | Latest | Syntax highlighting |

### Fonts (MANDATORY)

- **JetBrains Mono** - ALL code
- **Inter** - Body text

### Required Pages

1. **Home** (`/`)
   - Hero with upload demo
   - Drag & drop example
   - Install command
   - Feature highlights

2. **Getting Started** (`/docs/getting-started`)
   - Installation
   - Quick start
   - Basic usage

3. **Upload** (`/docs/upload/*`)
   - Basic upload
   - Multiple files
   - Progress tracking
   - Pause/Resume/Cancel

4. **Drop Zone** (`/docs/dropzone`)
   - Configuration
   - Visual feedback
   - Click to select

5. **Validation** (`/docs/validation`)
   - Built-in validators
   - Custom validators
   - Error handling

6. **Chunked Upload** (`/docs/chunked`)
   - Configuration
   - Resume uploads
   - Server handling

7. **Preview** (`/docs/preview`)
   - Image preview
   - Compression
   - Dimensions

8. **API Reference** (`/docs/api/*`)
   - createUploader
   - createDropZone
   - createUploadQueue
   - Types

9. **React Guide** (`/docs/react/*`)
   - Provider
   - Hooks
   - Components

10. **Examples** (`/examples`)
    - Basic upload
    - Drag & drop
    - Image gallery
    - Large file upload

### Design Theme

- Violet/purple accent (#8b5cf6) - Upload theme
- Dark mode default
- Light mode support

### GitHub Actions

```yaml
# .github/workflows/deploy-website.yml
name: Deploy Website

on:
  push:
    branches: [main]
    paths:
      - 'website/**'
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: website/package-lock.json
      - run: cd website && npm ci
      - run: cd website && npm run build
      - run: echo "filekit.oxog.dev" > website/dist/CNAME
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: website/dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
```

---

## README.md

````markdown
# FileKit

<div align="center">
  <img src="website/public/logo.svg" alt="FileKit" width="120" />
  <h3>Zero-dependency file uploads with drag & drop and chunked transfer</h3>
  <p>
    <a href="https://filekit.oxog.dev">Documentation</a> •
    <a href="https://filekit.oxog.dev/docs/getting-started">Getting Started</a> •
    <a href="https://filekit.oxog.dev/examples">Examples</a>
  </p>
</div>

<div align="center">

[![npm version](https://img.shields.io/npm/v/@oxog/filekit.svg)](https://www.npmjs.com/package/@oxog/filekit)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@oxog/filekit)](https://bundlephobia.com/package/@oxog/filekit)
[![license](https://img.shields.io/npm/l/@oxog/filekit.svg)](LICENSE)

</div>

---

## Features

- 📤 **Upload** - With progress tracking
- 🎯 **Drag & Drop** - Visual feedback
- 📁 **Multiple Files** - Batch upload
- ✅ **Validation** - Type, size, dimensions
- 🖼️ **Preview** - Image thumbnails
- 📦 **Chunked** - Large file support
- ⏸️ **Control** - Pause/Resume/Cancel
- 🔄 **Resume** - Continue interrupted
- 📋 **Queue** - Concurrent uploads
- 🔁 **Retry** - Auto retry failed
- 🗜️ **Compress** - Image optimization
- ⚛️ **React** - Hooks & components
- 📦 **Zero Dependencies**
- ⚡ **< 4KB** - Tiny bundle

## Installation

```bash
npm install @oxog/filekit
```

## Quick Start

```typescript
import { createUploader } from '@oxog/filekit'

const uploader = createUploader({
  endpoint: '/api/upload',
  maxFileSize: 10 * 1024 * 1024,
  allowedTypes: ['image/*'],
  onProgress: (p) => console.log(p.percentage + '%'),
  onComplete: (file) => console.log('Done:', file.name),
})

uploader.addFile(file)
await uploader.uploadAll()
```

## React

```tsx
import { useDropZone, DropZone } from '@oxog/filekit/react'

function Upload() {
  const { getRootProps, getInputProps, files } = useDropZone({
    endpoint: '/api/upload',
    autoUpload: true,
  })
  
  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      <p>Drop files here</p>
    </div>
  )
}
```

## Documentation

Visit [filekit.oxog.dev](https://filekit.oxog.dev) for full documentation.

## License

MIT © [Ersin KOÇ](https://github.com/ersinkoc)
````

---

## IMPLEMENTATION CHECKLIST

### Before Implementation
- [ ] Create SPECIFICATION.md
- [ ] Create IMPLEMENTATION.md
- [ ] Create TASKS.md

### Core
- [ ] Uploader class
- [ ] FileItem class
- [ ] DropZone class
- [ ] Upload queue

### Upload
- [ ] XHR upload
- [ ] Progress tracking
- [ ] Chunked upload
- [ ] Resume support
- [ ] Retry logic

### Validation
- [ ] Size validation
- [ ] Type validation
- [ ] Image dimension validation
- [ ] Custom validators

### Preview
- [ ] Image preview
- [ ] Dimension detection
- [ ] Image compression

### React Adapter
- [ ] FileKitProvider
- [ ] useUploader
- [ ] useDropZone
- [ ] useFileSelect
- [ ] useImagePreview
- [ ] DropZone component
- [ ] FileInput component
- [ ] FileList component
- [ ] UploadProgress component
- [ ] ImagePreview component

### Testing
- [ ] 100% coverage
- [ ] All tests passing

### Website
- [ ] React + Vite setup
- [ ] All pages
- [ ] Interactive examples
- [ ] GitHub Actions

---

## BEGIN IMPLEMENTATION

Start by creating SPECIFICATION.md with the complete package specification. Then proceed with IMPLEMENTATION.md and TASKS.md before writing any actual code.

Remember: This package will be published to NPM. It must be production-ready, zero-dependency, fully tested, and professionally documented.

**Date: 2025-12-29**
**Author: Ersin KOÇ**
**Repository: github.com/ersinkoc/filekit**
**Website: filekit.oxog.dev**
