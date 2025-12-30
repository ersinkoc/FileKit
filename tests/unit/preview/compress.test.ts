import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { compressImage } from '../../../src/preview/compress'

function createMockImageFile(name = 'test.jpg', size = 5000): File {
  const blob = new Blob(['x'.repeat(size)], { type: 'image/jpeg' })
  return new File([blob], name, { type: 'image/jpeg' })
}

function createMockNonImageFile(): File {
  const blob = new Blob(['test content'], { type: 'text/plain' })
  return new File([blob], 'test.txt', { type: 'text/plain' })
}

describe('compressImage', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should throw error for non-image files', async () => {
    const file = createMockNonImageFile()

    await expect(compressImage(file)).rejects.toThrow('File is not an image')
  })

  it('should compress an image file', async () => {
    const file = createMockImageFile()

    const promise = compressImage(file)
    await vi.advanceTimersByTimeAsync(100)
    const result = await promise

    expect(result).toBeInstanceOf(File)
    expect(result.type).toBe('image/jpeg')
  })

  it('should use custom options', async () => {
    const file = createMockImageFile()

    const promise = compressImage(file, {
      maxWidth: 800,
      maxHeight: 600,
      quality: 0.5,
      type: 'image/png',
    })

    await vi.advanceTimersByTimeAsync(100)
    const result = await promise

    expect(result.type).toBe('image/png')
    expect(result.name).toBe('test.png')
  })

  it('should rename file with new extension', async () => {
    const file = createMockImageFile('photo.jpg')

    const promise = compressImage(file, { type: 'image/webp' })
    await vi.advanceTimersByTimeAsync(100)
    const result = await promise

    expect(result.name).toBe('photo.webp')
  })

  it('should use default jpeg type', async () => {
    const file = createMockImageFile()

    const promise = compressImage(file)
    await vi.advanceTimersByTimeAsync(100)
    const result = await promise

    expect(result.type).toBe('image/jpeg')
  })

  it('should handle files without extension', async () => {
    const blob = new Blob(['test'], { type: 'image/png' })
    const file = new File([blob], 'image', { type: 'image/png' })

    const promise = compressImage(file, { type: 'image/jpeg' })
    await vi.advanceTimersByTimeAsync(100)
    const result = await promise

    expect(result.name).toBe('image.jpeg')
  })
})
