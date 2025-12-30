import type {
  FileItem,
  FileStatus,
  OverallProgress,
  Uploader,
  UploaderConfig,
  UploaderEvent,
  UploaderEventHandler,
  UploaderEventMap,
  UploadError,
  UploadProgress,
  UploadState,
  XHRUploadHandle,
  ChunkedUploadHandle,
} from '../types'
import { EventEmitter } from './events'
import { mergeConfig, validateConfig } from './config'
import {
  createFileItem,
  updateFileStatus,
  updateFileProgress,
  setFileError,
  setFileResponse,
  setFileChunks,
} from './file-item'
// import { createValidator } from '../validation/validator'
import { uploadWithXHR } from '../upload/xhr'
import { uploadChunked, createChunks } from '../upload/chunked'
import {
  createFileTooLargeError,
  createFileTooSmallError,
  createInvalidTypeError,
  createMaxFilesExceededError,
  createInvalidDimensionsError,
  createValidationFailedError,
} from '../errors'
import { matchesAnyMimePattern } from '../utils/mime'
import { isImage } from '../utils/file'
import { getImageDimensions } from '../preview/dimensions'

/**
 * Create a new uploader instance
 */
export function createUploader(userConfig: UploaderConfig): Uploader {
  const config = mergeConfig(userConfig)
  validateConfig(config)

  const emitter = new EventEmitter<UploaderEventMap>()
  const files = new Map<string, FileItem>()
  const uploads = new Map<string, XHRUploadHandle | ChunkedUploadHandle>()
  const pausedFiles = new Set<string>()
  const previewUrls = new Set<string>()


  /**
   * Validate a file before adding
   */
  async function validateFile(file: File): Promise<void> {
    // Check max files
    if (config.maxFiles !== undefined && files.size >= config.maxFiles) {
      throw createMaxFilesExceededError(config.maxFiles)
    }

    // Check file size
    if (config.maxFileSize !== undefined && file.size > config.maxFileSize) {
      throw createFileTooLargeError(file, config.maxFileSize)
    }

    if (config.minFileSize !== undefined && file.size < config.minFileSize) {
      throw createFileTooSmallError(file, config.minFileSize)
    }

    // Check file type
    if (config.allowedTypes && config.allowedTypes.length > 0) {
      if (!matchesAnyMimePattern(file.type || 'application/octet-stream', config.allowedTypes)) {
        throw createInvalidTypeError(file, config.allowedTypes)
      }
    }

    if (config.blockedTypes && config.blockedTypes.length > 0) {
      if (matchesAnyMimePattern(file.type || 'application/octet-stream', config.blockedTypes)) {
        throw createInvalidTypeError(file, config.allowedTypes ?? [])
      }
    }

    // Check image dimensions if applicable
    if (isImage(file)) {
      const hasDimensionConstraints =
        config.maxImageWidth !== undefined ||
        config.maxImageHeight !== undefined ||
        config.minImageWidth !== undefined ||
        config.minImageHeight !== undefined

      if (hasDimensionConstraints) {
        const dimensions = await getImageDimensions(file)

        if (config.minImageWidth !== undefined && dimensions.width < config.minImageWidth) {
          throw createInvalidDimensionsError(
            file,
            `Width ${dimensions.width}px is below minimum ${config.minImageWidth}px`
          )
        }

        if (config.minImageHeight !== undefined && dimensions.height < config.minImageHeight) {
          throw createInvalidDimensionsError(
            file,
            `Height ${dimensions.height}px is below minimum ${config.minImageHeight}px`
          )
        }

        if (config.maxImageWidth !== undefined && dimensions.width > config.maxImageWidth) {
          throw createInvalidDimensionsError(
            file,
            `Width ${dimensions.width}px exceeds maximum ${config.maxImageWidth}px`
          )
        }

        if (config.maxImageHeight !== undefined && dimensions.height > config.maxImageHeight) {
          throw createInvalidDimensionsError(
            file,
            `Height ${dimensions.height}px exceeds maximum ${config.maxImageHeight}px`
          )
        }
      }
    }

    // Run custom validators
    if (config.validators) {
      const existingFiles = Array.from(files.values())
      for (const customValidator of config.validators) {
        try {
          await customValidator.validate(file, existingFiles)
        } catch (error) {
          throw createValidationFailedError(
            file,
            customValidator.name,
            error instanceof Error ? error.message : String(error)
          )
        }
      }
    }
  }

  /**
   * Add a single file
   */
  function addFile(file: File): FileItem {
    // Synchronous validation for immediate feedback
    if (config.maxFiles !== undefined && files.size >= config.maxFiles) {
      throw createMaxFilesExceededError(config.maxFiles)
    }

    if (config.maxFileSize !== undefined && file.size > config.maxFileSize) {
      throw createFileTooLargeError(file, config.maxFileSize)
    }

    if (config.minFileSize !== undefined && file.size < config.minFileSize) {
      throw createFileTooSmallError(file, config.minFileSize)
    }

    if (config.allowedTypes && config.allowedTypes.length > 0) {
      if (!matchesAnyMimePattern(file.type || 'application/octet-stream', config.allowedTypes)) {
        throw createInvalidTypeError(file, config.allowedTypes)
      }
    }

    if (config.blockedTypes && config.blockedTypes.length > 0) {
      if (matchesAnyMimePattern(file.type || 'application/octet-stream', config.blockedTypes)) {
        throw createInvalidTypeError(file, config.allowedTypes ?? [])
      }
    }

    // Transform file if needed
    let finalFile = file
    if (config.transformFile) {
      const transformed = config.transformFile(file)
      if (transformed instanceof Promise) {
        // Handle async transform
        transformed
          .then((f) => {
            const item = files.get(fileItem.id)
            if (item) {
              (item as { file: File }).file = f
            }
          })
          .catch(() => {
            // Ignore transform errors
          })
      } else {
        finalFile = transformed
      }
    }

    // Create file item
    const fileItem = createFileItem(finalFile, {
      generatePreview: config.generatePreview,
      previewOptions: config.previewOptions,
    })

    // Track preview URL for cleanup
    if (fileItem.preview) {
      previewUrls.add(fileItem.preview)
    }

    files.set(fileItem.id, fileItem)

    // Call onAdd callback
    if (config.onAdd) {
      const result = config.onAdd(fileItem)
      if (result === false) {
        files.delete(fileItem.id)
        throw new Error('File rejected by onAdd callback')
      }
    }

    emitter.emit('add', fileItem)

    // Auto upload if enabled
    if (config.autoUpload) {
      upload(fileItem.id).catch(() => {
        // Error handled via event
      })
    }

    return fileItem
  }

  /**
   * Add multiple files
   */
  function addFiles(fileList: File[] | FileList): FileItem[] {
    const filesArray = Array.from(fileList)
    const items: FileItem[] = []

    for (const file of filesArray) {
      try {
        const item = addFile(file)
        items.push(item)
      } catch {
        // Continue with other files
      }
    }

    return items
  }

  /**
   * Remove a file
   */
  function removeFile(fileId: string): void {
    const file = files.get(fileId)
    if (!file) return

    // Cancel upload if in progress
    const uploadHandle = uploads.get(fileId)
    if (uploadHandle) {
      uploadHandle.abort()
      uploads.delete(fileId)
    }

    // Cleanup preview URL
    if (file.preview && previewUrls.has(file.preview)) {
      if (file.preview.startsWith('blob:')) {
        URL.revokeObjectURL(file.preview)
      }
      previewUrls.delete(file.preview)
    }

    files.delete(fileId)
    pausedFiles.delete(fileId)

    config.onRemove?.(file)
    emitter.emit('remove', file)
  }

  /**
   * Remove all files
   */
  function removeAll(): void {
    const allFiles = Array.from(files.keys())
    for (const fileId of allFiles) {
      removeFile(fileId)
    }
  }

  /**
   * Upload a single file
   */
  async function upload(fileId?: string): Promise<void> {
    if (fileId) {
      const file = files.get(fileId)
      if (!file) {
        throw new Error(`File not found: ${fileId}`)
      }

      if (file.status === 'uploading') {
        return // Already uploading
      }

      if (file.status === 'completed') {
        return // Already completed
      }

      await uploadSingleFile(file)
    } else {
      await uploadAll()
    }
  }

  /**
   * Upload a single file
   */
  async function uploadSingleFile(file: FileItem): Promise<void> {
    // Validate before upload
    try {
      await validateFile(file.file)
    } catch (error) {
      setFileError(file, error as UploadError)
      config.onError?.(file, error as UploadError)
      emitter.emit('error', file, error as UploadError)
      return
    }

    updateFileStatus(file, 'uploading')
    emitter.emit('start', file)

    const startTime = Date.now()

    const callbacks = {
      onProgress: (loaded: number, total: number) => {
        const percentage = Math.round((loaded / total) * 100)
        updateFileProgress(file, loaded, percentage)

        const elapsed = (Date.now() - startTime) / 1000
        const speed = elapsed > 0 ? loaded / elapsed : 0
        const remaining = total - loaded
        const remainingTime = speed > 0 ? remaining / speed : Infinity

        const progress: UploadProgress = {
          file,
          loaded,
          total,
          percentage,
          speed,
          remainingTime,
          currentChunk: file.currentChunk,
          totalChunks: file.totalChunks,
        }

        config.onProgress?.(progress)
        emitter.emit('progress', progress)
      },
      onComplete: (response: unknown) => {
        setFileResponse(file, response)
        updateFileProgress(file, file.size, 100)
        updateFileStatus(file, 'completed')

        uploads.delete(file.id)

        config.onComplete?.(file, response)
        emitter.emit('complete', file, response)

        // Check if all files are complete
        checkAllComplete()
      },
      onError: (error: UploadError) => {
        setFileError(file, error)
        uploads.delete(file.id)

        config.onError?.(file, error)
        emitter.emit('error', file, error)
      },
      onChunkComplete: (chunkIndex: number, totalChunks: number) => {
        emitter.emit('chunkComplete', file, chunkIndex, totalChunks)
      },
      onPause: () => {
        emitter.emit('pause', file)
      },
      onResume: () => {
        emitter.emit('resume', file)
      },
    }

    let handle: XHRUploadHandle | ChunkedUploadHandle

    if (config.chunked) {
      // Setup chunks
      const chunks = createChunks(file.size, config.chunkSize ?? 1024 * 1024)
      setFileChunks(file, chunks)

      handle = uploadChunked(file, config, callbacks)
    } else {
      handle = uploadWithXHR(file, config, callbacks)
    }

    uploads.set(file.id, handle)

    try {
      await handle.promise
    } catch {
      // Error already handled in callbacks
    }
  }

  /**
   * Upload all pending files
   */
  async function uploadAll(): Promise<void> {
    const pendingFiles = Array.from(files.values()).filter(
      (f) => f.status === 'pending' || f.status === 'ready' || f.status === 'error'
    )

    if (config.sequential) {
      for (const file of pendingFiles) {
        await uploadSingleFile(file)
      }
    } else {
      await Promise.all(pendingFiles.map((file) => uploadSingleFile(file)))
    }
  }

  /**
   * Check if all files are complete
   */
  function checkAllComplete(): void {
    const allFiles = Array.from(files.values())
    const uploading = allFiles.filter(
      (f) => f.status === 'uploading' || f.status === 'pending' || f.status === 'ready'
    )

    if (uploading.length === 0 && allFiles.length > 0) {
      const completedFiles = allFiles.filter((f) => f.status === 'completed')
      config.onAllComplete?.(completedFiles)
      emitter.emit('allComplete', completedFiles)
    }
  }

  /**
   * Pause upload
   */
  function pause(fileId?: string): void {
    if (fileId) {
      const file = files.get(fileId)
      const handle = uploads.get(fileId)

      if (file && handle && file.status === 'uploading') {
        if ('pause' in handle) {
          handle.pause()
        }
        pausedFiles.add(fileId)
        updateFileStatus(file, 'paused')
        emitter.emit('pause', file)
      }
    } else {
      // Pause all
      for (const [id, file] of files) {
        if (file.status === 'uploading') {
          pause(id)
        }
      }
    }
  }

  /**
   * Resume upload
   */
  function resume(fileId?: string): void {
    if (fileId) {
      const file = files.get(fileId)
      const handle = uploads.get(fileId)

      if (file && pausedFiles.has(fileId)) {
        if (handle && 'resume' in handle) {
          handle.resume()
        } else {
          // Re-upload if no handle
          uploadSingleFile(file).catch(() => {})
        }
        pausedFiles.delete(fileId)
        updateFileStatus(file, 'uploading')
        emitter.emit('resume', file)
      }
    } else {
      // Resume all
      for (const fileId of pausedFiles) {
        resume(fileId)
      }
    }
  }

  /**
   * Cancel upload
   */
  function cancel(fileId?: string): void {
    if (fileId) {
      const file = files.get(fileId)
      const handle = uploads.get(fileId)

      if (file) {
        if (handle) {
          handle.abort()
          uploads.delete(fileId)
        }
        pausedFiles.delete(fileId)
        updateFileStatus(file, 'cancelled')
        emitter.emit('cancel', file)
      }
    } else {
      // Cancel all
      for (const [id, file] of files) {
        if (file.status === 'uploading' || file.status === 'paused') {
          cancel(id)
        }
      }
    }
  }

  /**
   * Retry failed upload
   */
  function retry(fileId?: string): void {
    if (fileId) {
      const file = files.get(fileId)
      if (file && (file.status === 'error' || file.status === 'cancelled')) {
        updateFileStatus(file, 'pending')
        ;(file as { error: undefined }).error = undefined
        ;(file as { progress: number }).progress = 0
        ;(file as { uploadedBytes: number }).uploadedBytes = 0

        uploadSingleFile(file).catch(() => {})
      }
    } else {
      // Retry all failed
      for (const [id, file] of files) {
        if (file.status === 'error' || file.status === 'cancelled') {
          retry(id)
        }
      }
    }
  }

  /**
   * Get a file by ID
   */
  function getFile(fileId: string): FileItem | undefined {
    return files.get(fileId)
  }

  /**
   * Get all files
   */
  function getFiles(): FileItem[] {
    return Array.from(files.values())
  }

  /**
   * Get files by status
   */
  function getFilesByStatus(status: FileStatus): FileItem[] {
    return Array.from(files.values()).filter((f) => f.status === status)
  }

  /**
   * Check if any file is uploading
   */
  function isUploading(): boolean {
    return Array.from(files.values()).some((f) => f.status === 'uploading')
  }

  /**
   * Check if all uploads are paused
   */
  function isPaused(): boolean {
    return pausedFiles.size > 0 && !isUploading()
  }

  /**
   * Get overall progress
   */
  function getProgress(): OverallProgress {
    const allFiles = Array.from(files.values())
    const totalFiles = allFiles.length
    const completedFiles = allFiles.filter((f) => f.status === 'completed').length
    const failedFiles = allFiles.filter((f) => f.status === 'error').length

    const totalBytes = allFiles.reduce((sum, f) => sum + f.size, 0)
    const uploadedBytes = allFiles.reduce((sum, f) => sum + f.uploadedBytes, 0)

    const percentage = totalBytes > 0 ? Math.round((uploadedBytes / totalBytes) * 100) : 0

    // Calculate average speed
    const uploadingFiles = allFiles.filter((f) => f.status === 'uploading' && f.startedAt)
    let speed = 0

    if (uploadingFiles.length > 0) {
      const now = Date.now()
      for (const file of uploadingFiles) {
        if (file.startedAt) {
          const elapsed = (now - file.startedAt.getTime()) / 1000
          if (elapsed > 0) {
            speed += file.uploadedBytes / elapsed
          }
        }
      }
    }

    const remaining = totalBytes - uploadedBytes
    const remainingTime = speed > 0 ? remaining / speed : Infinity

    return {
      totalFiles,
      completedFiles,
      failedFiles,
      totalBytes,
      uploadedBytes,
      percentage,
      speed,
      remainingTime,
    }
  }

  /**
   * Get upload state for resuming
   */
  function getState(fileId: string): UploadState | undefined {
    const file = files.get(fileId)
    if (!file || !file.chunks) {
      return undefined
    }

    return {
      fileId: file.id,
      fileName: file.name,
      fileSize: file.size,
      uploadedBytes: file.uploadedBytes,
      chunks: file.chunks.map((c) => ({ ...c })),
      metadata: { ...file.metadata },
    }
  }

  /**
   * Resume from saved state
   */
  function resumeFromState(fileId: string, state: UploadState): void {
    const file = files.get(fileId)
    if (!file) {
      throw new Error(`File not found: ${fileId}`)
    }

    // Restore chunk state
    setFileChunks(file, state.chunks)
    ;(file as { uploadedBytes: number }).uploadedBytes = state.uploadedBytes
    ;(file as { metadata: Record<string, unknown> }).metadata = { ...state.metadata }

    // Calculate progress
    const uploadedChunks = state.chunks.filter((c) => c.uploaded).length
    const progress = Math.round((uploadedChunks / state.chunks.length) * 100)
    updateFileProgress(file, state.uploadedBytes, progress)
  }

  /**
   * Subscribe to event
   */
  function on<E extends UploaderEvent>(
    event: E,
    handler: UploaderEventHandler<E>
  ): () => void {
    return emitter.on(event, handler)
  }

  /**
   * Unsubscribe from event
   */
  function off<E extends UploaderEvent>(
    event: E,
    handler: UploaderEventHandler<E>
  ): void {
    emitter.off(event, handler)
  }

  /**
   * Update configuration
   */
  function setConfig(newConfig: Partial<UploaderConfig>): void {
    Object.assign(config, newConfig)
  }

  /**
   * Get current configuration
   */
  function getConfig(): UploaderConfig {
    return { ...config }
  }

  /**
   * Cleanup
   */
  function destroy(): void {
    // Cancel all uploads
    for (const handle of uploads.values()) {
      handle.abort()
    }
    uploads.clear()

    // Cleanup preview URLs
    for (const url of previewUrls) {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url)
      }
    }
    previewUrls.clear()

    // Clear files
    files.clear()
    pausedFiles.clear()

    // Remove all listeners
    emitter.removeAllListeners()
  }

  return {
    addFile,
    addFiles,
    removeFile,
    removeAll,
    upload,
    uploadAll,
    pause,
    resume,
    cancel,
    retry,
    getFile,
    getFiles,
    getFilesByStatus,
    isUploading,
    isPaused,
    getProgress,
    getState,
    resumeFromState,
    on,
    off,
    setConfig,
    getConfig,
    destroy,
  }
}
