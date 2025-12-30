import { describe, it, expect } from 'vitest'
import { validateFileType } from '../../../src/validation/type'

function createMockFile(name: string, type: string): File {
  const blob = new Blob(['test'], { type })
  return new File([blob], name, { type })
}

describe('validateFileType', () => {
  it('should pass when file type is in allowed list', () => {
    const file = createMockFile('test.jpg', 'image/jpeg')
    const result = validateFileType(file, { allowed: ['image/jpeg', 'image/png'] })
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should pass when file type matches wildcard pattern', () => {
    const file = createMockFile('test.jpg', 'image/jpeg')
    const result = validateFileType(file, { allowed: ['image/*'] })
    expect(result.valid).toBe(true)
  })

  it('should fail when file type is not in allowed list', () => {
    const file = createMockFile('test.pdf', 'application/pdf')
    const result = validateFileType(file, { allowed: ['image/jpeg', 'image/png'] })
    expect(result.valid).toBe(false)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0]?.code).toBe('INVALID_TYPE')
  })

  it('should fail when file type is in blocked list', () => {
    const file = createMockFile('test.exe', 'application/x-msdownload')
    const result = validateFileType(file, { blocked: ['application/x-msdownload'] })
    expect(result.valid).toBe(false)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0]?.code).toBe('INVALID_TYPE')
  })

  it('should pass when file type is not in blocked list', () => {
    const file = createMockFile('test.jpg', 'image/jpeg')
    const result = validateFileType(file, { blocked: ['application/x-msdownload'] })
    expect(result.valid).toBe(true)
  })

  it('should check blocked types before allowed types', () => {
    const file = createMockFile('test.gif', 'image/gif')
    const result = validateFileType(file, {
      allowed: ['image/*'],
      blocked: ['image/gif'],
    })
    expect(result.valid).toBe(false)
  })

  it('should pass when no constraints are specified', () => {
    const file = createMockFile('test.xyz', 'application/x-custom')
    const result = validateFileType(file, {})
    expect(result.valid).toBe(true)
  })

  it('should handle files without type as octet-stream', () => {
    const file = createMockFile('test', '')
    const result = validateFileType(file, { allowed: ['application/octet-stream'] })
    expect(result.valid).toBe(true)
  })
})
