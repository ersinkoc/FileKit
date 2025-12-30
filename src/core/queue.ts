import type {
  FileItem,
  OverallProgress,
  QueueConfig,
  QueueEvent,
  QueueEventHandler,
  QueueEventMap,
  UploadError,
  UploadQueue,
} from '../types'
import { EventEmitter } from './events'
import { mergeConfig, DEFAULT_QUEUE_CONFIG } from './config'
import { createUploader } from './uploader'
import { withRetry } from '../upload/retry'

/**
 * Create an upload queue with concurrency control
 */
export function createUploadQueue(userConfig: QueueConfig): UploadQueue {
  const config = mergeConfig(userConfig, DEFAULT_QUEUE_CONFIG as QueueConfig)

  const emitter = new EventEmitter<QueueEventMap>()
  const uploader = createUploader(config)

  const pending: string[] = []
  const active = new Set<string>()
  const completed: string[] = []
  const failed: string[] = []

  let running = false
  let paused = false

  const concurrent = config.concurrent ?? 3
  const retries = config.retries ?? 3
  const retryDelay = config.retryDelay ?? 1000

  /**
   * Process the queue
   */
  async function processQueue(): Promise<void> {
    while (running && !paused && pending.length > 0 && active.size < concurrent) {
      const fileId = pending.shift()
      if (!fileId) break

      const file = uploader.getFile(fileId)
      if (!file) continue

      active.add(fileId)
      emitter.emit('fileStart', file)

      // Upload with retry
      try {
        await withRetry(
          async () => {
            await uploader.upload(fileId)

            const updatedFile = uploader.getFile(fileId)
            if (updatedFile?.status === 'error') {
              throw updatedFile.error ?? new Error('Upload failed')
            }
          },
          {
            maxRetries: retries,
            delay: retryDelay,
            shouldRetry: (error, attempt) => {
              // Don't retry on validation errors
              if (error instanceof Error) {
                const code = (error as UploadError).code
                if (
                  code === 'FILE_TOO_LARGE' ||
                  code === 'FILE_TOO_SMALL' ||
                  code === 'INVALID_TYPE' ||
                  code === 'INVALID_DIMENSIONS' ||
                  code === 'VALIDATION_FAILED'
                ) {
                  return false
                }
              }
              return attempt < retries
            },
          }
        )

        const completedFile = uploader.getFile(fileId)
        if (completedFile) {
          completed.push(fileId)
          emitter.emit('fileComplete', completedFile, completedFile.response)
        }
      } catch (error) {
        const failedFile = uploader.getFile(fileId)
        if (failedFile) {
          failed.push(fileId)
          emitter.emit('fileError', failedFile, failedFile.error ?? (error as UploadError))
        }
      } finally {
        active.delete(fileId)
        emitter.emit('progress', getProgress())
      }
    }

    // Check if complete
    if (running && pending.length === 0 && active.size === 0) {
      running = false
      const allFiles = uploader
        .getFiles()
        .filter((f) => f.status === 'completed' || f.status === 'error')
      emitter.emit('complete', allFiles)
    }

    // Process more if slots available
    if (running && !paused && pending.length > 0 && active.size < concurrent) {
      void processQueue()
    }
  }

  /**
   * Add a single file
   */
  function add(file: File): FileItem {
    const item = uploader.addFile(file)
    pending.push(item.id)

    if (config.autoStart && !running) {
      start()
    }

    return item
  }

  /**
   * Add multiple files
   */
  function addMany(files: File[] | FileList): FileItem[] {
    const items = uploader.addFiles(files)

    for (const item of items) {
      pending.push(item.id)
    }

    if (config.autoStart && !running && items.length > 0) {
      start()
    }

    return items
  }

  /**
   * Start the queue
   */
  function start(): void {
    if (running) return

    running = true
    paused = false
    emitter.emit('start')
    void processQueue()
  }

  /**
   * Pause the queue
   */
  function pause(): void {
    if (!running || paused) return

    paused = true

    // Pause active uploads
    for (const fileId of active) {
      uploader.pause(fileId)
    }

    emitter.emit('pause')
  }

  /**
   * Resume the queue
   */
  function resume(): void {
    if (!paused) return

    paused = false

    // Resume active uploads
    for (const fileId of active) {
      uploader.resume(fileId)
    }

    emitter.emit('resume')
    void processQueue()
  }

  /**
   * Clear the queue
   */
  function clear(): void {
    // Cancel active uploads
    for (const fileId of active) {
      uploader.cancel(fileId)
    }

    pending.length = 0
    active.clear()
    completed.length = 0
    failed.length = 0
    running = false
    paused = false

    uploader.removeAll()
  }

  /**
   * Get all files in queue
   */
  function getQueue(): FileItem[] {
    return uploader.getFiles()
  }

  /**
   * Get pending files
   */
  function getPending(): FileItem[] {
    return pending
      .map((id) => uploader.getFile(id))
      .filter((f): f is FileItem => f !== undefined)
  }

  /**
   * Get completed files
   */
  function getCompleted(): FileItem[] {
    return completed
      .map((id) => uploader.getFile(id))
      .filter((f): f is FileItem => f !== undefined)
  }

  /**
   * Get failed files
   */
  function getFailed(): FileItem[] {
    return failed
      .map((id) => uploader.getFile(id))
      .filter((f): f is FileItem => f !== undefined)
  }

  /**
   * Check if queue is running
   */
  function isRunning(): boolean {
    return running && !paused
  }

  /**
   * Check if queue is paused
   */
  function isPaused(): boolean {
    return paused
  }

  /**
   * Get overall progress
   */
  function getProgress(): OverallProgress {
    return uploader.getProgress()
  }

  /**
   * Subscribe to event
   */
  function on<E extends QueueEvent>(
    event: E,
    handler: QueueEventHandler<E>
  ): () => void {
    return emitter.on(event, handler)
  }

  /**
   * Unsubscribe from event
   */
  function off<E extends QueueEvent>(event: E, handler: QueueEventHandler<E>): void {
    emitter.off(event, handler)
  }

  /**
   * Cleanup
   */
  function destroy(): void {
    clear()
    emitter.removeAllListeners()
    uploader.destroy()
  }

  return {
    add,
    addMany,
    start,
    pause,
    resume,
    clear,
    getQueue,
    getPending,
    getCompleted,
    getFailed,
    isRunning,
    isPaused,
    getProgress,
    on,
    off,
    destroy,
  }
}
