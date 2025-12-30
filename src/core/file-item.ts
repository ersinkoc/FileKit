import type {
  ChunkInfo,
  FileItem,
  FileStatus,
  PreviewOptions,
  UploadError,
} from '../types'
import { generateId } from '../utils/id'
import { isImage } from '../utils/file'
import { createImagePreview } from '../preview/image-preview'
import { getImageDimensions } from '../preview/dimensions'

/**
 * Create a new FileItem from a File
 */
export function createFileItem(
  file: File,
  options: {
    generatePreview?: boolean
    previewOptions?: PreviewOptions
  } = {}
): FileItem {
  const item: FileItem = {
    id: generateId(),
    file,
    name: file.name,
    size: file.size,
    type: file.type,
    status: 'pending',
    progress: 0,
    uploadedBytes: 0,
    metadata: {},
    addedAt: new Date(),
  }

  // Schedule preview generation if requested
  if (options.generatePreview && isImage(file)) {
    generatePreviewForItem(item, options.previewOptions).catch(() => {
      // Silently fail preview generation
    })
  }

  return item
}

/**
 * Generate preview for a file item
 */
async function generatePreviewForItem(
  item: FileItem,
  options?: PreviewOptions
): Promise<void> {
  if (!isImage(item.file)) {
    return
  }

  try {
    // Get dimensions
    const dimensions = await getImageDimensions(item.file)
    ;(item as { width: number }).width = dimensions.width
    ;(item as { height: number }).height = dimensions.height

    // Generate preview
    const preview = await createImagePreview(item.file, options)
    ;(item as { preview: string }).preview = preview.url
  } catch {
    // Silently fail
  }
}

/**
 * Update file item status
 */
export function updateFileStatus(item: FileItem, status: FileStatus): void {
  (item as { status: FileStatus }).status = status

  if (status === 'uploading' && !item.startedAt) {
    (item as { startedAt: Date }).startedAt = new Date()
  }

  if (status === 'completed' || status === 'error' || status === 'cancelled') {
    (item as { completedAt: Date }).completedAt = new Date()
  }
}

/**
 * Update file item progress
 */
export function updateFileProgress(
  item: FileItem,
  uploadedBytes: number,
  progress: number
): void {
  (item as { uploadedBytes: number }).uploadedBytes = uploadedBytes
  ;(item as { progress: number }).progress = progress
}

/**
 * Set file item error
 */
export function setFileError(item: FileItem, error: UploadError): void {
  (item as { error: UploadError }).error = error
  updateFileStatus(item, 'error')
}

/**
 * Set file item response
 */
export function setFileResponse(item: FileItem, response: unknown): void {
  (item as { response: unknown }).response = response
}

/**
 * Set file item chunks
 */
export function setFileChunks(item: FileItem, chunks: ChunkInfo[]): void {
  (item as { chunks: ChunkInfo[] }).chunks = chunks
  ;(item as { totalChunks: number }).totalChunks = chunks.length
  ;(item as { currentChunk: number }).currentChunk = 0
}

/**
 * Update current chunk
 */
export function updateCurrentChunk(item: FileItem, chunkIndex: number): void {
  (item as { currentChunk: number }).currentChunk = chunkIndex
}

/**
 * Clone a file item
 */
export function cloneFileItem(item: FileItem): FileItem {
  return {
    ...item,
    metadata: { ...item.metadata },
    chunks: item.chunks ? item.chunks.map((c) => ({ ...c })) : undefined,
  }
}
