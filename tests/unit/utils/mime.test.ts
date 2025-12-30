import { describe, it, expect } from 'vitest'
import {
  getMimeType,
  getExtensionFromMime,
  matchesMimePattern,
  matchesAnyMimePattern,
} from '../../../src/utils/mime'

describe('getMimeType', () => {
  it('should return correct MIME types for common extensions', () => {
    expect(getMimeType('jpg')).toBe('image/jpeg')
    expect(getMimeType('jpeg')).toBe('image/jpeg')
    expect(getMimeType('png')).toBe('image/png')
    expect(getMimeType('gif')).toBe('image/gif')
    expect(getMimeType('pdf')).toBe('application/pdf')
    expect(getMimeType('mp4')).toBe('video/mp4')
    expect(getMimeType('mp3')).toBe('audio/mpeg')
    expect(getMimeType('txt')).toBe('text/plain')
    expect(getMimeType('json')).toBe('application/json')
  })

  it('should handle extension with dot', () => {
    expect(getMimeType('.jpg')).toBe('image/jpeg')
    expect(getMimeType('.PDF')).toBe('application/pdf')
  })

  it('should be case-insensitive', () => {
    expect(getMimeType('JPG')).toBe('image/jpeg')
    expect(getMimeType('PNG')).toBe('image/png')
  })

  it('should return octet-stream for unknown extensions', () => {
    expect(getMimeType('xyz')).toBe('application/octet-stream')
    expect(getMimeType('unknown')).toBe('application/octet-stream')
  })
})

describe('getExtensionFromMime', () => {
  it('should return correct extension for common MIME types', () => {
    expect(getExtensionFromMime('image/jpeg')).toBe('jpg')
    expect(getExtensionFromMime('image/png')).toBe('png')
    expect(getExtensionFromMime('application/pdf')).toBe('pdf')
    expect(getExtensionFromMime('video/mp4')).toBe('mp4')
    expect(getExtensionFromMime('audio/mpeg')).toBe('mp3')
  })

  it('should return empty string for unknown MIME types', () => {
    expect(getExtensionFromMime('application/x-unknown')).toBe('')
  })
})

describe('matchesMimePattern', () => {
  it('should match exact MIME types', () => {
    expect(matchesMimePattern('image/jpeg', 'image/jpeg')).toBe(true)
    expect(matchesMimePattern('application/pdf', 'application/pdf')).toBe(true)
    expect(matchesMimePattern('image/jpeg', 'image/png')).toBe(false)
  })

  it('should match wildcard patterns', () => {
    expect(matchesMimePattern('image/jpeg', 'image/*')).toBe(true)
    expect(matchesMimePattern('image/png', 'image/*')).toBe(true)
    expect(matchesMimePattern('video/mp4', 'image/*')).toBe(false)
    expect(matchesMimePattern('video/mp4', 'video/*')).toBe(true)
  })

  it('should match universal wildcard', () => {
    expect(matchesMimePattern('image/jpeg', '*')).toBe(true)
    expect(matchesMimePattern('application/pdf', '*/*')).toBe(true)
  })

  it('should match extension patterns', () => {
    expect(matchesMimePattern('image/jpeg', '.jpg')).toBe(true)
    expect(matchesMimePattern('image/jpeg', '.jpeg')).toBe(true)
    expect(matchesMimePattern('application/pdf', '.pdf')).toBe(true)
    expect(matchesMimePattern('image/jpeg', '.png')).toBe(false)
  })

  it('should be case-insensitive', () => {
    expect(matchesMimePattern('IMAGE/JPEG', 'image/jpeg')).toBe(true)
    expect(matchesMimePattern('image/jpeg', 'IMAGE/JPEG')).toBe(true)
    expect(matchesMimePattern('IMAGE/JPEG', 'image/*')).toBe(true)
  })
})

describe('matchesAnyMimePattern', () => {
  it('should return true if any pattern matches', () => {
    expect(matchesAnyMimePattern('image/jpeg', ['image/*', 'application/pdf'])).toBe(true)
    expect(matchesAnyMimePattern('application/pdf', ['image/*', 'application/pdf'])).toBe(true)
    expect(matchesAnyMimePattern('video/mp4', ['image/*', 'video/*'])).toBe(true)
  })

  it('should return false if no pattern matches', () => {
    expect(matchesAnyMimePattern('video/mp4', ['image/*', 'application/pdf'])).toBe(false)
    expect(matchesAnyMimePattern('audio/mpeg', ['image/*'])).toBe(false)
  })

  it('should handle empty patterns array', () => {
    expect(matchesAnyMimePattern('image/jpeg', [])).toBe(false)
  })
})
