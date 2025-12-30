import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createImagePreview, createBlobPreview } from '../../../src/preview/image-preview'

function createMockImageFile(name = 'test.jpg'): File {
  const blob = new Blob(['fake-image-data'], { type: 'image/jpeg' })
  return new File([blob], name, { type: 'image/jpeg' })
}

function createMockNonImageFile(): File {
  const blob = new Blob(['test content'], { type: 'text/plain' })
  return new File([blob], 'test.txt', { type: 'text/plain' })
}

describe('createImagePreview', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should create a preview for an image file', async () => {
    const file = createMockImageFile()

    const promise = createImagePreview(file)
    await vi.advanceTimersByTimeAsync(100)
    const result = await promise

    expect(result).toBeDefined()
    expect(result.url).toContain('data:image/')
    expect(result.width).toBeGreaterThan(0)
    expect(result.height).toBeGreaterThan(0)
    expect(typeof result.revoke).toBe('function')
  })

  it('should throw error for non-image files', async () => {
    const file = createMockNonImageFile()

    await expect(createImagePreview(file)).rejects.toThrow('File is not an image')
  })

  it('should use custom options', async () => {
    const file = createMockImageFile()

    const promise = createImagePreview(file, {
      maxWidth: 100,
      maxHeight: 100,
      quality: 0.5,
      type: 'image/png',
    })

    await vi.advanceTimersByTimeAsync(100)
    const result = await promise

    expect(result.width).toBeLessThanOrEqual(100)
    expect(result.height).toBeLessThanOrEqual(100)
  })

  it('should provide a revoke function', async () => {
    const file = createMockImageFile()

    const promise = createImagePreview(file)
    await vi.advanceTimersByTimeAsync(100)
    const result = await promise

    // Should not throw
    expect(() => result.revoke()).not.toThrow()
  })

  it('should handle image load error', async () => {
    const file = createMockImageFile('error.jpg')

    const promise = createImagePreview(file)

    // Attach catch handler immediately to prevent unhandled rejection
    const resultPromise = promise.catch((e: Error) => e)

    await vi.advanceTimersByTimeAsync(100)

    const error = await resultPromise
    expect(error).toBeInstanceOf(Error)
    expect((error as Error).message).toBe('Failed to load image')
  })
})

describe('createBlobPreview', () => {
  it('should create a blob URL preview', () => {
    const file = createMockImageFile()

    const result = createBlobPreview(file)

    expect(result).toBeDefined()
    expect(result.url).toContain('blob:')
    expect(result.width).toBe(0) // Unknown until image loads
    expect(result.height).toBe(0)
    expect(typeof result.revoke).toBe('function')
  })

  it('should throw error for non-image files', () => {
    const file = createMockNonImageFile()

    expect(() => createBlobPreview(file)).toThrow('File is not an image')
  })

  it('should revoke the blob URL', () => {
    const file = createMockImageFile()

    const result = createBlobPreview(file)
    const revokeUrlSpy = vi.spyOn(URL, 'revokeObjectURL')

    result.revoke()

    expect(revokeUrlSpy).toHaveBeenCalledWith(result.url)
  })
})
