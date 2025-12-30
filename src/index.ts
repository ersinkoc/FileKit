// Core exports
export { createUploader } from './core/uploader'
export { createDropZone } from './core/drop-zone'
export { createUploadQueue } from './core/queue'

// Validation exports
export { createValidator } from './validation/validator'
export { validators } from './validation/validators'
export { validateFileSize } from './validation/size'
export { validateFileType } from './validation/type'
export { validateImageDimensions } from './validation/image'

// Preview exports
export { createImagePreview, createBlobPreview } from './preview/image-preview'
export { getImageDimensions, calculateFitDimensions } from './preview/dimensions'
export { compressImage } from './preview/compress'

// Utility exports
export {
  formatFileSize,
  parseFileSize,
  formatSpeed,
  formatTime,
} from './utils/size'
export {
  isImage,
  isVideo,
  isAudio,
  isPDF,
  getFileExtension,
  getFileCategory,
} from './utils/file'
export {
  getMimeType,
  getExtensionFromMime,
  matchesMimePattern,
} from './utils/mime'
export {
  readAsDataURL,
  readAsText,
  readAsArrayBuffer,
  readAsJSON,
} from './utils/reader'

// Error exports
export {
  createUploadError,
  isUploadError,
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
} from './errors'

// Type exports
export type {
  // Core types
  FileStatus,
  FileCategory,
  FileItem,
  ChunkInfo,

  // Progress types
  UploadProgress,
  OverallProgress,

  // Error types
  UploadError,
  UploadErrorCode,

  // Validation types
  Validator,
  ValidationResult,
  ValidationError,
  BatchValidationResult,
  ValidatorConfig,
  SizeValidationOptions,
  TypeValidationOptions,
  DimensionValidationOptions,
  AspectRatioOptions,

  // Preview types
  PreviewOptions,
  ImagePreviewResult,
  ImageDimensions,
  CompressOptions,

  // Config types
  UploaderConfig,
  DropZoneConfig,
  QueueConfig,

  // Instance types
  Uploader,
  DropZone,
  UploadQueue,

  // Event types
  UploaderEvent,
  UploaderEventMap,
  UploaderEventHandler,
  QueueEvent,
  QueueEventMap,
  QueueEventHandler,

  // State types
  UploadState,

  // Callback types
  UploadCallbacks,
  ChunkedUploadCallbacks,
  RetryOptions,
} from './types'
