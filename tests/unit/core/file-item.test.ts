import { describe, it, expect } from 'vitest'
import {
  createFileItem,
  updateFileStatus,
  updateFileProgress,
  setFileError,
  setFileResponse,
  setFileChunks,
  updateCurrentChunk,
  cloneFileItem,
} from '../../../src/core/file-item'
import type { ChunkInfo, UploadError } from '../../../src/types'

function createMockFile(name = 'test.txt', type = 'text/plain', size = 1024): File {
  const blob = new Blob(['x'.repeat(size)], { type })
  return new File([blob], name, { type })
}

describe('createFileItem', () => {
  it('should create a file item with correct properties', () => {
    const file = createMockFile('document.pdf', 'application/pdf', 5000)
    const item = createFileItem(file)

    expect(item.id).toBeDefined()
    expect(item.id.startsWith('file_')).toBe(true)
    expect(item.file).toBe(file)
    expect(item.name).toBe('document.pdf')
    expect(item.type).toBe('application/pdf')
    expect(item.size).toBe(5000)
    expect(item.status).toBe('pending')
    expect(item.progress).toBe(0)
    expect(item.uploadedBytes).toBe(0)
    expect(item.metadata).toEqual({})
    expect(item.addedAt).toBeInstanceOf(Date)
  })

  it('should generate unique IDs', () => {
    const file = createMockFile()
    const item1 = createFileItem(file)
    const item2 = createFileItem(file)

    expect(item1.id).not.toBe(item2.id)
  })
})

describe('updateFileStatus', () => {
  it('should update status', () => {
    const item = createFileItem(createMockFile())

    updateFileStatus(item, 'uploading')
    expect(item.status).toBe('uploading')

    updateFileStatus(item, 'completed')
    expect(item.status).toBe('completed')
  })

  it('should set startedAt when status becomes uploading', () => {
    const item = createFileItem(createMockFile())

    expect(item.startedAt).toBeUndefined()
    updateFileStatus(item, 'uploading')
    expect(item.startedAt).toBeInstanceOf(Date)
  })

  it('should set completedAt when status becomes completed', () => {
    const item = createFileItem(createMockFile())

    updateFileStatus(item, 'uploading')
    expect(item.completedAt).toBeUndefined()

    updateFileStatus(item, 'completed')
    expect(item.completedAt).toBeInstanceOf(Date)
  })

  it('should set completedAt when status becomes error', () => {
    const item = createFileItem(createMockFile())

    updateFileStatus(item, 'error')
    expect(item.completedAt).toBeInstanceOf(Date)
  })

  it('should set completedAt when status becomes cancelled', () => {
    const item = createFileItem(createMockFile())

    updateFileStatus(item, 'cancelled')
    expect(item.completedAt).toBeInstanceOf(Date)
  })
})

describe('updateFileProgress', () => {
  it('should update progress and uploadedBytes', () => {
    const item = createFileItem(createMockFile())

    updateFileProgress(item, 500, 50)

    expect(item.uploadedBytes).toBe(500)
    expect(item.progress).toBe(50)
  })
})

describe('setFileError', () => {
  it('should set error and update status to error', () => {
    const item = createFileItem(createMockFile())
    const error = new Error('Upload failed') as UploadError
    error.code = 'NETWORK_ERROR'

    setFileError(item, error)

    expect(item.error).toBe(error)
    expect(item.status).toBe('error')
  })
})

describe('setFileResponse', () => {
  it('should set response', () => {
    const item = createFileItem(createMockFile())
    const response = { url: 'https://example.com/file', id: 123 }

    setFileResponse(item, response)

    expect(item.response).toEqual(response)
  })
})

describe('setFileChunks', () => {
  it('should set chunks and related properties', () => {
    const item = createFileItem(createMockFile())
    const chunks: ChunkInfo[] = [
      { index: 0, start: 0, end: 512, size: 512, uploaded: false, retries: 0 },
      { index: 1, start: 512, end: 1024, size: 512, uploaded: false, retries: 0 },
    ]

    setFileChunks(item, chunks)

    expect(item.chunks).toHaveLength(2)
    expect(item.totalChunks).toBe(2)
    expect(item.currentChunk).toBe(0)
  })
})

describe('updateCurrentChunk', () => {
  it('should update currentChunk', () => {
    const item = createFileItem(createMockFile())
    setFileChunks(item, [
      { index: 0, start: 0, end: 512, size: 512, uploaded: true, retries: 0 },
      { index: 1, start: 512, end: 1024, size: 512, uploaded: false, retries: 0 },
    ])

    updateCurrentChunk(item, 1)

    expect(item.currentChunk).toBe(1)
  })
})

describe('cloneFileItem', () => {
  it('should create a shallow clone with copied metadata', () => {
    const original = createFileItem(createMockFile())
    original.metadata = { category: 'documents', tags: ['important'] }

    const clone = cloneFileItem(original)

    expect(clone.id).toBe(original.id)
    expect(clone.name).toBe(original.name)
    expect(clone.metadata).toEqual(original.metadata)
    expect(clone.metadata).not.toBe(original.metadata)
  })

  it('should clone chunks array', () => {
    const original = createFileItem(createMockFile())
    setFileChunks(original, [
      { index: 0, start: 0, end: 512, size: 512, uploaded: true, retries: 0 },
    ])

    const clone = cloneFileItem(original)

    expect(clone.chunks).toEqual(original.chunks)
    expect(clone.chunks).not.toBe(original.chunks)
    expect(clone.chunks?.[0]).not.toBe(original.chunks?.[0])
  })

  it('should handle items without chunks', () => {
    const original = createFileItem(createMockFile())
    const clone = cloneFileItem(original)

    expect(clone.chunks).toBeUndefined()
  })
})
