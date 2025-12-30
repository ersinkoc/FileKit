import { describe, it, expect } from 'vitest'
import { createValidator } from '../../../src/validation/validator'

function createMockFile(name: string, type: string, size: number): File {
  const blob = new Blob(['x'.repeat(size)], { type })
  return new File([blob], name, { type })
}

function createMockImageFile(name = 'test.jpg', size = 1000): File {
  const blob = new Blob(['x'.repeat(size)], { type: 'image/jpeg' })
  return new File([blob], name, { type: 'image/jpeg' })
}

describe('createValidator', () => {
  describe('validate', () => {
    it('should pass when all validations pass', async () => {
      const validator = createValidator({
        maxFileSize: 10000,
        minFileSize: 100,
        allowedTypes: ['text/plain'],
      })

      const file = createMockFile('test.txt', 'text/plain', 1000)
      const result = await validator.validate(file)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should fail when file is too large', async () => {
      const validator = createValidator({
        maxFileSize: 1000,
      })

      const file = createMockFile('test.txt', 'text/plain', 5000)
      const result = await validator.validate(file)

      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.code === 'FILE_TOO_LARGE')).toBe(true)
    })

    it('should fail when file is too small', async () => {
      const validator = createValidator({
        minFileSize: 1000,
      })

      const file = createMockFile('test.txt', 'text/plain', 100)
      const result = await validator.validate(file)

      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.code === 'FILE_TOO_SMALL')).toBe(true)
    })

    it('should fail when file type is not allowed', async () => {
      const validator = createValidator({
        allowedTypes: ['image/*'],
      })

      const file = createMockFile('test.txt', 'text/plain', 1000)
      const result = await validator.validate(file)

      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.code === 'INVALID_TYPE')).toBe(true)
    })

    it('should fail when file type is blocked', async () => {
      const validator = createValidator({
        blockedTypes: ['application/x-msdownload'],
      })

      const file = createMockFile('test.exe', 'application/x-msdownload', 1000)
      const result = await validator.validate(file)

      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.code === 'INVALID_TYPE')).toBe(true)
    })

    it('should validate image dimensions', async () => {
      const validator = createValidator({
        maxImageWidth: 50,
        maxImageHeight: 50,
      })

      const file = createMockImageFile() // 100x100
      const result = await validator.validate(file)

      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.code === 'INVALID_DIMENSIONS')).toBe(true)
    })

    it('should run custom validators', async () => {
      const validator = createValidator({
        validators: [
          {
            name: 'custom',
            validate: (file) => {
              if (file.name.startsWith('invalid')) {
                throw new Error('Invalid file name')
              }
            },
          },
        ],
      })

      const validFile = createMockFile('valid.txt', 'text/plain', 1000)
      const invalidFile = createMockFile('invalid.txt', 'text/plain', 1000)

      const validResult = await validator.validate(validFile)
      const invalidResult = await validator.validate(invalidFile)

      expect(validResult.valid).toBe(true)
      expect(invalidResult.valid).toBe(false)
      expect(invalidResult.errors.some((e) => e.code === 'VALIDATION_FAILED')).toBe(true)
    })

    it('should collect multiple errors', async () => {
      const validator = createValidator({
        maxFileSize: 100,
        allowedTypes: ['image/*'],
      })

      const file = createMockFile('test.txt', 'text/plain', 5000)
      const result = await validator.validate(file)

      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('validateMany', () => {
    it('should validate multiple files', async () => {
      const validator = createValidator({
        maxFileSize: 2000,
      })

      const files = [
        createMockFile('valid1.txt', 'text/plain', 1000),
        createMockFile('valid2.txt', 'text/plain', 1500),
        createMockFile('invalid.txt', 'text/plain', 5000),
      ]

      const result = await validator.validateMany(files)

      expect(result.valid).toHaveLength(2)
      expect(result.invalid).toHaveLength(1)
      expect(result.invalid[0]?.file.name).toBe('invalid.txt')
    })

    it('should handle empty files array', async () => {
      const validator = createValidator({})
      const result = await validator.validateMany([])

      expect(result.valid).toHaveLength(0)
      expect(result.invalid).toHaveLength(0)
    })

    it('should track existing files for duplicate detection', async () => {
      const validator = createValidator({
        validators: [
          {
            name: 'noDuplicates',
            validate: (file, existingFiles) => {
              const duplicate = existingFiles.find((f) => f.name === file.name)
              if (duplicate) {
                throw new Error('Duplicate file')
              }
            },
          },
        ],
      })

      const files = [
        createMockFile('file.txt', 'text/plain', 1000),
        createMockFile('file.txt', 'text/plain', 1000),
      ]

      const result = await validator.validateMany(files)

      expect(result.valid).toHaveLength(1)
      expect(result.invalid).toHaveLength(1)
    })
  })
})
