/**
 * Test fixtures for file-related tests
 */

/**
 * Create a mock File object
 */
export function createMockFile(
  name: string,
  type: string,
  size: number = 1024
): File {
  const content = 'x'.repeat(size)
  const blob = new Blob([content], { type })
  return new File([blob], name, { type })
}

/**
 * Create a mock image file
 */
export function createMockImageFile(
  name: string = 'test.jpg',
  size: number = 1024
): File {
  return createMockFile(name, 'image/jpeg', size)
}

/**
 * Create a mock PDF file
 */
export function createMockPDFFile(
  name: string = 'document.pdf',
  size: number = 1024
): File {
  return createMockFile(name, 'application/pdf', size)
}

/**
 * Create a mock text file
 */
export function createMockTextFile(
  name: string = 'readme.txt',
  size: number = 1024
): File {
  return createMockFile(name, 'text/plain', size)
}

/**
 * Create a mock video file
 */
export function createMockVideoFile(
  name: string = 'video.mp4',
  size: number = 1024
): File {
  return createMockFile(name, 'video/mp4', size)
}

/**
 * Create a mock audio file
 */
export function createMockAudioFile(
  name: string = 'audio.mp3',
  size: number = 1024
): File {
  return createMockFile(name, 'audio/mpeg', size)
}

/**
 * Create a FileList from files
 */
export function createFileList(files: File[]): FileList {
  const dataTransfer = new DataTransfer()
  files.forEach((file) => dataTransfer.items.add(file))
  return dataTransfer.files
}
