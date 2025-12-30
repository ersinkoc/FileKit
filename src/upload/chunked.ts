import type {
  ChunkInfo,
  ChunkedUploadCallbacks,
  ChunkedUploadHandle,
  FileItem,
  UploaderConfig,
} from '../types'
import { createChunkFailedError, createCancelledError } from '../errors'
import { withRetry } from './retry'

/**
 * Default chunk size (1MB)
 */
const DEFAULT_CHUNK_SIZE = 1024 * 1024

/**
 * Create chunk info array for a file
 */
export function createChunks(fileSize: number, chunkSize: number): ChunkInfo[] {
  const chunks: ChunkInfo[] = []
  let start = 0
  let index = 0

  while (start < fileSize) {
    const end = Math.min(start + chunkSize, fileSize)
    chunks.push({
      index,
      start,
      end,
      size: end - start,
      uploaded: false,
      retries: 0,
    })
    start = end
    index++
  }

  return chunks
}

/**
 * Upload a single chunk
 */
async function uploadChunk(
  file: FileItem,
  chunk: ChunkInfo,
  config: UploaderConfig
): Promise<void> {
  const blob = file.file.slice(chunk.start, chunk.end)

  const formData = new FormData()
  formData.append('file', blob, file.name)
  formData.append('chunkIndex', String(chunk.index))
  formData.append('totalChunks', String(file.totalChunks ?? 1))
  formData.append('fileId', file.id)
  formData.append('fileName', file.name)
  formData.append('fileSize', String(file.size))

  // Determine chunk endpoint
  const endpoint = config.chunkEndpoint ?? config.endpoint
  const url = typeof endpoint === 'function' ? endpoint(file) : endpoint

  // Get headers
  const headers =
    typeof config.headers === 'function' ? config.headers(file) : config.headers ?? {}

  const response = await fetch(url, {
    method: config.method ?? 'POST',
    body: formData,
    headers,
    credentials: config.withCredentials ? 'include' : 'same-origin',
  })

  if (!response.ok) {
    throw new Error(`Chunk upload failed with status ${response.status}`)
  }
}

/**
 * Merge uploaded chunks on the server
 */
async function mergeChunks(file: FileItem, config: UploaderConfig): Promise<unknown> {
  const endpoint = config.mergeEndpoint ?? config.endpoint
  const url = typeof endpoint === 'function' ? endpoint(file) : endpoint

  const headers =
    typeof config.headers === 'function' ? config.headers(file) : config.headers ?? {}

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify({
      fileId: file.id,
      fileName: file.name,
      totalChunks: file.totalChunks,
      fileSize: file.size,
      metadata: file.metadata,
    }),
    credentials: config.withCredentials ? 'include' : 'same-origin',
  })

  if (!response.ok) {
    throw new Error(`Merge failed with status ${response.status}`)
  }

  return response.json()
}

/**
 * Upload a file in chunks with parallel upload support
 */
export function uploadChunked(
  file: FileItem,
  config: UploaderConfig,
  callbacks: ChunkedUploadCallbacks
): ChunkedUploadHandle {
  const chunkSize = config.chunkSize ?? DEFAULT_CHUNK_SIZE
  const parallelChunks = config.parallelChunks ?? 1
  const retryChunks = config.retryChunks ?? 3

  // Initialize chunks if not already done
  if (!file.chunks) {
    const chunks = createChunks(file.size, chunkSize)
    ;(file as { chunks: ChunkInfo[] }).chunks = chunks
    ;(file as { totalChunks: number }).totalChunks = chunks.length
    ;(file as { currentChunk: number }).currentChunk = 0
  }

  let aborted = false
  let paused = false
  let resolvePromise: (value: unknown) => void
  let rejectPromise: (error: Error) => void

  const promise = new Promise<unknown>((resolve, reject) => {
    resolvePromise = resolve
    rejectPromise = reject
  })

  let uploadedBytes = file.uploadedBytes

  // Get pending chunks
  const getPendingChunks = () => {
    return (file.chunks ?? []).filter((c) => !c.uploaded)
  }

  // Update progress
  const updateProgress = () => {
    const totalChunks = file.chunks?.length ?? 1
    const uploadedChunks = (file.chunks ?? []).filter((c) => c.uploaded).length

    ;(file as { currentChunk: number }).currentChunk = uploadedChunks
    ;(file as { uploadedBytes: number }).uploadedBytes = uploadedBytes
    ;(file as { progress: number }).progress = Math.round(
      (uploadedChunks / totalChunks) * 100
    )

    callbacks.onProgress?.(uploadedBytes, file.size)
  }

  // Upload next batch of chunks
  const uploadBatch = async () => {
    while (!aborted && !paused) {
      const pendingChunks = getPendingChunks()

      if (pendingChunks.length === 0) {
        // All chunks uploaded, merge
        try {
          const response = await mergeChunks(file, config)
          callbacks.onComplete?.(response)
          resolvePromise(response)
        } catch (error) {
          const uploadError =
            error instanceof Error ? error : new Error(String(error))
          callbacks.onError?.(uploadError as Parameters<NonNullable<ChunkedUploadCallbacks['onError']>>[0])
          rejectPromise(uploadError)
        }
        return
      }

      // Take next batch
      const batch = pendingChunks.slice(0, parallelChunks)

      // Upload batch in parallel
      const results = await Promise.allSettled(
        batch.map(async (chunk) => {
          try {
            await withRetry(() => uploadChunk(file, chunk, config), {
              maxRetries: retryChunks,
              delay: 1000,
            })

            chunk.uploaded = true
            uploadedBytes += chunk.size
            updateProgress()
            callbacks.onChunkComplete?.(chunk.index, file.totalChunks ?? 1)
          } catch (error) {
            chunk.retries++
            throw error
          }
        })
      )

      // Check for failures
      const failures = results.filter(
        (r): r is PromiseRejectedResult => r.status === 'rejected'
      )

      if (failures.length > 0 && !aborted) {
        const failedChunk = batch.find((c) => !c.uploaded)
        const error = createChunkFailedError(
          failedChunk?.index ?? 0,
          file.totalChunks ?? 1,
          file
        )
        callbacks.onError?.(error)
        rejectPromise(error)
        return
      }
    }

    if (paused) {
      callbacks.onPause?.()
    }
  }

  // Start upload
  uploadBatch().catch((error) => {
    if (!aborted) {
      rejectPromise(error instanceof Error ? error : new Error(String(error)))
    }
  })

  return {
    abort: () => {
      aborted = true
      const error = createCancelledError(file)
      callbacks.onError?.(error)
      rejectPromise(error)
    },
    pause: () => {
      paused = true
    },
    resume: () => {
      if (paused) {
        paused = false
        callbacks.onResume?.()
        uploadBatch().catch((error) => {
          if (!aborted) {
            rejectPromise(error instanceof Error ? error : new Error(String(error)))
          }
        })
      }
    },
    promise,
  }
}
