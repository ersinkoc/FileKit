import { describe, it, expect, vi } from 'vitest'
import { createUploader } from '../../src/core/uploader'
import { createMockFile } from '../fixtures/files'

describe('Uploader Integration', () => {
  describe('Complete upload workflow', () => {
    it('should complete a full upload cycle', async () => {
      const uploader = createUploader({ endpoint: '/api/upload' })

      const onAdd = vi.fn()
      const onStart = vi.fn()
      const onProgress = vi.fn()
      const onComplete = vi.fn()

      uploader.on('add', onAdd)
      uploader.on('start', onStart)
      uploader.on('progress', onProgress)
      uploader.on('complete', onComplete)

      // Add file
      const file = createMockFile('document.pdf', 'application/pdf', 5000)
      const item = uploader.addFile(file)

      expect(onAdd).toHaveBeenCalledWith(item)
      expect(item.status).toBe('pending')

      // Upload
      await uploader.upload(item.id)

      expect(onStart).toHaveBeenCalledWith(item)
      expect(onProgress).toHaveBeenCalled()
      expect(onComplete).toHaveBeenCalled()
      expect(item.status).toBe('completed')
      expect(item.progress).toBe(100)
    })

    it('should handle multiple file uploads', async () => {
      const uploader = createUploader({ endpoint: '/api/upload' })
      const onAllComplete = vi.fn()
      uploader.on('allComplete', onAllComplete)

      // Add multiple files
      const files = [
        createMockFile('file1.txt', 'text/plain', 1000),
        createMockFile('file2.txt', 'text/plain', 2000),
        createMockFile('file3.txt', 'text/plain', 3000),
      ]

      const items = uploader.addFiles(files)
      expect(items).toHaveLength(3)

      // Upload all
      await uploader.uploadAll()

      expect(onAllComplete).toHaveBeenCalled()

      const allFiles = uploader.getFiles()
      expect(allFiles.every((f) => f.status === 'completed')).toBe(true)
    })

    it('should handle sequential uploads', async () => {
      const uploader = createUploader({
        endpoint: '/api/upload',
        sequential: true,
      })

      const completionOrder: string[] = []
      uploader.on('complete', (file) => {
        completionOrder.push(file.name)
      })

      const files = [
        createMockFile('first.txt', 'text/plain'),
        createMockFile('second.txt', 'text/plain'),
        createMockFile('third.txt', 'text/plain'),
      ]

      uploader.addFiles(files)
      await uploader.uploadAll()

      // In sequential mode, files should complete in order
      expect(completionOrder).toEqual(['first.txt', 'second.txt', 'third.txt'])
    })
  })

  describe('Auto upload', () => {
    it('should auto-upload when autoUpload is true', async () => {
      const onComplete = vi.fn()
      const uploader = createUploader({
        endpoint: '/api/upload',
        autoUpload: true,
      })

      uploader.on('complete', onComplete)

      // Adding a file should trigger upload automatically
      uploader.addFile(createMockFile('auto.txt', 'text/plain'))

      // Wait for upload
      await new Promise((r) => setTimeout(r, 50))

      expect(onComplete).toHaveBeenCalled()
    })
  })

  describe('Validation integration', () => {
    it('should reject files that fail validation', () => {
      const uploader = createUploader({
        endpoint: '/api/upload',
        maxFileSize: 1000,
        allowedTypes: ['image/*'],
      })

      // Too large
      expect(() =>
        uploader.addFile(createMockFile('large.jpg', 'image/jpeg', 5000))
      ).toThrow()

      // Wrong type
      expect(() =>
        uploader.addFile(createMockFile('doc.pdf', 'application/pdf', 500))
      ).toThrow()

      // Valid file should work
      const validFile = uploader.addFile(
        createMockFile('valid.jpg', 'image/jpeg', 500)
      )
      expect(validFile).toBeDefined()
    })

    it('should use custom validators during upload', async () => {
      const onError = vi.fn()
      const uploader = createUploader({
        endpoint: '/api/upload',
        validators: [
          {
            name: 'noNumbers',
            validate: (file) => {
              if (/\d/.test(file.name)) {
                throw new Error('File name cannot contain numbers')
              }
            },
          },
        ],
      })
      uploader.on('error', onError)

      // Add file with numbers - should be added but fail validation during upload
      const item = uploader.addFile(createMockFile('file123.txt', 'text/plain'))
      expect(item).toBeDefined()

      // Upload should trigger validation error
      await uploader.upload(item.id)
      expect(onError).toHaveBeenCalled()
      expect(item.status).toBe('error')

      // File without numbers should pass
      const validItem = uploader.addFile(createMockFile('file.txt', 'text/plain'))
      await uploader.upload(validItem.id)
      expect(validItem.status).toBe('completed')
    })
  })

  describe('Progress tracking', () => {
    it('should track overall progress', async () => {
      const uploader = createUploader({ endpoint: '/api/upload' })

      uploader.addFile(createMockFile('file1.txt', 'text/plain', 1000))
      uploader.addFile(createMockFile('file2.txt', 'text/plain', 1000))

      const initialProgress = uploader.getProgress()
      expect(initialProgress.totalFiles).toBe(2)
      expect(initialProgress.completedFiles).toBe(0)
      expect(initialProgress.percentage).toBe(0)

      await uploader.uploadAll()

      const finalProgress = uploader.getProgress()
      expect(finalProgress.completedFiles).toBe(2)
      expect(finalProgress.percentage).toBe(100)
    })
  })

  describe('Cancel and retry', () => {
    it('should cancel upload and allow retry', async () => {
      const uploader = createUploader({ endpoint: '/api/upload' })
      const onCancel = vi.fn()
      const onComplete = vi.fn()

      uploader.on('cancel', onCancel)
      uploader.on('complete', onComplete)

      const item = uploader.addFile(createMockFile('test.txt', 'text/plain', 10000))

      // Start upload and cancel immediately
      void uploader.upload(item.id)

      // Cancel immediately
      uploader.cancel(item.id)

      expect(onCancel).toHaveBeenCalled()
      expect(item.status).toBe('cancelled')

      // Retry
      uploader.retry(item.id)
      await uploader.upload(item.id)

      expect(onComplete).toHaveBeenCalled()
      expect(item.status).toBe('completed')
    })
  })

  describe('File management', () => {
    it('should manage file lifecycle', () => {
      const uploader = createUploader({ endpoint: '/api/upload' })

      // Add files
      uploader.addFile(createMockFile('file1.txt', 'text/plain'))
      const item2 = uploader.addFile(createMockFile('file2.txt', 'text/plain'))
      uploader.addFile(createMockFile('file3.txt', 'text/plain'))

      expect(uploader.getFiles()).toHaveLength(3)

      // Remove one file
      uploader.removeFile(item2.id)
      expect(uploader.getFiles()).toHaveLength(2)
      expect(uploader.getFile(item2.id)).toBeUndefined()

      // Remove all
      uploader.removeAll()
      expect(uploader.getFiles()).toHaveLength(0)
    })

    it('should query files by status', async () => {
      const uploader = createUploader({ endpoint: '/api/upload' })

      uploader.addFile(createMockFile('pending.txt', 'text/plain'))
      const toUpload = uploader.addFile(createMockFile('uploading.txt', 'text/plain'))

      // Before upload
      expect(uploader.getFilesByStatus('pending')).toHaveLength(2)
      expect(uploader.getFilesByStatus('completed')).toHaveLength(0)

      // Upload one file
      await uploader.upload(toUpload.id)

      expect(uploader.getFilesByStatus('pending')).toHaveLength(1)
      expect(uploader.getFilesByStatus('completed')).toHaveLength(1)
    })
  })

  describe('Configuration', () => {
    it('should update config dynamically', () => {
      const uploader = createUploader({
        endpoint: '/api/upload',
        maxFiles: 5,
      })

      expect(uploader.getConfig().maxFiles).toBe(5)

      uploader.setConfig({ maxFiles: 10 })
      expect(uploader.getConfig().maxFiles).toBe(10)
    })

    it('should use dynamic endpoint', async () => {
      let capturedEndpoint: string | undefined

      // Override XHR to capture the endpoint
      const originalXHR = globalThis.XMLHttpRequest
      class CaptureXHR extends originalXHR {
        override open(method: string, url: string) {
          capturedEndpoint = url
          return super.open(method, url)
        }
      }
      globalThis.XMLHttpRequest = CaptureXHR as typeof XMLHttpRequest

      const uploader = createUploader({
        endpoint: (file) => `/api/upload/${file.metadata['category'] ?? 'default'}`,
      })

      const item = uploader.addFile(createMockFile('test.txt', 'text/plain'))
      item.metadata['category'] = 'documents'

      await uploader.upload(item.id)

      expect(capturedEndpoint).toBe('/api/upload/documents')

      globalThis.XMLHttpRequest = originalXHR
    })
  })

  describe('Cleanup', () => {
    it('should cleanup on destroy', async () => {
      const uploader = createUploader({ endpoint: '/api/upload' })

      uploader.addFile(createMockFile('file1.txt', 'text/plain'))
      uploader.addFile(createMockFile('file2.txt', 'text/plain'))

      expect(uploader.getFiles()).toHaveLength(2)

      uploader.destroy()

      expect(uploader.getFiles()).toHaveLength(0)
    })
  })
})
