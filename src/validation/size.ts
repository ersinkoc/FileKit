import type { SizeValidationOptions, ValidationResult } from '../types'
import { formatFileSize } from '../utils/size'

/**
 * Validate file size against min/max constraints
 */
export function validateFileSize(
  file: File,
  options: SizeValidationOptions
): ValidationResult {
  const errors: ValidationResult['errors'] = []

  if (options.max !== undefined && file.size > options.max) {
    errors.push({
      code: 'FILE_TOO_LARGE',
      message: `File size (${formatFileSize(file.size)}) exceeds maximum (${formatFileSize(options.max)})`,
      file,
    })
  }

  if (options.min !== undefined && file.size < options.min) {
    errors.push({
      code: 'FILE_TOO_SMALL',
      message: `File size (${formatFileSize(file.size)}) is below minimum (${formatFileSize(options.min)})`,
      file,
    })
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
