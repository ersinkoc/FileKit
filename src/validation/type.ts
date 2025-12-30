import type { TypeValidationOptions, ValidationResult } from '../types'
import { matchesAnyMimePattern } from '../utils/mime'

/**
 * Validate file type against allowed/blocked patterns
 */
export function validateFileType(
  file: File,
  options: TypeValidationOptions
): ValidationResult {
  const errors: ValidationResult['errors'] = []
  const fileType = file.type || 'application/octet-stream'

  // Check blocked types first
  if (options.blocked && options.blocked.length > 0) {
    if (matchesAnyMimePattern(fileType, options.blocked)) {
      errors.push({
        code: 'INVALID_TYPE',
        message: `File type "${fileType}" is not allowed`,
        file,
      })
      return { valid: false, errors }
    }
  }

  // Check allowed types
  if (options.allowed && options.allowed.length > 0) {
    if (!matchesAnyMimePattern(fileType, options.allowed)) {
      errors.push({
        code: 'INVALID_TYPE',
        message: `File type "${fileType}" is not in the allowed types: ${options.allowed.join(', ')}`,
        file,
      })
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
