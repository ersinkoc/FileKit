import { describe, it, expect } from 'vitest'
import { getImageDimensions, validateImageDimensions } from '../../../src/validation/image'

function createMockImageFile(name = 'test.jpg'): File {
  const blob = new Blob(['fake-image-data'], { type: 'image/jpeg' })
  return new File([blob], name, { type: 'image/jpeg' })
}

function createMockNonImageFile(): File {
  const blob = new Blob(['test'], { type: 'text/plain' })
  return new File([blob], 'test.txt', { type: 'text/plain' })
}

describe('getImageDimensions', () => {
  it('should return dimensions for image file', async () => {
    const file = createMockImageFile()
    const dimensions = await getImageDimensions(file)
    expect(dimensions.width).toBe(100) // From mock
    expect(dimensions.height).toBe(100) // From mock
  })

  it('should reject non-image files', async () => {
    const file = createMockNonImageFile()
    await expect(getImageDimensions(file)).rejects.toThrow('File is not an image')
  })

  it('should reject on image load error', async () => {
    const file = createMockImageFile('error.jpg')
    await expect(getImageDimensions(file)).rejects.toThrow('Failed to load image')
  })
})

describe('validateImageDimensions', () => {
  it('should pass when dimensions are within limits', async () => {
    const file = createMockImageFile()
    const result = await validateImageDimensions(file, {
      minWidth: 50,
      minHeight: 50,
      maxWidth: 200,
      maxHeight: 200,
    })
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should fail when width is below minimum', async () => {
    const file = createMockImageFile()
    const result = await validateImageDimensions(file, { minWidth: 150 })
    expect(result.valid).toBe(false)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0]?.code).toBe('INVALID_DIMENSIONS')
    expect(result.errors[0]?.message).toContain('width')
  })

  it('should fail when height is below minimum', async () => {
    const file = createMockImageFile()
    const result = await validateImageDimensions(file, { minHeight: 150 })
    expect(result.valid).toBe(false)
    expect(result.errors[0]?.message).toContain('height')
  })

  it('should fail when width exceeds maximum', async () => {
    const file = createMockImageFile()
    const result = await validateImageDimensions(file, { maxWidth: 50 })
    expect(result.valid).toBe(false)
    expect(result.errors[0]?.message).toContain('exceeds')
  })

  it('should fail when height exceeds maximum', async () => {
    const file = createMockImageFile()
    const result = await validateImageDimensions(file, { maxHeight: 50 })
    expect(result.valid).toBe(false)
  })

  it('should skip validation for non-image files', async () => {
    const file = createMockNonImageFile()
    const result = await validateImageDimensions(file, { maxWidth: 10 })
    expect(result.valid).toBe(true)
  })

  it('should pass when no constraints are specified', async () => {
    const file = createMockImageFile()
    const result = await validateImageDimensions(file, {})
    expect(result.valid).toBe(true)
  })

  it('should handle image load error gracefully', async () => {
    const file = createMockImageFile('error.jpg')
    const result = await validateImageDimensions(file, { maxWidth: 100 })
    expect(result.valid).toBe(false)
    expect(result.errors[0]?.code).toBe('INVALID_DIMENSIONS')
  })
})
