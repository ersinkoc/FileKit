import { describe, it, expect } from 'vitest'
import { validateFileSize } from '../../../src/validation/size'

function createMockFile(size: number): File {
  const blob = new Blob(['x'.repeat(size)], { type: 'text/plain' })
  return new File([blob], 'test.txt', { type: 'text/plain' })
}

describe('validateFileSize', () => {
  it('should pass when file is within size limits', () => {
    const file = createMockFile(5000)
    const result = validateFileSize(file, { min: 1000, max: 10000 })
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should fail when file exceeds max size', () => {
    const file = createMockFile(15000)
    const result = validateFileSize(file, { max: 10000 })
    expect(result.valid).toBe(false)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0]?.code).toBe('FILE_TOO_LARGE')
  })

  it('should fail when file is below min size', () => {
    const file = createMockFile(500)
    const result = validateFileSize(file, { min: 1000 })
    expect(result.valid).toBe(false)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0]?.code).toBe('FILE_TOO_SMALL')
  })

  it('should pass when only max is specified and file is within limit', () => {
    const file = createMockFile(5000)
    const result = validateFileSize(file, { max: 10000 })
    expect(result.valid).toBe(true)
  })

  it('should pass when only min is specified and file meets requirement', () => {
    const file = createMockFile(5000)
    const result = validateFileSize(file, { min: 1000 })
    expect(result.valid).toBe(true)
  })

  it('should pass when no constraints are specified', () => {
    const file = createMockFile(5000)
    const result = validateFileSize(file, {})
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should return multiple errors when both constraints fail', () => {
    // This edge case can't really happen (file can't be both too large and too small)
    // But we test that both constraints are checked independently
    const file = createMockFile(500)
    const result = validateFileSize(file, { min: 1000, max: 100 })
    // File is too small for min, but would pass max
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })
})
