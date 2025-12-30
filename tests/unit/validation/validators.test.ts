import { describe, it, expect } from 'vitest'
import { fileName, extension, aspectRatio, noDuplicates } from '../../../src/validation/validators'
import type { FileItem } from '../../../src/types'

function createMockFile(name: string, type = 'text/plain', size = 1024): File {
  const blob = new Blob(['x'.repeat(size)], { type })
  return new File([blob], name, { type })
}

function createMockImageFile(name = 'test.jpg'): File {
  const blob = new Blob(['fake-image'], { type: 'image/jpeg' })
  return new File([blob], name, { type: 'image/jpeg' })
}

function createMockFileItem(name: string, size = 1024): FileItem {
  return {
    id: 'test-id',
    file: createMockFile(name, 'text/plain', size),
    name,
    size,
    type: 'text/plain',
    status: 'pending',
    progress: 0,
    uploadedBytes: 0,
    metadata: {},
    addedAt: new Date(),
  }
}

describe('fileName validator', () => {
  it('should pass when name matches pattern', () => {
    const validator = fileName(/^[a-zA-Z0-9_-]+\.[a-z]+$/)
    const file = createMockFile('valid-file_123.txt')
    expect(() => validator.validate(file, [])).not.toThrow()
  })

  it('should fail when name does not match pattern', () => {
    const validator = fileName(/^[a-zA-Z]+\.txt$/)
    const file = createMockFile('invalid123.txt')
    expect(() => validator.validate(file, [])).toThrow()
  })

  it('should have correct name property', () => {
    const validator = fileName(/.*/)
    expect(validator.name).toBe('fileName')
  })
})

describe('extension validator', () => {
  it('should pass when extension is in allowed list', () => {
    const validator = extension(['txt', 'pdf', 'doc'])
    const file = createMockFile('document.txt')
    expect(() => validator.validate(file, [])).not.toThrow()
  })

  it('should fail when extension is not in allowed list', () => {
    const validator = extension(['txt', 'pdf'])
    const file = createMockFile('document.exe')
    expect(() => validator.validate(file, [])).toThrow()
  })

  it('should be case-insensitive', () => {
    const validator = extension(['txt', 'pdf'])
    const file = createMockFile('document.TXT')
    expect(() => validator.validate(file, [])).not.toThrow()
  })

  it('should handle extensions with leading dot', () => {
    const validator = extension(['.txt', '.pdf'])
    const file = createMockFile('document.txt')
    expect(() => validator.validate(file, [])).not.toThrow()
  })
})

describe('aspectRatio validator', () => {
  it('should pass when ratio is within range', async () => {
    const validator = aspectRatio({ min: 0.5, max: 2 })
    const file = createMockImageFile() // 100x100 = ratio 1
    await expect(validator.validate(file, [])).resolves.toBeUndefined()
  })

  it('should fail when ratio is below minimum', async () => {
    const validator = aspectRatio({ min: 1.5 })
    const file = createMockImageFile() // ratio 1
    await expect(validator.validate(file, [])).rejects.toThrow()
  })

  it('should fail when ratio exceeds maximum', async () => {
    const validator = aspectRatio({ max: 0.5 })
    const file = createMockImageFile() // ratio 1
    await expect(validator.validate(file, [])).rejects.toThrow()
  })

  it('should pass when ratio matches exact value', async () => {
    const validator = aspectRatio({ exact: 1 })
    const file = createMockImageFile() // 100x100 = ratio 1
    await expect(validator.validate(file, [])).resolves.toBeUndefined()
  })

  it('should fail when ratio does not match exact value', async () => {
    const validator = aspectRatio({ exact: 2 })
    const file = createMockImageFile() // ratio 1
    await expect(validator.validate(file, [])).rejects.toThrow()
  })

  it('should skip non-image files', async () => {
    const validator = aspectRatio({ exact: 16 / 9 })
    const file = createMockFile('document.pdf', 'application/pdf')
    await expect(validator.validate(file, [])).resolves.toBeUndefined()
  })
})

describe('noDuplicates validator', () => {
  it('should pass when file is not duplicate', () => {
    const validator = noDuplicates()
    const file = createMockFile('new-file.txt', 'text/plain', 1000)
    const existing = [createMockFileItem('other-file.txt', 2000)]
    expect(() => validator.validate(file, existing)).not.toThrow()
  })

  it('should fail when file is duplicate (same name and size)', () => {
    const validator = noDuplicates()
    const file = createMockFile('duplicate.txt', 'text/plain', 1000)
    const existing = [createMockFileItem('duplicate.txt', 1000)]
    expect(() => validator.validate(file, existing)).toThrow('already exists')
  })

  it('should pass when same name but different size', () => {
    const validator = noDuplicates()
    const file = createMockFile('file.txt', 'text/plain', 2000)
    const existing = [createMockFileItem('file.txt', 1000)]
    expect(() => validator.validate(file, existing)).not.toThrow()
  })

  it('should pass when same size but different name', () => {
    const validator = noDuplicates()
    const file = createMockFile('file1.txt', 'text/plain', 1000)
    const existing = [createMockFileItem('file2.txt', 1000)]
    expect(() => validator.validate(file, existing)).not.toThrow()
  })

  it('should pass when existing files list is empty', () => {
    const validator = noDuplicates()
    const file = createMockFile('file.txt')
    expect(() => validator.validate(file, [])).not.toThrow()
  })
})
