import type { CompressOptions } from '../types'
import { isImage } from '../utils/file'
import { calculateFitDimensions, getImageDimensions } from './dimensions'

const DEFAULT_COMPRESS_OPTIONS: Required<CompressOptions> = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.8,
  type: 'image/jpeg',
}

/**
 * Compress an image file
 * Returns a new File with reduced dimensions and/or quality
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  if (!isImage(file)) {
    throw new Error('File is not an image')
  }

  const opts = { ...DEFAULT_COMPRESS_OPTIONS, ...options }

  // Get original dimensions
  const originalDimensions = await getImageDimensions(file)

  // Calculate new dimensions
  const newDimensions = calculateFitDimensions(
    originalDimensions.width,
    originalDimensions.height,
    opts.maxWidth,
    opts.maxHeight
  )

  // Create canvas
  const canvas = document.createElement('canvas')
  canvas.width = newDimensions.width
  canvas.height = newDimensions.height

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  // Load and draw image
  const url = URL.createObjectURL(file)

  try {
    const img = await loadImage(url)

    // Draw with smoothing for better quality
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, 0, 0, newDimensions.width, newDimensions.height)

    // Convert to blob
    const blob = await canvasToBlob(canvas, opts.type, opts.quality)

    // Create new file with same name but potentially different extension
    const extension = opts.type.split('/')[1] ?? 'jpeg'
    const baseName = file.name.replace(/\.[^.]+$/, '')
    const newName = `${baseName}.${extension}`

    return new File([blob], newName, { type: opts.type })
  } finally {
    URL.revokeObjectURL(url)
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

/**
 * Convert canvas to blob
 */
function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to create blob from canvas'))
        }
      },
      type,
      quality
    )
  })
}
