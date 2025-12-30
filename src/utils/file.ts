import type { FileCategory } from '../types'

/**
 * Check if a file is an image
 */
export function isImage(file: File): boolean {
  return file.type.startsWith('image/')
}

/**
 * Check if a file is a video
 */
export function isVideo(file: File): boolean {
  return file.type.startsWith('video/')
}

/**
 * Check if a file is audio
 */
export function isAudio(file: File): boolean {
  return file.type.startsWith('audio/')
}

/**
 * Check if a file is a PDF
 */
export function isPDF(file: File): boolean {
  return file.type === 'application/pdf'
}

/**
 * Get file extension from file or filename
 */
export function getFileExtension(file: File | string): string {
  const name = typeof file === 'string' ? file : file.name
  const lastDot = name.lastIndexOf('.')
  if (lastDot === -1 || lastDot === name.length - 1) {
    return ''
  }
  return name.substring(lastDot + 1).toLowerCase()
}

/**
 * Get file category based on MIME type
 */
export function getFileCategory(file: File): FileCategory {
  const type = file.type

  if (type.startsWith('image/')) {
    return 'image'
  }

  if (type.startsWith('video/')) {
    return 'video'
  }

  if (type.startsWith('audio/')) {
    return 'audio'
  }

  if (
    type === 'application/pdf' ||
    type.startsWith('application/msword') ||
    type.startsWith('application/vnd.openxmlformats-officedocument') ||
    type.startsWith('application/vnd.oasis.opendocument') ||
    type === 'text/plain' ||
    type === 'text/html' ||
    type === 'text/css' ||
    type === 'text/javascript' ||
    type === 'application/json' ||
    type === 'application/xml' ||
    type.startsWith('text/')
  ) {
    return 'document'
  }

  if (
    type === 'application/zip' ||
    type === 'application/x-rar-compressed' ||
    type === 'application/x-7z-compressed' ||
    type === 'application/gzip' ||
    type === 'application/x-tar' ||
    type === 'application/x-bzip2'
  ) {
    return 'archive'
  }

  return 'other'
}
