import type { ImagePreviewResult, PreviewOptions } from '../types'
import { isImage } from '../utils/file'
import { calculateFitDimensions, getImageDimensions } from './dimensions'

const DEFAULT_PREVIEW_OPTIONS: Required<PreviewOptions> = {
  maxWidth: 200,
  maxHeight: 200,
  quality: 0.8,
  type: 'image/jpeg',
}

/**
 * Create a preview image from a file
 * Returns a data URL and dimensions, with a revoke function for cleanup
 */
export async function createImagePreview(
  file: File,
  options: PreviewOptions = {}
): Promise<ImagePreviewResult> {
  if (!isImage(file)) {
    throw new Error('File is not an image')
  }

  const opts = { ...DEFAULT_PREVIEW_OPTIONS, ...options }

  // Get original dimensions
  const originalDimensions = await getImageDimensions(file)

  // Calculate preview dimensions
  const previewDimensions = calculateFitDimensions(
    originalDimensions.width,
    originalDimensions.height,
    opts.maxWidth,
    opts.maxHeight
  )

  // Create canvas and draw image
  const canvas = document.createElement('canvas')
  canvas.width = previewDimensions.width
  canvas.height = previewDimensions.height

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  // Load image and draw to canvas
  const url = URL.createObjectURL(file)

  try {
    const img = await loadImage(url)

    ctx.drawImage(img, 0, 0, previewDimensions.width, previewDimensions.height)

    // Get data URL
    const dataUrl = canvas.toDataURL(opts.type, opts.quality)

    return {
      url: dataUrl,
      width: previewDimensions.width,
      height: previewDimensions.height,
      revoke: () => {
        // Data URLs don't need to be revoked, but we provide the function
        // for API consistency
      },
    }
  } finally {
    URL.revokeObjectURL(url)
  }
}

/**
 * Create a preview using a blob URL (faster but requires manual cleanup)
 */
export function createBlobPreview(file: File): ImagePreviewResult {
  if (!isImage(file)) {
    throw new Error('File is not an image')
  }

  const url = URL.createObjectURL(file)

  return {
    url,
    width: 0, // Unknown until image loads
    height: 0,
    revoke: () => {
      URL.revokeObjectURL(url)
    },
  }
}

/**
 * Load an image from a URL
 */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => {
      resolve(img)
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}
