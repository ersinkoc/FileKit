import type { ImageDimensions } from '../types'
import { isImage } from '../utils/file'

/**
 * Get the natural dimensions of an image file
 */
export function getImageDimensions(file: File): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    if (!isImage(file)) {
      reject(new Error('File is not an image'))
      return
    }

    const url = URL.createObjectURL(file)
    const img = new Image()

    const cleanup = () => {
      URL.revokeObjectURL(url)
    }

    img.onload = () => {
      cleanup()
      resolve({
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
      })
    }

    img.onerror = () => {
      cleanup()
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}

/**
 * Calculate dimensions that fit within bounds while maintaining aspect ratio
 */
export function calculateFitDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): ImageDimensions {
  // If image fits within bounds, return original dimensions
  if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
    return { width: originalWidth, height: originalHeight }
  }

  const aspectRatio = originalWidth / originalHeight

  let width = maxWidth
  let height = width / aspectRatio

  if (height > maxHeight) {
    height = maxHeight
    width = height * aspectRatio
  }

  return {
    width: Math.round(width),
    height: Math.round(height),
  }
}
