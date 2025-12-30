import type { DimensionValidationOptions, ImageDimensions, ValidationResult } from '../types'
import { isImage } from '../utils/file'

/**
 * Get image dimensions from a file
 */
export function getImageDimensions(file: File): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    if (!isImage(file)) {
      reject(new Error('File is not an image'))
      return
    }

    const url = URL.createObjectURL(file)
    const img = new Image()

    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({
        width: img.width,
        height: img.height,
      })
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}

/**
 * Validate image dimensions against constraints
 */
export async function validateImageDimensions(
  file: File,
  options: DimensionValidationOptions
): Promise<ValidationResult> {
  const errors: ValidationResult['errors'] = []

  // Skip non-image files
  if (!isImage(file)) {
    return { valid: true, errors: [] }
  }

  let dimensions: ImageDimensions

  try {
    dimensions = await getImageDimensions(file)
  } catch {
    errors.push({
      code: 'INVALID_DIMENSIONS',
      message: 'Failed to read image dimensions',
      file,
    })
    return { valid: false, errors }
  }

  // Check minimum width
  if (options.minWidth !== undefined && dimensions.width < options.minWidth) {
    errors.push({
      code: 'INVALID_DIMENSIONS',
      message: `Image width (${dimensions.width}px) is below minimum (${options.minWidth}px)`,
      file,
    })
  }

  // Check minimum height
  if (options.minHeight !== undefined && dimensions.height < options.minHeight) {
    errors.push({
      code: 'INVALID_DIMENSIONS',
      message: `Image height (${dimensions.height}px) is below minimum (${options.minHeight}px)`,
      file,
    })
  }

  // Check maximum width
  if (options.maxWidth !== undefined && dimensions.width > options.maxWidth) {
    errors.push({
      code: 'INVALID_DIMENSIONS',
      message: `Image width (${dimensions.width}px) exceeds maximum (${options.maxWidth}px)`,
      file,
    })
  }

  // Check maximum height
  if (options.maxHeight !== undefined && dimensions.height > options.maxHeight) {
    errors.push({
      code: 'INVALID_DIMENSIONS',
      message: `Image height (${dimensions.height}px) exceeds maximum (${options.maxHeight}px)`,
      file,
    })
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
