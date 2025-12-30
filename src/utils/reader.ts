/**
 * Read a file as a data URL (base64)
 */
export function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Failed to read file as data URL'))
      }
    }

    reader.onerror = () => {
      reject(reader.error ?? new Error('Failed to read file'))
    }

    reader.readAsDataURL(file)
  })
}

/**
 * Read a file as text
 */
export function readAsText(file: File, encoding = 'utf-8'): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Failed to read file as text'))
      }
    }

    reader.onerror = () => {
      reject(reader.error ?? new Error('Failed to read file'))
    }

    reader.readAsText(file, encoding)
  })
}

/**
 * Read a file or blob as an ArrayBuffer
 */
export function readAsArrayBuffer(file: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result)
      } else {
        reject(new Error('Failed to read file as ArrayBuffer'))
      }
    }

    reader.onerror = () => {
      reject(reader.error ?? new Error('Failed to read file'))
    }

    reader.readAsArrayBuffer(file)
  })
}

/**
 * Read a file as JSON
 */
export async function readAsJSON<T = unknown>(file: File): Promise<T> {
  const text = await readAsText(file)
  return JSON.parse(text) as T
}

/**
 * Read a slice of a file as an ArrayBuffer
 */
export function readSlice(file: Blob, start: number, end: number): Promise<ArrayBuffer> {
  const slice = file.slice(start, end)
  return readAsArrayBuffer(slice)
}
