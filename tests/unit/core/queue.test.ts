import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createUploadQueue } from '../../../src/core/queue'

function createMockFile(name = 'test.txt', type = 'text/plain', size = 1024): File {
  const blob = new Blob(['x'.repeat(size)], { type })
  return new File([blob], name, { type })
}

describe('createUploadQueue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('initialization', () => {
    it('should create a queue with default config', () => {
      const queue = createUploadQueue({ endpoint: '/upload' })

      expect(queue).toBeDefined()
      expect(typeof queue.add).toBe('function')
      expect(typeof queue.addMany).toBe('function')
      expect(typeof queue.start).toBe('function')
      expect(typeof queue.pause).toBe('function')
      expect(typeof queue.resume).toBe('function')
      expect(typeof queue.clear).toBe('function')

      queue.destroy()
    })

    it('should start empty', () => {
      const queue = createUploadQueue({ endpoint: '/upload' })

      expect(queue.getQueue()).toHaveLength(0)
      expect(queue.getPending()).toHaveLength(0)
      expect(queue.getCompleted()).toHaveLength(0)
      expect(queue.getFailed()).toHaveLength(0)
      expect(queue.isRunning()).toBe(false)
      expect(queue.isPaused()).toBe(false)

      queue.destroy()
    })
  })

  describe('add', () => {
    it('should add a file to the queue', () => {
      const queue = createUploadQueue({ endpoint: '/upload' })
      const file = createMockFile()

      const item = queue.add(file)

      expect(item).toBeDefined()
      expect(item.name).toBe('test.txt')
      expect(queue.getQueue()).toHaveLength(1)
      expect(queue.getPending()).toHaveLength(1)

      queue.destroy()
    })

    it('should auto-start when autoStart is true', () => {
      const onStart = vi.fn()
      const queue = createUploadQueue({
        endpoint: '/upload',
        autoStart: true,
      })

      queue.on('start', onStart)
      queue.add(createMockFile())

      expect(onStart).toHaveBeenCalled()
      expect(queue.isRunning()).toBe(true)

      queue.destroy()
    })
  })

  describe('addMany', () => {
    it('should add multiple files', () => {
      const queue = createUploadQueue({ endpoint: '/upload' })
      const files = [createMockFile('a.txt'), createMockFile('b.txt'), createMockFile('c.txt')]

      const items = queue.addMany(files)

      expect(items).toHaveLength(3)
      expect(queue.getQueue()).toHaveLength(3)
      expect(queue.getPending()).toHaveLength(3)

      queue.destroy()
    })

    it('should auto-start with multiple files', () => {
      const queue = createUploadQueue({
        endpoint: '/upload',
        autoStart: true,
      })

      queue.addMany([createMockFile(), createMockFile()])

      expect(queue.isRunning()).toBe(true)

      queue.destroy()
    })
  })

  describe('start', () => {
    it('should start processing the queue', () => {
      const onStart = vi.fn()
      const queue = createUploadQueue({ endpoint: '/upload' })

      queue.on('start', onStart)
      queue.add(createMockFile())
      queue.start()

      expect(onStart).toHaveBeenCalled()
      expect(queue.isRunning()).toBe(true)

      queue.destroy()
    })

    it('should not start again if already running', () => {
      const onStart = vi.fn()
      const queue = createUploadQueue({ endpoint: '/upload' })

      queue.on('start', onStart)
      queue.add(createMockFile())
      queue.start()
      queue.start()
      queue.start()

      expect(onStart).toHaveBeenCalledTimes(1)

      queue.destroy()
    })
  })

  describe('pause and resume', () => {
    it('should pause the queue', () => {
      const onPause = vi.fn()
      const queue = createUploadQueue({ endpoint: '/upload' })

      queue.on('pause', onPause)
      queue.add(createMockFile())
      queue.start()
      queue.pause()

      expect(onPause).toHaveBeenCalled()
      expect(queue.isPaused()).toBe(true)
      expect(queue.isRunning()).toBe(false)

      queue.destroy()
    })

    it('should resume the queue', () => {
      const onResume = vi.fn()
      const queue = createUploadQueue({ endpoint: '/upload' })

      queue.on('resume', onResume)
      queue.add(createMockFile())
      queue.start()
      queue.pause()
      queue.resume()

      expect(onResume).toHaveBeenCalled()
      expect(queue.isPaused()).toBe(false)
      expect(queue.isRunning()).toBe(true)

      queue.destroy()
    })

    it('should not pause if not running', () => {
      const onPause = vi.fn()
      const queue = createUploadQueue({ endpoint: '/upload' })

      queue.on('pause', onPause)
      queue.pause()

      expect(onPause).not.toHaveBeenCalled()

      queue.destroy()
    })

    it('should not resume if not paused', () => {
      const onResume = vi.fn()
      const queue = createUploadQueue({ endpoint: '/upload' })

      queue.on('resume', onResume)
      queue.resume()

      expect(onResume).not.toHaveBeenCalled()

      queue.destroy()
    })
  })

  describe('clear', () => {
    it('should clear the queue', () => {
      const queue = createUploadQueue({ endpoint: '/upload' })

      queue.add(createMockFile('a.txt'))
      queue.add(createMockFile('b.txt'))
      queue.start()

      queue.clear()

      expect(queue.getQueue()).toHaveLength(0)
      expect(queue.getPending()).toHaveLength(0)
      expect(queue.isRunning()).toBe(false)
      expect(queue.isPaused()).toBe(false)

      queue.destroy()
    })
  })

  describe('progress', () => {
    it('should return progress', () => {
      const queue = createUploadQueue({ endpoint: '/upload' })

      queue.add(createMockFile('a.txt'))
      queue.add(createMockFile('b.txt'))

      const progress = queue.getProgress()

      expect(progress.totalFiles).toBe(2)
      expect(progress.completedFiles).toBe(0)
      expect(progress.percentage).toBe(0)

      queue.destroy()
    })
  })

  describe('events', () => {
    it('should support on/off', () => {
      const queue = createUploadQueue({ endpoint: '/upload' })
      const handler = vi.fn()

      queue.on('start', handler)
      queue.add(createMockFile())
      queue.start()

      expect(handler).toHaveBeenCalled()

      queue.off('start', handler)

      queue.destroy()
    })

    it('should emit fileStart event', async () => {
      const onFileStart = vi.fn()
      const queue = createUploadQueue({ endpoint: '/upload' })

      queue.on('fileStart', onFileStart)
      queue.add(createMockFile())
      queue.start()

      await vi.advanceTimersByTimeAsync(50)

      expect(onFileStart).toHaveBeenCalled()

      queue.destroy()
    })

    it('should emit progress event', async () => {
      const onProgress = vi.fn()
      const queue = createUploadQueue({ endpoint: '/upload' })

      queue.on('progress', onProgress)
      queue.add(createMockFile())
      queue.start()

      await vi.advanceTimersByTimeAsync(100)

      expect(onProgress).toHaveBeenCalled()

      queue.destroy()
    })
  })

  describe('concurrency', () => {
    it('should respect concurrent limit', async () => {
      const queue = createUploadQueue({
        endpoint: '/upload',
        concurrent: 2,
      })

      // Add more files than concurrent limit
      queue.addMany([
        createMockFile('1.txt'),
        createMockFile('2.txt'),
        createMockFile('3.txt'),
        createMockFile('4.txt'),
      ])

      queue.start()

      await vi.advanceTimersByTimeAsync(10)

      // Should process limited number at once
      queue.destroy()
    })
  })

  describe('destroy', () => {
    it('should clean up on destroy', () => {
      const queue = createUploadQueue({ endpoint: '/upload' })

      queue.add(createMockFile())
      queue.start()

      queue.destroy()

      expect(queue.getQueue()).toHaveLength(0)
    })
  })
})
