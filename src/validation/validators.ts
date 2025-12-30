import type { AspectRatioOptions, FileItem, Validator } from '../types'
import { getFileExtension, isImage } from '../utils/file'
import { getImageDimensions } from './image'

/**
 * Validator that checks file name against a regex pattern
 */
export function fileName(pattern: RegExp): Validator {
  return {
    name: 'fileName',
    validate: (file: File) => {
      if (!pattern.test(file.name)) {
        throw new Error(`File name "${file.name}" does not match pattern ${pattern}`)
      }
    },
  }
}

/**
 * Validator that checks file extension against allowed list
 */
export function extension(allowed: string[]): Validator {
  const normalizedAllowed = allowed.map((ext) => ext.toLowerCase().replace(/^\./, ''))

  return {
    name: 'extension',
    validate: (file: File) => {
      const ext = getFileExtension(file)

      if (!normalizedAllowed.includes(ext)) {
        throw new Error(
          `File extension ".${ext}" is not allowed. Allowed: ${normalizedAllowed.map((e) => `.${e}`).join(', ')}`
        )
      }
    },
  }
}

/**
 * Validator that checks image aspect ratio
 */
export function aspectRatio(options: AspectRatioOptions): Validator {
  return {
    name: 'aspectRatio',
    validate: async (file: File) => {
      // Skip non-image files
      if (!isImage(file)) {
        return
      }

      const dimensions = await getImageDimensions(file)
      const ratio = dimensions.width / dimensions.height

      if (options.exact !== undefined) {
        // Allow 1% tolerance for floating point comparison
        const tolerance = 0.01
        if (Math.abs(ratio - options.exact) > tolerance) {
          throw new Error(
            `Image aspect ratio (${ratio.toFixed(2)}) does not match required ratio (${options.exact})`
          )
        }
        return
      }

      if (options.min !== undefined && ratio < options.min) {
        throw new Error(
          `Image aspect ratio (${ratio.toFixed(2)}) is below minimum (${options.min})`
        )
      }

      if (options.max !== undefined && ratio > options.max) {
        throw new Error(
          `Image aspect ratio (${ratio.toFixed(2)}) exceeds maximum (${options.max})`
        )
      }
    },
  }
}

/**
 * Validator that prevents duplicate files (by name and size)
 */
export function noDuplicates(): Validator {
  return {
    name: 'noDuplicates',
    validate: (file: File, existingFiles: FileItem[]) => {
      const duplicate = existingFiles.find(
        (existing) => existing.name === file.name && existing.size === file.size
      )

      if (duplicate) {
        throw new Error(`File "${file.name}" already exists`)
      }
    },
  }
}

/**
 * Collection of built-in validators
 */
export const validators = {
  fileName,
  extension,
  aspectRatio,
  noDuplicates,
}
