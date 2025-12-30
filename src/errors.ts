import type { FileItem, UploadError, UploadErrorCode } from './types'

/**
 * Creates an UploadError with the specified properties
 */
export function createUploadError(
  code: UploadErrorCode,
  message: string,
  file?: FileItem,
  response?: unknown,
  statusCode?: number
): UploadError {
  const error = new Error(message) as UploadError
  error.name = 'UploadError'
  error.code = code
  error.file = file
  error.response = response
  error.statusCode = statusCode
  return error
}

/**
 * Create FILE_TOO_LARGE error
 */
export function createFileTooLargeError(
  file: File,
  maxSize: number,
  fileItem?: FileItem
): UploadError {
  return createUploadError(
    'FILE_TOO_LARGE',
    `File "${file.name}" exceeds maximum size of ${formatBytes(maxSize)}`,
    fileItem
  )
}

/**
 * Create FILE_TOO_SMALL error
 */
export function createFileTooSmallError(
  file: File,
  minSize: number,
  fileItem?: FileItem
): UploadError {
  return createUploadError(
    'FILE_TOO_SMALL',
    `File "${file.name}" is smaller than minimum size of ${formatBytes(minSize)}`,
    fileItem
  )
}

/**
 * Create INVALID_TYPE error
 */
export function createInvalidTypeError(
  file: File,
  allowedTypes: string[],
  fileItem?: FileItem
): UploadError {
  return createUploadError(
    'INVALID_TYPE',
    `File "${file.name}" has invalid type "${file.type}". Allowed types: ${allowedTypes.join(', ')}`,
    fileItem
  )
}

/**
 * Create MAX_FILES_EXCEEDED error
 */
export function createMaxFilesExceededError(maxFiles: number): UploadError {
  return createUploadError(
    'MAX_FILES_EXCEEDED',
    `Maximum number of files (${maxFiles}) exceeded`
  )
}

/**
 * Create INVALID_DIMENSIONS error
 */
export function createInvalidDimensionsError(
  file: File,
  message: string,
  fileItem?: FileItem
): UploadError {
  return createUploadError(
    'INVALID_DIMENSIONS',
    `File "${file.name}": ${message}`,
    fileItem
  )
}

/**
 * Create VALIDATION_FAILED error
 */
export function createValidationFailedError(
  file: File,
  validatorName: string,
  message: string,
  fileItem?: FileItem
): UploadError {
  return createUploadError(
    'VALIDATION_FAILED',
    `File "${file.name}" failed validation "${validatorName}": ${message}`,
    fileItem
  )
}

/**
 * Create NETWORK_ERROR error
 */
export function createNetworkError(fileItem?: FileItem): UploadError {
  return createUploadError(
    'NETWORK_ERROR',
    'Network error occurred during upload',
    fileItem
  )
}

/**
 * Create SERVER_ERROR error
 */
export function createServerError(
  statusCode: number,
  response: unknown,
  fileItem?: FileItem
): UploadError {
  return createUploadError(
    'SERVER_ERROR',
    `Server returned error status ${statusCode}`,
    fileItem,
    response,
    statusCode
  )
}

/**
 * Create TIMEOUT error
 */
export function createTimeoutError(fileItem?: FileItem): UploadError {
  return createUploadError('TIMEOUT', 'Upload timed out', fileItem)
}

/**
 * Create CANCELLED error
 */
export function createCancelledError(fileItem?: FileItem): UploadError {
  return createUploadError('CANCELLED', 'Upload was cancelled', fileItem)
}

/**
 * Create CHUNK_FAILED error
 */
export function createChunkFailedError(
  chunkIndex: number,
  totalChunks: number,
  fileItem?: FileItem
): UploadError {
  return createUploadError(
    'CHUNK_FAILED',
    `Failed to upload chunk ${chunkIndex + 1} of ${totalChunks} after maximum retries`,
    fileItem
  )
}

/**
 * Create UNKNOWN error
 */
export function createUnknownError(
  originalError: unknown,
  fileItem?: FileItem
): UploadError {
  const message =
    originalError instanceof Error ? originalError.message : 'Unknown error occurred'
  return createUploadError('UNKNOWN', message, fileItem)
}

/**
 * Check if an error is an UploadError
 */
export function isUploadError(error: unknown): error is UploadError {
  return (
    error instanceof Error &&
    'code' in error &&
    typeof (error as UploadError).code === 'string'
  )
}

/**
 * Format bytes to human-readable string (helper for error messages)
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const size = sizes[i]

  if (size === undefined) {
    return `${bytes} Bytes`
  }

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${size}`
}
