# FileKit - Technical Specification

## Package Overview

| Property | Value |
|----------|-------|
| **Package Name** | `@oxog/filekit` |
| **Version** | 1.0.0 |
| **License** | MIT |
| **Author** | Ersin KOC |
| **Repository** | https://github.com/ersinkoc/filekit |
| **Documentation** | https://filekit.oxog.dev |
| **Bundle Size Target** | < 4KB (core), < 6KB (with React) |
| **Dependencies** | ZERO (none allowed) |
| **Test Coverage** | 100% required |

## Core Features

### 1. File Upload
- Single and multiple file upload
- Real-time progress tracking (loaded, total, percentage, speed, ETA)
- XHR-based upload with XMLHttpRequest
- Custom headers and credentials support
- Configurable timeout
- Dynamic endpoint (function or string)

### 2. Drag & Drop
- Visual feedback during drag operations
- Accept/reject state detection
- Click to select fallback
- Directory support (optional)
- Multiple file selection
- Custom CSS class application

### 3. File Validation
- File size (min/max)
- File type (MIME type with wildcards)
- File count limit
- Image dimensions (min/max width/height)
- Custom validators (sync/async)
- Built-in validators:
  - fileName (regex pattern)
  - extension (allowed list)
  - aspectRatio (min/max/exact)
  - noDuplicates

### 4. Image Preview
- Automatic thumbnail generation
- Configurable dimensions and quality
- Memory-efficient blob URLs
- Dimension detection
- Image compression before upload

### 5. Chunked Upload
- Large file support with chunk splitting
- Parallel chunk upload
- Failed chunk retry
- Resume interrupted uploads
- State persistence for resume
- Separate chunk and merge endpoints

### 6. Upload Queue
- Concurrent upload limit
- Auto-start option
- Retry with configurable delay
- Queue management (start/pause/resume/clear)

### 7. Upload Control
- Pause/Resume individual or all
- Cancel individual or all
- Retry failed uploads
- Status tracking per file

### 8. React Integration
- Context Provider
- Custom hooks:
  - useUploader
  - useDropZone
  - useFileSelect
  - useImagePreview
- Ready-to-use components:
  - DropZone
  - FileInput
  - FileList
  - UploadProgress
  - ImagePreview

## Type Definitions

### FileStatus
```typescript
type FileStatus =
  | 'pending'      // File added, not yet started
  | 'validating'   // Validation in progress
  | 'ready'        // Validated, ready to upload
  | 'uploading'    // Upload in progress
  | 'processing'   // Server processing
  | 'completed'    // Upload successful
  | 'error'        // Upload failed
  | 'cancelled'    // Upload cancelled
  | 'paused'       // Upload paused
```

### UploadErrorCode
```typescript
type UploadErrorCode =
  | 'FILE_TOO_LARGE'       // Exceeds maxFileSize
  | 'FILE_TOO_SMALL'       // Below minFileSize
  | 'INVALID_TYPE'         // Not in allowedTypes or in blockedTypes
  | 'MAX_FILES_EXCEEDED'   // Exceeds maxFiles
  | 'INVALID_DIMENSIONS'   // Image dimensions out of range
  | 'VALIDATION_FAILED'    // Custom validator failed
  | 'NETWORK_ERROR'        // Network failure
  | 'SERVER_ERROR'         // Server returned error status
  | 'CANCELLED'            // User cancelled
  | 'CHUNK_FAILED'         // Chunk upload failed after retries
  | 'UNKNOWN'              // Unknown error
```

### UploaderEvent
```typescript
type UploaderEvent =
  | 'add'           // File added
  | 'remove'        // File removed
  | 'start'         // Upload started
  | 'progress'      // Progress update
  | 'complete'      // Upload complete
  | 'error'         // Upload error
  | 'pause'         // Upload paused
  | 'resume'        // Upload resumed
  | 'cancel'        // Upload cancelled
  | 'allComplete'   // All uploads complete
  | 'chunkComplete' // Chunk upload complete
```

