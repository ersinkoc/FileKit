import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getImageDimensions, calculateFitDimensions } from '../../../src/preview/dimensions'

function createMockImageFile(name = 'test.jpg'): File {
  const blob = new Blob(['fake-image-data'], { type: 'image/jpeg' })
  return new File([blob], name, { type: 'image/jpeg' })
}

function createMockNonImageFile(): File {
  const blob = new Blob(['test content'], { type: 'text/plain' })
  return new File([blob], 'test.txt', { type: 'text/plain' })
}

describe('getImageDimensions', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should get dimensions of an image file', async () => {
    const file = createMockImageFile()

    const promise = getImageDimensions(file)
    await vi.advanceTimersByTimeAsync(100)
    const dimensions = await promise

    expect(dimensions.width).toBe(100)
    expect(dimensions.height).toBe(100)
  })

  it('should throw error for non-image files', async () => {
    const file = createMockNonImageFile()

    await expect(getImageDimensions(file)).rejects.toThrow('File is not an image')
  })

  it('should handle image load error', async () => {
    const file = createMockImageFile('error.jpg')

    const promise = getImageDimensions(file)

    // Attach catch handler immediately to prevent unhandled rejection
    const resultPromise = promise.catch((e: Error) => e)

    await vi.advanceTimersByTimeAsync(100)

    const error = await resultPromise
    expect(error).toBeInstanceOf(Error)
    expect((error as Error).message).toBe('Failed to load image')
  })
})

describe('calculateFitDimensions', () => {
  it('should return original dimensions if within bounds', () => {
    const result = calculateFitDimensions(100, 100, 200, 200)

    expect(result.width).toBe(100)
    expect(result.height).toBe(100)
  })

  it('should scale down width-constrained images', () => {
    const result = calculateFitDimensions(400, 200, 200, 200)

    expect(result.width).toBe(200)
    expect(result.height).toBe(100)
  })

  it('should scale down height-constrained images', () => {
    const result = calculateFitDimensions(200, 400, 200, 200)

    expect(result.width).toBe(100)
    expect(result.height).toBe(200)
  })

  it('should maintain aspect ratio for landscape images', () => {
    const result = calculateFitDimensions(1600, 900, 800, 600)

    expect(result.width).toBe(800)
    expect(result.height).toBe(450)
  })

  it('should maintain aspect ratio for portrait images', () => {
    const result = calculateFitDimensions(900, 1600, 800, 600)

    expect(result.width).toBe(338)
    expect(result.height).toBe(600)
  })

  it('should handle square images', () => {
    const result = calculateFitDimensions(1000, 1000, 200, 200)

    expect(result.width).toBe(200)
    expect(result.height).toBe(200)
  })

  it('should round dimensions', () => {
    const result = calculateFitDimensions(333, 222, 100, 100)

    expect(Number.isInteger(result.width)).toBe(true)
    expect(Number.isInteger(result.height)).toBe(true)
  })

  it('should handle exact fit', () => {
    const result = calculateFitDimensions(200, 200, 200, 200)

    expect(result.width).toBe(200)
    expect(result.height).toBe(200)
  })
})
