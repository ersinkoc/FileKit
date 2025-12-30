import { describe, it, expect } from 'vitest'
import {
  isImage,
  isVideo,
  isAudio,
  isPDF,
  getFileExtension,
  getFileCategory,
} from '../../../src/utils/file'

function createMockFile(name: string, type: string, size = 1024): File {
  const blob = new Blob(['x'.repeat(size)], { type })
  return new File([blob], name, { type })
}

describe('isImage', () => {
  it('should return true for image files', () => {
    expect(isImage(createMockFile('test.jpg', 'image/jpeg'))).toBe(true)
    expect(isImage(createMockFile('test.png', 'image/png'))).toBe(true)
    expect(isImage(createMockFile('test.gif', 'image/gif'))).toBe(true)
    expect(isImage(createMockFile('test.webp', 'image/webp'))).toBe(true)
  })

  it('should return false for non-image files', () => {
    expect(isImage(createMockFile('test.pdf', 'application/pdf'))).toBe(false)
    expect(isImage(createMockFile('test.mp4', 'video/mp4'))).toBe(false)
    expect(isImage(createMockFile('test.txt', 'text/plain'))).toBe(false)
  })
})

describe('isVideo', () => {
  it('should return true for video files', () => {
    expect(isVideo(createMockFile('test.mp4', 'video/mp4'))).toBe(true)
    expect(isVideo(createMockFile('test.webm', 'video/webm'))).toBe(true)
    expect(isVideo(createMockFile('test.mov', 'video/quicktime'))).toBe(true)
  })

  it('should return false for non-video files', () => {
    expect(isVideo(createMockFile('test.jpg', 'image/jpeg'))).toBe(false)
    expect(isVideo(createMockFile('test.mp3', 'audio/mpeg'))).toBe(false)
  })
})

describe('isAudio', () => {
  it('should return true for audio files', () => {
    expect(isAudio(createMockFile('test.mp3', 'audio/mpeg'))).toBe(true)
    expect(isAudio(createMockFile('test.wav', 'audio/wav'))).toBe(true)
    expect(isAudio(createMockFile('test.ogg', 'audio/ogg'))).toBe(true)
  })

  it('should return false for non-audio files', () => {
    expect(isAudio(createMockFile('test.mp4', 'video/mp4'))).toBe(false)
    expect(isAudio(createMockFile('test.jpg', 'image/jpeg'))).toBe(false)
  })
})

describe('isPDF', () => {
  it('should return true for PDF files', () => {
    expect(isPDF(createMockFile('test.pdf', 'application/pdf'))).toBe(true)
  })

  it('should return false for non-PDF files', () => {
    expect(isPDF(createMockFile('test.doc', 'application/msword'))).toBe(false)
    expect(isPDF(createMockFile('test.jpg', 'image/jpeg'))).toBe(false)
  })
})

describe('getFileExtension', () => {
  it('should extract extension from File', () => {
    expect(getFileExtension(createMockFile('test.jpg', 'image/jpeg'))).toBe('jpg')
    expect(getFileExtension(createMockFile('test.PDF', 'application/pdf'))).toBe('pdf')
    expect(getFileExtension(createMockFile('file.test.txt', 'text/plain'))).toBe('txt')
  })

  it('should extract extension from string', () => {
    expect(getFileExtension('document.pdf')).toBe('pdf')
    expect(getFileExtension('image.JPEG')).toBe('jpeg')
    expect(getFileExtension('archive.tar.gz')).toBe('gz')
  })

  it('should return empty string for files without extension', () => {
    expect(getFileExtension('noextension')).toBe('')
    expect(getFileExtension('file.')).toBe('')
  })
})

describe('getFileCategory', () => {
  it('should categorize images', () => {
    expect(getFileCategory(createMockFile('test.jpg', 'image/jpeg'))).toBe('image')
    expect(getFileCategory(createMockFile('test.png', 'image/png'))).toBe('image')
  })

  it('should categorize videos', () => {
    expect(getFileCategory(createMockFile('test.mp4', 'video/mp4'))).toBe('video')
    expect(getFileCategory(createMockFile('test.webm', 'video/webm'))).toBe('video')
  })

  it('should categorize audio', () => {
    expect(getFileCategory(createMockFile('test.mp3', 'audio/mpeg'))).toBe('audio')
    expect(getFileCategory(createMockFile('test.wav', 'audio/wav'))).toBe('audio')
  })

  it('should categorize documents', () => {
    expect(getFileCategory(createMockFile('test.pdf', 'application/pdf'))).toBe('document')
    expect(getFileCategory(createMockFile('test.txt', 'text/plain'))).toBe('document')
    expect(getFileCategory(createMockFile('test.doc', 'application/msword'))).toBe('document')
    expect(
      getFileCategory(
        createMockFile(
          'test.docx',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )
      )
    ).toBe('document')
  })

  it('should categorize archives', () => {
    expect(getFileCategory(createMockFile('test.zip', 'application/zip'))).toBe('archive')
    expect(getFileCategory(createMockFile('test.rar', 'application/x-rar-compressed'))).toBe(
      'archive'
    )
  })

  it('should return other for unknown types', () => {
    expect(getFileCategory(createMockFile('test.xyz', 'application/x-custom'))).toBe('other')
  })
})
