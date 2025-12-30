import type { FileItem, UploadCallbacks, UploaderConfig, XHRUploadHandle } from '../types'
import {
  createNetworkError,
  createServerError,
  createTimeoutError,
  createCancelledError,
} from '../errors'
import { calculateProgress } from './progress'

/**
 * Upload a file using XMLHttpRequest
 */
export function uploadWithXHR(
  file: FileItem,
  config: UploaderConfig,
  callbacks: UploadCallbacks
): XHRUploadHandle {
  const xhr = new XMLHttpRequest()
  let aborted = false
  const startTime = Date.now()

  const promise = new Promise<unknown>((resolve, reject) => {
    // Determine endpoint
    const endpoint =
      typeof config.endpoint === 'function' ? config.endpoint(file) : config.endpoint

    // Create FormData
    const formData = new FormData()
    formData.append(config.fieldName ?? 'file', file.file, file.name)

    // Apply transformRequest if provided
    const finalFormData = config.transformRequest
      ? config.transformRequest(formData, file)
      : formData

    // Configure XHR
    xhr.open(config.method ?? 'POST', endpoint, true)

    // Set headers
    const headers =
      typeof config.headers === 'function' ? config.headers(file) : config.headers

    if (headers) {
      for (const [key, value] of Object.entries(headers)) {
        xhr.setRequestHeader(key, value)
      }
    }

    // Set credentials
    xhr.withCredentials = config.withCredentials ?? false

    // Set timeout
    if (config.timeout) {
      xhr.timeout = config.timeout
    }

    // Track upload progress
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && !aborted) {
        const progress = calculateProgress(event.loaded, event.total, startTime)
        callbacks.onProgress?.(event.loaded, event.total)

        // Update file item properties
        ;(file as { uploadedBytes: number }).uploadedBytes = event.loaded
        ;(file as { progress: number }).progress = progress.percentage
      }
    })

    // Handle completion
    xhr.onload = () => {
      if (aborted) return

      if (xhr.status >= 200 && xhr.status < 300) {
        let response: unknown
        try {
          response = JSON.parse(xhr.responseText)
        } catch {
          response = xhr.responseText
        }
        callbacks.onComplete?.(response)
        resolve(response)
      } else {
        let response: unknown
        try {
          response = JSON.parse(xhr.responseText)
        } catch {
          response = xhr.responseText
        }
        const error = createServerError(xhr.status, response, file)
        callbacks.onError?.(error)
        reject(error)
      }
    }

    // Handle network error
    xhr.onerror = () => {
      if (aborted) return
      const error = createNetworkError(file)
      callbacks.onError?.(error)
      reject(error)
    }

    // Handle timeout
    xhr.ontimeout = () => {
      if (aborted) return
      const error = createTimeoutError(file)
      callbacks.onError?.(error)
      reject(error)
    }

    // Handle abort
    xhr.onabort = () => {
      const error = createCancelledError(file)
      callbacks.onError?.(error)
      reject(error)
    }

    // Send request
    xhr.send(finalFormData)
  })

  return {
    abort: () => {
      aborted = true
      xhr.abort()
    },
    promise,
  }
}
