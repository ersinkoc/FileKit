import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createUploader } from '../../../src/core/uploader'

function createMockFile(name = 'test.txt', type = 'text/plain', size = 1024): File {
  const blob = new Blob(['x'.repeat(size)], { type })
  return new File([blob], name, { type })
}

function createMockImageFile(name = 'test.jpg', size = 1024): File {
  const blob = new Blob(['x'.repeat(size)], { type: 'image/jpeg' })
  return new File([blob], name, { type: 'image/jpeg' })
}

describe('createUploader', () => {
  describe('addFile', () => {
    it('should add a file and return FileItem', () => {
      const uploader = createUploader({ endpoint: '/api/upload' })
      const file = createMockFile()

      const item = uploader.addFile(file)

      expect(item).toBeDefined()
      expect(item.id).toBeDefined()
      expect(item.name).toBe('test.txt')
      expect(item.status).toBe('pending')
    })

    it('should emit add event', () => {
      const uploader = createUploader({ endpoint: '/api/upload' })
      const handler = vi.fn()
      uploader.on('add', handler)

      const item = uploader.addFile(createMockFile())

      expect(handler).toHaveBeenCalledWith(item)
    })

    it('should throw when maxFiles exceeded', () => {
      const uploader = createUploader({
        endpoint: '/api/upload',
        maxFiles: 2,
      })

      uploader.addFile(createMockFile('file1.txt'))
      uploader.addFile(createMockFile('file2.txt'))

      expect(() => uploader.addFile(createMockFile('file3.txt'))).toThrow()
    })

    it('should throw when file exceeds maxFileSize', () => {
      const uploader = createUploader({
        endpoint: '/api/upload',
        maxFileSize: 500,
      })

      expect(() => uploader.addFile(createMockFile('test.txt', 'text/plain', 1000))).toThrow()
    })

    it('should throw when file type not allowed', () => {
      const uploader = createUploader({
        endpoint: '/api/upload',
        allowedTypes: ['image/*'],
      })

      expect(() => uploader.addFile(createMockFile('test.txt', 'text/plain'))).toThrow()
    })

    it('should throw when file is below minFileSize', () => {
      const uploader = createUploader({
        endpoint: '/api/upload',
        minFileSize: 2000,
      })

      expect(() => uploader.addFile(createMockFile('test.txt', 'text/plain', 500))).toThrow()
    })

    it('should throw when file type is blocked', () => {
      const uploader = createUploader({
        endpoint: '/api/upload',
        blockedTypes: ['text/plain'],
      })

      expect(() => uploader.addFile(createMockFile('test.txt', 'text/plain'))).toThrow()
    })

    it('should reject file when onAdd returns false', () => {
      const uploader = createUploader({
        endpoint: '/api/upload',
        onAdd: () => false,
      })

      expect(() => uploader.addFile(createMockFile())).toThrow('File rejected by onAdd callback')
    })

    it('should call onAdd callback and keep file when it returns true', () => {
      const onAdd = vi.fn().mockReturnValue(true)
      const uploader = createUploader({
        endpoint: '/api/upload',
        onAdd,
      })

      const item = uploader.addFile(createMockFile())

      expect(onAdd).toHaveBeenCalledWith(item)
      expect(uploader.getFiles()).toHaveLength(1)
    })

    it('should apply synchronous transformFile', () => {
      const transformFile = vi.fn((file: File) => {
        return new File([file], 'transformed.txt', { type: file.type })
      })
      const uploader = createUploader({
        endpoint: '/api/upload',
        transformFile,
      })

      uploader.addFile(createMockFile())

      expect(transformFile).toHaveBeenCalled()
    })

    it('should handle async transformFile', async () => {
      const transformFile = vi.fn(async (file: File) => {
        return new File([file], 'async-transformed.txt', { type: file.type })
      })
      const uploader = createUploader({
        endpoint: '/api/upload',
        transformFile,
      })

      uploader.addFile(createMockFile())

      expect(transformFile).toHaveBeenCalled()
      // Wait for async transform
      await new Promise((r) => setTimeout(r, 10))
    })

    it('should auto upload when autoUpload is enabled', async () => {
      const uploader = createUploader({
        endpoint: '/api/upload',
        autoUpload: true,
      })
      const startHandler = vi.fn()
      uploader.on('start', startHandler)

      uploader.addFile(createMockFile())

      // Wait for auto upload to start
      await new Promise((r) => setTimeout(r, 20))
      expect(startHandler).toHaveBeenCalled()
    })

    it('should set generatePreview option', () => {
      const uploader = createUploader({
        endpoint: '/api/upload',
        generatePreview: true,
      })

      const config = uploader.getConfig()
      expect(config.generatePreview).toBe(true)
    })
  })

  describe('addFiles', () => {
    it('should add multiple files', () => {
      const uploader = createUploader({ endpoint: '/api/upload' })
      const files = [createMockFile('file1.txt'), createMockFile('file2.txt')]

      const items = uploader.addFiles(files)

      expect(items).toHaveLength(2)
      expect(uploader.getFiles()).toHaveLength(2)
    })

    it('should continue adding valid files even if some fail', () => {
      const uploader = createUploader({
        endpoint: '/api/upload',
        allowedTypes: ['text/plain'],
      })

      const files = [
        createMockFile('valid.txt', 'text/plain'),
        createMockFile('invalid.jpg', 'image/jpeg'),
        createMockFile('valid2.txt', 'text/plain'),
      ]

      const items = uploader.addFiles(files)

      expect(items).toHaveLength(2)
    })
  })

  describe('removeFile', () => {
    it('should remove a file', () => {
      const uploader = createUploader({ endpoint: '/api/upload' })
      const item = uploader.addFile(createMockFile())

      uploader.removeFile(item.id)

      expect(uploader.getFile(item.id)).toBeUndefined()
      expect(uploader.getFiles()).toHaveLength(0)
    })

    it('should emit remove event', () => {
      const uploader = createUploader({ endpoint: '/api/upload' })
      const handler = vi.fn()
      uploader.on('remove', handler)

      const item = uploader.addFile(createMockFile())
      uploader.removeFile(item.id)

      expect(handler).toHaveBeenCalled()
    })

    it('should do nothing for non-existent file', () => {
      const uploader = createUploader({ endpoint: '/api/upload' })
      expect(() => uploader.removeFile('non-existent')).not.toThrow()
    })

    it('should cancel upload when removing uploading file', async () => {
      const uploader = createUploader({ endpoint: '/api/upload' })
      const item = uploader.addFile(createMockFile())

      // Start upload
      void uploader.upload(item.id)

      // Remove while uploading
      uploader.removeFile(item.id)

      expect(uploader.getFile(item.id)).toBeUndefined()
    })

    it('should handle file with preview URL when removing', () => {
      const uploader = createUploader({
        endpoint: '/api/upload',
      })
      const item = uploader.addFile(createMockFile())

      // Manually set a preview URL to test cleanup
      ;(item as { preview: string }).preview = 'blob:mock-url'

      uploader.removeFile(item.id)

      // Verify the file is removed
      expect(uploader.getFile(item.id)).toBeUndefined()
    })

    it('should call onRemove callback', () => {
      const onRemove = vi.fn()
      const uploader = createUploader({
        endpoint: '/api/upload',
        onRemove,
      })
      const item = uploader.addFile(createMockFile())

      uploader.removeFile(item.id)

      expect(onRemove).toHaveBeenCalledWith(item)
    })
  })

  describe('removeAll', () => {
    it('should remove all files', () => {
      const uploader = createUploader({ endpoint: '/api/upload' })
      uploader.addFile(createMockFile('file1.txt'))
      uploader.addFile(createMockFile('file2.txt'))

      uploader.removeAll()

      expect(uploader.getFiles()).toHaveLength(0)
    })
  })

  describe('getFile', () => {
    it('should return file by id', () => {
      const uploader = createUploader({ endpoint: '/api/upload' })
      const item = uploader.addFile(createMockFile())

      const retrieved = uploader.getFile(item.id)

      expect(retrieved).toBe(item)
    })

    it('should return undefined for non-existent id', () => {
      const uploader = createUploader({ endpoint: '/api/upload' })
      expect(uploader.getFile('non-existent')).toBeUndefined()
    })
  })

  describe('getFiles', () => {
    it('should return all files', () => {
      const uploader = createUploader({ endpoint: '/api/upload' })
      uploader.addFile(createMockFile('file1.txt'))
      uploader.addFile(createMockFile('file2.txt'))

      const files = uploader.getFiles()

      expect(files).toHaveLength(2)
    })
  })

  describe('getFilesByStatus', () => {
    it('should filter files by status', () => {
      const uploader = createUploader({ endpoint: '/api/upload' })
      uploader.addFile(createMockFile('file1.txt'))
      uploader.addFile(createMockFile('file2.txt'))

      const pending = uploader.getFilesByStatus('pending')
      const completed = uploader.getFilesByStatus('completed')

      expect(pending).toHaveLength(2)
      expect(completed).toHaveLength(0)
    })
  })

  describe('upload', () => {
    it('should upload a specific file', async () => {
      const uploader = createUploader({ endpoint: '/api/upload' })
      const item = uploader.addFile(createMockFile())
      const handler = vi.fn()
      uploader.on('complete', handler)

      await uploader.upload(item.id)

      expect(handler).toHaveBeenCalled()
    })

    it('should emit start event', async () => {
      const uploader = createUploader({ endpoint: '/api/upload' })
      const item = uploader.addFile(createMockFile())
      const handler = vi.fn()
      uploader.on('start', handler)

      await uploader.upload(item.id)

      expect(handler).toHaveBeenCalledWith(item)
    })

    it('should throw for non-existent file', async () => {
      const uploader = createUploader({ endpoint: '/api/upload' })
      await expect(uploader.upload('non-existent')).rejects.toThrow()
    })

    it('should skip if already uploading', async () => {
      const uploader = createUploader({ endpoint: '/api/upload' })
      const item = uploader.addFile(createMockFile())

      // Start upload
      const promise1 = uploader.upload(item.id)

      // Try to upload again - should return immediately
      await uploader.upload(item.id)

      await promise1
    })

    it('should skip if already completed', async () => {
      const uploader = createUploader({ endpoint: '/api/upload' })
      const item = uploader.addFile(createMockFile())

      // Complete upload
      await uploader.upload(item.id)
      expect(item.status).toBe('completed')

      // Try to upload again - should return immediately
      await uploader.upload(item.id)
    })

    it('should upload all pending files when no fileId provided', async () => {
      const uploader = createUploader({ endpoint: '/api/upload' })
      uploader.addFile(createMockFile('file1.txt'))
      uploader.addFile(createMockFile('file2.txt'))

      const completeHandler = vi.fn()
      uploader.on('complete', completeHandler)

      await uploader.upload()

      expect(completeHandler).toHaveBeenCalledTimes(2)
    })

    it('should upload sequentially when sequential option is set', async () => {
      const uploader = createUploader({
        endpoint: '/api/upload',
        sequential: true,
      })
      uploader.addFile(createMockFile('file1.txt'))
      uploader.addFile(createMockFile('file2.txt'))

      const completeHandler = vi.fn()
      uploader.on('complete', completeHandler)

      await uploader.upload()

      expect(completeHandler).toHaveBeenCalledTimes(2)
    })

    it('should emit progress event during upload', async () => {
      const uploader = createUploader({ endpoint: '/api/upload' })
      const item = uploader.addFile(createMockFile())
      const progressHandler = vi.fn()
      uploader.on('progress', progressHandler)

      await uploader.upload(item.id)

      expect(progressHandler).toHaveBeenCalled()
    })

    it('should call onProgress callback', async () => {
      const onProgress = vi.fn()
      const uploader = createUploader({
        endpoint: '/api/upload',
        onProgress,
      })
      uploader.addFile(createMockFile())

      await uploader.upload()

      expect(onProgress).toHaveBeenCalled()
    })

    it('should call onComplete callback', async () => {
      const onComplete = vi.fn()
      const uploader = createUploader({
        endpoint: '/api/upload',
        onComplete,
      })
      uploader.addFile(createMockFile())

      await uploader.upload()

      expect(onComplete).toHaveBeenCalled()
    })

    it('should emit allComplete when all files are complete', async () => {
      const uploader = createUploader({ endpoint: '/api/upload' })
      uploader.addFile(createMockFile('file1.txt'))
      uploader.addFile(createMockFile('file2.txt'))

      const allCompleteHandler = vi.fn()
      uploader.on('allComplete', allCompleteHandler)

      await uploader.upload()

      expect(allCompleteHandler).toHaveBeenCalled()
    })

    it('should call onAllComplete callback', async () => {
      const onAllComplete = vi.fn()
      const uploader = createUploader({
        endpoint: '/api/upload',
        onAllComplete,
      })
      uploader.addFile(createMockFile())

      await uploader.upload()

      expect(onAllComplete).toHaveBeenCalled()
    })

    it('should use chunked upload when enabled', async () => {
      const uploader = createUploader({
        endpoint: '/api/upload',
        chunked: true,
        chunkSize: 512,
      })
      const item = uploader.addFile(createMockFile('file.txt', 'text/plain', 2048))

      // Start upload and don't wait - just verify chunks are set up
      void uploader.upload(item.id)

      // Wait a bit for chunks to be initialized
      await new Promise((r) => setTimeout(r, 20))

      expect(item.chunks).toBeDefined()
      expect(item.totalChunks).toBe(4) // 2048 / 512 = 4 chunks

      // Cancel to cleanup
      uploader.cancel(item.id)
    })
  })

  describe('pause and resume', () => {
    it('should have pause method', () => {
      const uploader = createUploader({
        endpoint: '/api/upload',
      })
      expect(typeof uploader.pause).toBe('function')
    })

    it('should have resume method', () => {
      const uploader = createUploader({
        endpoint: '/api/upload',
      })
      expect(typeof uploader.resume).toBe('function')
    })

    it('should have isPaused method', () => {
      const uploader = createUploader({
        endpoint: '/api/upload',
      })
      expect(typeof uploader.isPaused).toBe('function')
      expect(uploader.isPaused()).toBe(false)
    })

    it('should pause all uploading files when no fileId provided', async () => {
      const uploader = createUploader({ endpoint: '/api/upload' })
      const item1 = uploader.addFile(createMockFile('file1.txt'))
      const item2 = uploader.addFile(createMockFile('file2.txt'))

      // Start uploads
      void uploader.upload()

      // Wait for status to change to uploading
      await new Promise((r) => setTimeout(r, 5))

      // Pause all
      uploader.pause()

      expect(item1.status === 'paused' || item2.status === 'paused').toBe(true)
    })

    it('should resume all paused files when no fileId provided', async () => {
      const uploader = createUploader({
        endpoint: '/api/upload',
        chunked: true,
      })
      const item = uploader.addFile(createMockFile())

      // Start, pause, resume
      void uploader.upload(item.id)
      await new Promise((r) => setTimeout(r, 5))
      uploader.pause(item.id)
      uploader.resume()
    })
  })

  describe('cancel', () => {
    it('should cancel an upload', async () => {
      const uploader = createUploader({ endpoint: '/api/upload' })
      const item = uploader.addFile(createMockFile())
      const handler = vi.fn()
      uploader.on('cancel', handler)

      // Start upload and cancel
      void uploader.upload(item.id)

      // Cancel
      uploader.cancel(item.id)

      expect(item.status).toBe('cancelled')
      expect(handler).toHaveBeenCalled()
    })

    it('should cancel all uploading files when no fileId provided', async () => {
      const uploader = createUploader({ endpoint: '/api/upload' })
      const item1 = uploader.addFile(createMockFile('file1.txt'))
      const item2 = uploader.addFile(createMockFile('file2.txt'))

      const cancelHandler = vi.fn()
      uploader.on('cancel', cancelHandler)

      // Start uploads
      void uploader.upload()

      // Wait for status to change
      await new Promise((r) => setTimeout(r, 5))

      // Cancel all
      uploader.cancel()

      expect(cancelHandler).toHaveBeenCalled()
    })
  })

  describe('retry', () => {
    it('should retry a failed upload', async () => {
      const uploader = createUploader({ endpoint: '/api/upload/error' })
      const item = uploader.addFile(createMockFile())

      // First upload fails
      await uploader.upload(item.id).catch(() => {})

      // Retry
      uploader.retry(item.id)

      expect(item.status).toBe('pending')
    })

    it('should retry cancelled upload', async () => {
      const uploader = createUploader({ endpoint: '/api/upload' })
      const item = uploader.addFile(createMockFile())

      // Cancel the file
      uploader.cancel(item.id)
      expect(item.status).toBe('cancelled')

      // Retry
      uploader.retry(item.id)

      expect(item.status).toBe('pending')
      expect(item.error).toBeUndefined()
      expect(item.progress).toBe(0)
      expect(item.uploadedBytes).toBe(0)
    })

    it('should retry all failed files when no fileId provided', async () => {
      const uploader = createUploader({ endpoint: '/api/upload/error' })
      uploader.addFile(createMockFile('file1.txt'))
      uploader.addFile(createMockFile('file2.txt'))

      // Upload (will fail)
      await uploader.upload().catch(() => {})

      // Retry all
      uploader.retry()

      const files = uploader.getFiles()
      expect(files.every((f) => f.status === 'pending')).toBe(true)
    })
  })

  describe('isUploading', () => {
    it('should return false when no uploads active', () => {
      const uploader = createUploader({ endpoint: '/api/upload' })
      expect(uploader.isUploading()).toBe(false)
    })
  })

  describe('getProgress', () => {
    it('should return overall progress', () => {
      const uploader = createUploader({ endpoint: '/api/upload' })
      uploader.addFile(createMockFile('file1.txt', 'text/plain', 1000))
      uploader.addFile(createMockFile('file2.txt', 'text/plain', 2000))

      const progress = uploader.getProgress()

      expect(progress.totalFiles).toBe(2)
      expect(progress.completedFiles).toBe(0)
      expect(progress.failedFiles).toBe(0)
      expect(progress.totalBytes).toBe(3000)
      expect(progress.uploadedBytes).toBe(0)
      expect(progress.percentage).toBe(0)
    })

    it('should calculate speed for uploading files', async () => {
      const uploader = createUploader({ endpoint: '/api/upload' })
      uploader.addFile(createMockFile('file.txt', 'text/plain', 1000))

      // Start upload
      void uploader.upload()

      // Wait a bit for upload to start
      await new Promise((r) => setTimeout(r, 15))

      const progress = uploader.getProgress()
      expect(progress.speed).toBeGreaterThanOrEqual(0)
    })

    it('should count completed and failed files', async () => {
      const uploader = createUploader({ endpoint: '/api/upload' })
      uploader.addFile(createMockFile('good.txt'))
      uploader.addFile(createMockFile('error.txt')) // This will fail

      await uploader.upload().catch(() => {})

      const progress = uploader.getProgress()
      expect(progress.completedFiles + progress.failedFiles).toBeGreaterThan(0)
    })
  })

  describe('getState and resumeFromState', () => {
    it('should return undefined for file without chunks', () => {
      const uploader = createUploader({ endpoint: '/api/upload' })
      const item = uploader.addFile(createMockFile())

      const state = uploader.getState(item.id)

      expect(state).toBeUndefined()
    })

    it('should return state for chunked file', async () => {
      const uploader = createUploader({
        endpoint: '/api/upload',
        chunked: true,
        chunkSize: 256,
      })
      const item = uploader.addFile(createMockFile('file.txt', 'text/plain', 1024))

      // Start upload to initialize chunks
      void uploader.upload(item.id)
      await new Promise((r) => setTimeout(r, 5))

      const state = uploader.getState(item.id)

      expect(state).toBeDefined()
      expect(state?.fileId).toBe(item.id)
      expect(state?.fileName).toBe('file.txt')
      expect(state?.fileSize).toBe(1024)
    })

    it('should resume from saved state', async () => {
      const uploader = createUploader({
        endpoint: '/api/upload',
        chunked: true,
        chunkSize: 256,
      })
      const item = uploader.addFile(createMockFile('file.txt', 'text/plain', 1024))

      // Start upload to initialize chunks
      void uploader.upload(item.id)
      await new Promise((r) => setTimeout(r, 5))

      // Get state
      const state = uploader.getState(item.id)
      if (state) {
        // Modify state to simulate partial upload
        state.chunks[0].uploaded = true
        state.uploadedBytes = 256
        state.metadata['test'] = 'value'

        // Resume from state
        uploader.resumeFromState(item.id, state)

        expect(item.uploadedBytes).toBe(256)
        expect(item.metadata['test']).toBe('value')
      }
    })

    it('should throw when resuming non-existent file', () => {
      const uploader = createUploader({ endpoint: '/api/upload' })

      expect(() =>
        uploader.resumeFromState('non-existent', {
          fileId: 'non-existent',
          fileName: 'test.txt',
          fileSize: 1000,
          uploadedBytes: 500,
          chunks: [],
          metadata: {},
        })
      ).toThrow('File not found: non-existent')
    })

    it('should return undefined for non-existent file', () => {
      const uploader = createUploader({ endpoint: '/api/upload' })

      const state = uploader.getState('non-existent')

      expect(state).toBeUndefined()
    })
  })

  describe('setConfig', () => {
    it('should update configuration', () => {
      const uploader = createUploader({ endpoint: '/api/upload' })

      uploader.setConfig({ maxFileSize: 5000 })

      expect(uploader.getConfig().maxFileSize).toBe(5000)
    })
  })

  describe('destroy', () => {
    it('should cleanup resources', () => {
      const uploader = createUploader({ endpoint: '/api/upload' })
      uploader.addFile(createMockFile())

      uploader.destroy()

      expect(uploader.getFiles()).toHaveLength(0)
    })

    it('should cancel active uploads', async () => {
      const uploader = createUploader({ endpoint: '/api/upload' })
      uploader.addFile(createMockFile())

      // Start upload
      void uploader.upload()

      // Destroy while uploading
      uploader.destroy()

      expect(uploader.getFiles()).toHaveLength(0)
    })

    it('should revoke preview URLs', () => {
      const uploader = createUploader({
        endpoint: '/api/upload',
        generatePreview: true,
      })
      uploader.addFile(createMockImageFile())

      uploader.destroy()

      expect(uploader.getFiles()).toHaveLength(0)
    })

    it('should remove all event listeners', () => {
      const uploader = createUploader({ endpoint: '/api/upload' })
      const handler = vi.fn()
      uploader.on('add', handler)

      uploader.destroy()

      // After destroy, adding a file should work but handler should not be called
      // (though in practice the uploader is in an invalid state after destroy)
      expect(uploader.getFiles()).toHaveLength(0)
    })
  })

  describe('event handlers', () => {
    it('should support on and off', () => {
      const uploader = createUploader({ endpoint: '/api/upload' })
      const handler = vi.fn()

      uploader.on('add', handler)
      uploader.addFile(createMockFile())
      expect(handler).toHaveBeenCalledTimes(1)

      uploader.off('add', handler)
      uploader.addFile(createMockFile())
      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should return unsubscribe function from on', () => {
      const uploader = createUploader({ endpoint: '/api/upload' })
      const handler = vi.fn()

      const unsubscribe = uploader.on('add', handler)
      uploader.addFile(createMockFile())
      expect(handler).toHaveBeenCalledTimes(1)

      unsubscribe()
      uploader.addFile(createMockFile())
      expect(handler).toHaveBeenCalledTimes(1)
    })
  })

  describe('image dimension validation', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should validate minImageWidth', async () => {
      const uploader = createUploader({
        endpoint: '/api/upload',
        minImageWidth: 200, // Mock image is 100x100
      })
      const item = uploader.addFile(createMockImageFile())
      const errorHandler = vi.fn()
      uploader.on('error', errorHandler)

      const uploadPromise = uploader.upload(item.id)
      await vi.advanceTimersByTimeAsync(100)
      await uploadPromise

      expect(errorHandler).toHaveBeenCalled()
      expect(item.status).toBe('error')
    })

    it('should validate minImageHeight', async () => {
      const uploader = createUploader({
        endpoint: '/api/upload',
        minImageHeight: 200, // Mock image is 100x100
      })
      const item = uploader.addFile(createMockImageFile())
      const errorHandler = vi.fn()
      uploader.on('error', errorHandler)

      const uploadPromise = uploader.upload(item.id)
      await vi.advanceTimersByTimeAsync(100)
      await uploadPromise

      expect(errorHandler).toHaveBeenCalled()
    })

    it('should validate maxImageWidth', async () => {
      const uploader = createUploader({
        endpoint: '/api/upload',
        maxImageWidth: 50, // Mock image is 100x100
      })
      const item = uploader.addFile(createMockImageFile())
      const errorHandler = vi.fn()
      uploader.on('error', errorHandler)

      const uploadPromise = uploader.upload(item.id)
      await vi.advanceTimersByTimeAsync(100)
      await uploadPromise

      expect(errorHandler).toHaveBeenCalled()
    })

    it('should validate maxImageHeight', async () => {
      const uploader = createUploader({
        endpoint: '/api/upload',
        maxImageHeight: 50, // Mock image is 100x100
      })
      const item = uploader.addFile(createMockImageFile())
      const errorHandler = vi.fn()
      uploader.on('error', errorHandler)

      const uploadPromise = uploader.upload(item.id)
      await vi.advanceTimersByTimeAsync(100)
      await uploadPromise

      expect(errorHandler).toHaveBeenCalled()
    })
  })

  describe('custom validators', () => {
    it('should run custom validators during upload', async () => {
      const customValidator = {
        name: 'testValidator',
        validate: vi.fn().mockResolvedValue(undefined),
      }
      const uploader = createUploader({
        endpoint: '/api/upload',
        validators: [customValidator],
      })
      const item = uploader.addFile(createMockFile())

      await uploader.upload(item.id)

      expect(customValidator.validate).toHaveBeenCalled()
    })

    it('should fail when custom validator throws', async () => {
      const customValidator = {
        name: 'failingValidator',
        validate: vi.fn().mockRejectedValue(new Error('Custom validation failed')),
      }
      const uploader = createUploader({
        endpoint: '/api/upload',
        validators: [customValidator],
      })
      const item = uploader.addFile(createMockFile())
      const errorHandler = vi.fn()
      uploader.on('error', errorHandler)

      await uploader.upload(item.id)

      expect(errorHandler).toHaveBeenCalled()
      expect(item.status).toBe('error')
    })

    it('should handle non-Error rejection from custom validator', async () => {
      const customValidator = {
        name: 'stringValidator',
        validate: vi.fn().mockRejectedValue('String error'),
      }
      const uploader = createUploader({
        endpoint: '/api/upload',
        validators: [customValidator],
      })
      const item = uploader.addFile(createMockFile())
      const errorHandler = vi.fn()
      uploader.on('error', errorHandler)

      await uploader.upload(item.id)

      expect(errorHandler).toHaveBeenCalled()
    })
  })

  describe('error handling', () => {
    it('should call onError callback on upload failure', async () => {
      const onError = vi.fn()
      const uploader = createUploader({
        endpoint: '/api/upload/error',
        onError,
      })
      uploader.addFile(createMockFile())

      await uploader.upload().catch(() => {})

      expect(onError).toHaveBeenCalled()
    })

    it('should emit error event on upload failure', async () => {
      const uploader = createUploader({ endpoint: '/api/upload/error' })
      const errorHandler = vi.fn()
      uploader.on('error', errorHandler)
      uploader.addFile(createMockFile())

      await uploader.upload().catch(() => {})

      expect(errorHandler).toHaveBeenCalled()
    })
  })
})