### QueueEvent
```typescript
type QueueEvent =
  | 'start'        // Queue started
  | 'pause'        // Queue paused
  | 'resume'       // Queue resumed
  | 'progress'     // Overall progress
  | 'fileStart'    // Individual file started
  | 'fileComplete' // Individual file complete
  | 'fileError'    // Individual file error
  | 'complete'     // All files complete
```

## API Surface

### Factory Functions
```typescript
createUploader(config: UploaderConfig): Uploader
createDropZone(element: HTMLElement, config: DropZoneConfig): DropZone
createUploadQueue(config: QueueConfig): UploadQueue
createValidator(config: ValidatorConfig): Validator
createImagePreview(file: File, options?: PreviewOptions): Promise<ImagePreviewResult>
```

### Utility Functions
```typescript
// Size
formatFileSize(bytes: number): string
parseFileSize(size: string): number

// Type checking
isImage(file: File): boolean
isVideo(file: File): boolean
isAudio(file: File): boolean
isPDF(file: File): boolean
getFileExtension(file: File | string): string
getMimeType(extension: string): string
getFileCategory(file: File): FileCategory

// File reading
readAsDataURL(file: File): Promise<string>
readAsText(file: File, encoding?: string): Promise<string>
readAsArrayBuffer(file: File): Promise<ArrayBuffer>
readAsJSON<T>(file: File): Promise<T>

// Image utilities
getImageDimensions(file: File): Promise<{width: number, height: number}>
compressImage(file: File, options?: CompressOptions): Promise<File>

// Validation
validateFileSize(file: File, options: SizeOptions): ValidationResult
validateFileType(file: File, options: TypeOptions): ValidationResult
validateImageDimensions(file: File, options: DimensionOptions): Promise<ValidationResult>
```

### Built-in Validators
```typescript
validators.fileName(pattern: RegExp): Validator
validators.extension(allowed: string[]): Validator
validators.aspectRatio(options: AspectRatioOptions): Validator
validators.noDuplicates(): Validator
```

## Configuration Defaults

```typescript
const DEFAULT_CONFIG = {
  method: 'POST',
  fieldName: 'file',
  withCredentials: false,
  timeout: 0,

  chunked: false,
  chunkSize: 1024 * 1024, // 1MB
  parallelChunks: 1,
  retryChunks: 3,

  autoUpload: false,
  sequential: false,
  generatePreview: false,

  previewOptions: {
    maxWidth: 200,
    maxHeight: 200,
    quality: 0.8,
    type: 'image/jpeg',
  },
}

const QUEUE_DEFAULTS = {
  concurrent: 3,
  autoStart: false,
  retries: 3,
  retryDelay: 1000,
}
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

Required APIs:
- File API
- FileReader API
- XMLHttpRequest
- Blob
- FormData
- Canvas (for image processing)
- DataTransfer (for drag & drop)

## Build Output

```
dist/
├── index.js          # ESM bundle
├── index.cjs         # CommonJS bundle
├── index.d.ts        # TypeScript declarations
├── react.js          # React adapter ESM
├── react.cjs         # React adapter CJS
└── react.d.ts        # React declarations
```

## Package.json Exports

```json
{
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    },
    "./react": {
      "import": "./dist/react.js",
      "require": "./dist/react.cjs",
      "types": "./dist/react.d.ts"
    }
  }
}
```

## Testing Requirements

- Framework: Vitest
- Coverage: 100% lines, branches, functions, statements
- Test types:
  - Unit tests for all modules
  - Integration tests for complete workflows
  - React component tests with @testing-library/react
- Mocking:
  - XMLHttpRequest
  - File/Blob
  - Canvas
  - Image loading
  - FileReader

## Security Considerations

1. No execution of uploaded files
2. MIME type validation (not just extension)
3. File size limits enforced client-side
4. XSS prevention in preview URLs
5. CSRF protection via custom headers
6. Credential handling via withCredentials flag

## Performance Targets

- Initial parse: < 5ms
- File add: < 1ms per file
- Preview generation: < 100ms for typical images
- Memory: No leaks, proper cleanup of blob URLs
- Bundle size: < 4KB gzipped (core)
