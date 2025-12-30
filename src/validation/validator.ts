import type {
  BatchValidationResult,
  FileItem,
  ValidationError,
  ValidationResult,
  ValidatorConfig,
} from '../types'
import { isImage } from '../utils/file'
import { validateImageDimensions } from './image'
import { validateFileSize } from './size'
import { validateFileType } from './type'

/**
 * Create a validator from config
 */
export function createValidator(config: ValidatorConfig) {
  /**
   * Validate a single file
   */
  async function validate(
    file: File,
    existingFiles: FileItem[] = []
  ): Promise<ValidationResult> {
    const errors: ValidationError[] = []

    // Size validation
    if (config.maxFileSize !== undefined || config.minFileSize !== undefined) {
      const sizeResult = validateFileSize(file, {
        max: config.maxFileSize,
        min: config.minFileSize,
      })
      errors.push(...sizeResult.errors)
    }

    // Type validation
    if (config.allowedTypes !== undefined || config.blockedTypes !== undefined) {
      const typeResult = validateFileType(file, {
        allowed: config.allowedTypes,
        blocked: config.blockedTypes,
      })
      errors.push(...typeResult.errors)
    }

    // Image dimension validation (only for images)
    if (isImage(file)) {
      const hasDimensionConstraints =
        config.maxImageWidth !== undefined ||
        config.maxImageHeight !== undefined ||
        config.minImageWidth !== undefined ||
        config.minImageHeight !== undefined

      if (hasDimensionConstraints) {
        const dimensionResult = await validateImageDimensions(file, {
          maxWidth: config.maxImageWidth,
          maxHeight: config.maxImageHeight,
          minWidth: config.minImageWidth,
          minHeight: config.minImageHeight,
        })
        errors.push(...dimensionResult.errors)
      }
    }

    // Custom validators
    if (config.validators) {
      for (const validator of config.validators) {
        try {
          await validator.validate(file, existingFiles)
        } catch (error) {
          errors.push({
            code: 'VALIDATION_FAILED',
            message: error instanceof Error ? error.message : String(error),
            file,
          })
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * Validate multiple files
   */
  async function validateMany(
    files: File[],
    existingFiles: FileItem[] = []
  ): Promise<BatchValidationResult> {
    const result: BatchValidationResult = {
      valid: [],
      invalid: [],
    }

    // Create a mutable copy of existing files to track additions
    const currentFiles = [...existingFiles]

    for (const file of files) {
      const validationResult = await validate(file, currentFiles)

      if (validationResult.valid) {
        // Create a minimal FileItem for tracking
        const fileItem = {
          id: `temp_${Date.now()}_${Math.random()}`,
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          status: 'pending',
          progress: 0,
          uploadedBytes: 0,
          metadata: {},
          addedAt: new Date(),
        } as FileItem

        result.valid.push(fileItem)
        currentFiles.push(fileItem)
      } else {
        result.invalid.push({
          file,
          errors: validationResult.errors,
        })
      }
    }

    return result
  }

  return {
    validate,
    validateMany,
  }
}
