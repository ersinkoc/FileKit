/**
 * MIME type mappings for common extensions
 */
const extensionToMime: Record<string, string> = {
  // Images
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  ico: 'image/x-icon',
  bmp: 'image/bmp',
  tiff: 'image/tiff',
  tif: 'image/tiff',
  avif: 'image/avif',
  heic: 'image/heic',
  heif: 'image/heif',

  // Videos
  mp4: 'video/mp4',
  webm: 'video/webm',
  ogg: 'video/ogg',
  ogv: 'video/ogg',
  avi: 'video/x-msvideo',
  mov: 'video/quicktime',
  wmv: 'video/x-ms-wmv',
  flv: 'video/x-flv',
  mkv: 'video/x-matroska',
  m4v: 'video/x-m4v',

  // Audio
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  flac: 'audio/flac',
  aac: 'audio/aac',
  oga: 'audio/ogg',
  m4a: 'audio/mp4',
  wma: 'audio/x-ms-wma',
  aiff: 'audio/aiff',

  // Documents
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  odt: 'application/vnd.oasis.opendocument.text',
  ods: 'application/vnd.oasis.opendocument.spreadsheet',
  odp: 'application/vnd.oasis.opendocument.presentation',
  rtf: 'application/rtf',
  txt: 'text/plain',
  csv: 'text/csv',

  // Code
  html: 'text/html',
  htm: 'text/html',
  css: 'text/css',
  js: 'application/javascript',
  mjs: 'application/javascript',
  json: 'application/json',
  xml: 'application/xml',
  md: 'text/markdown',
  ts: 'application/typescript',
  tsx: 'application/typescript',
  jsx: 'text/jsx',

  // Archives
  zip: 'application/zip',
  rar: 'application/x-rar-compressed',
  '7z': 'application/x-7z-compressed',
  tar: 'application/x-tar',
  gz: 'application/gzip',
  bz2: 'application/x-bzip2',

  // Other
  exe: 'application/x-msdownload',
  dmg: 'application/x-apple-diskimage',
  iso: 'application/x-iso9660-image',
  ttf: 'font/ttf',
  otf: 'font/otf',
  woff: 'font/woff',
  woff2: 'font/woff2',
  eot: 'application/vnd.ms-fontobject',
}

/**
 * Reverse mapping from MIME to extension
 */
const mimeToExtension: Record<string, string> = {}
for (const [ext, mime] of Object.entries(extensionToMime)) {
  if (!(mime in mimeToExtension)) {
    mimeToExtension[mime] = ext
  }
}

/**
 * Get MIME type for an extension
 */
export function getMimeType(extension: string): string {
  const ext = extension.toLowerCase().replace(/^\./, '')
  return extensionToMime[ext] ?? 'application/octet-stream'
}

/**
 * Get extension for a MIME type
 */
export function getExtensionFromMime(mime: string): string {
  return mimeToExtension[mime.toLowerCase()] ?? ''
}

/**
 * Check if a MIME type matches a pattern
 * Supports wildcards like "image/*"
 */
export function matchesMimePattern(type: string, pattern: string): boolean {
  if (pattern === '*' || pattern === '*/*') {
    return true
  }

  const normalizedType = type.toLowerCase()
  const normalizedPattern = pattern.toLowerCase()

  // Exact match
  if (normalizedType === normalizedPattern) {
    return true
  }

  // Wildcard match (e.g., "image/*")
  if (normalizedPattern.endsWith('/*')) {
    const category = normalizedPattern.slice(0, -2)
    return normalizedType.startsWith(category + '/')
  }

  // Extension pattern (e.g., ".jpg")
  if (normalizedPattern.startsWith('.')) {
    const ext = normalizedPattern.slice(1)
    const expectedMime = getMimeType(ext)
    return normalizedType === expectedMime
  }

  return false
}

/**
 * Check if a MIME type matches any of the patterns
 */
export function matchesAnyMimePattern(type: string, patterns: string[]): boolean {
  return patterns.some((pattern) => matchesMimePattern(type, pattern))
}
