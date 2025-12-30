import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createDropZone } from '../../../src/core/drop-zone'

function createMockFile(name = 'test.txt', type = 'text/plain', size = 1024): File {
  const blob = new Blob(['x'.repeat(size)], { type })
  return new File([blob], name, { type })
}

describe('createDropZone', () => {
  let element: HTMLDivElement

  beforeEach(() => {
    element = document.createElement('div')
    document.body.appendChild(element)
  })

  afterEach(() => {
    document.body.removeChild(element)
  })

  describe('initialization', () => {
    it('should create a drop zone attached to element', () => {
      const dropZone = createDropZone(element, { endpoint: '/upload' })

      expect(dropZone).toBeDefined()
      expect(dropZone.uploader).toBeDefined()
      expect(typeof dropZone.open).toBe('function')
      expect(typeof dropZone.destroy).toBe('function')
      expect(typeof dropZone.isDragActive).toBe('function')
      expect(typeof dropZone.isDragAccept).toBe('function')
      expect(typeof dropZone.isDragReject).toBe('function')

      dropZone.destroy()
    })

    it('should create hidden file input', () => {
      const dropZone = createDropZone(element, { endpoint: '/upload' })

      const input = element.querySelector('input[type="file"]')
      expect(input).not.toBeNull()
      expect(input?.style.display).toBe('none')

      dropZone.destroy()
    })

    it('should set accept attribute from allowedTypes', () => {
      const dropZone = createDropZone(element, {
        endpoint: '/upload',
        allowedTypes: ['image/*', 'application/pdf'],
      })

      const input = element.querySelector('input[type="file"]') as HTMLInputElement
      expect(input.accept).toBe('image/*,application/pdf')

      dropZone.destroy()
    })

    it('should set multiple attribute', () => {
      const dropZone = createDropZone(element, {
        endpoint: '/upload',
        multiple: false,
      })

      const input = element.querySelector('input[type="file"]') as HTMLInputElement
      expect(input.multiple).toBe(false)

      dropZone.destroy()
    })
  })

  describe('drag state', () => {
    it('should return initial drag state', () => {
      const dropZone = createDropZone(element, { endpoint: '/upload' })

      expect(dropZone.isDragActive()).toBe(false)
      expect(dropZone.isDragAccept()).toBe(false)
      expect(dropZone.isDragReject()).toBe(false)

      dropZone.destroy()
    })
  })

  describe('dragover', () => {
    it('should call onDragOver callback', () => {
      const onDragOver = vi.fn()
      const dropZone = createDropZone(element, {
        endpoint: '/upload',
        onDragOver,
      })

      const event = new DragEvent('dragover', {
        bubbles: true,
        cancelable: true,
      })

      element.dispatchEvent(event)

      expect(onDragOver).toHaveBeenCalled()

      dropZone.destroy()
    })
  })

  describe('callbacks', () => {
    it('should call onDragEnter', () => {
      const onDragEnter = vi.fn()
      const dropZone = createDropZone(element, {
        endpoint: '/upload',
        onDragEnter,
      })

      const event = new DragEvent('dragenter', {
        bubbles: true,
        cancelable: true,
      })

      element.dispatchEvent(event)

      expect(onDragEnter).toHaveBeenCalled()

      dropZone.destroy()
    })

    it('should call onDragLeave', () => {
      const onDragLeave = vi.fn()
      const dropZone = createDropZone(element, {
        endpoint: '/upload',
        onDragLeave,
      })

      element.dispatchEvent(
        new DragEvent('dragleave', {
          bubbles: true,
          cancelable: true,
          relatedTarget: document.body,
        })
      )

      expect(onDragLeave).toHaveBeenCalled()

      dropZone.destroy()
    })
  })

  describe('file input', () => {
    it('should add files from input selection', () => {
      const dropZone = createDropZone(element, { endpoint: '/upload' })
      const input = element.querySelector('input[type="file"]') as HTMLInputElement

      const file = createMockFile()
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)
      Object.defineProperty(input, 'files', {
        value: dataTransfer.files,
        configurable: true,
      })

      input.dispatchEvent(new Event('change', { bubbles: true }))

      expect(dropZone.uploader.getFiles()).toHaveLength(1)

      dropZone.destroy()
    })
  })

  describe('clickable', () => {
    it('should not do anything when clickable is false and element is clicked', () => {
      const dropZone = createDropZone(element, {
        endpoint: '/upload',
        clickable: false,
      })

      // Just verify no errors are thrown when clicking
      const event = new MouseEvent('click', { bubbles: true })
      element.dispatchEvent(event)

      dropZone.destroy()
    })

    it('should have clickable enabled by default', () => {
      const dropZone = createDropZone(element, {
        endpoint: '/upload',
      })

      // Default is clickable=true
      const config = dropZone.uploader.getConfig()
      expect(config.clickable).not.toBe(false)

      dropZone.destroy()
    })
  })

  describe('open', () => {
    it('should have open method', () => {
      const dropZone = createDropZone(element, { endpoint: '/upload' })

      expect(typeof dropZone.open).toBe('function')

      dropZone.destroy()
    })

    it('should have hidden input for file selection', () => {
      const dropZone = createDropZone(element, { endpoint: '/upload' })

      const input = element.querySelector('input[type="file"]') as HTMLInputElement
      expect(input).not.toBeNull()
      expect(input.style.display).toBe('none')

      dropZone.destroy()
    })
  })

  describe('drop', () => {
    it('should handle drop event', () => {
      const dropZone = createDropZone(element, {
        endpoint: '/upload',
      })

      // Just verify no errors when drop event fires (without proper DataTransfer)
      const dropEvent = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
      })
      element.dispatchEvent(dropEvent)

      dropZone.destroy()
    })

    it('should reset drag state after drop', () => {
      const dropZone = createDropZone(element, {
        endpoint: '/upload',
      })

      // Manually set drag state by triggering dragenter
      const enterEvent = new DragEvent('dragenter', {
        bubbles: true,
        cancelable: true,
      })
      element.dispatchEvent(enterEvent)

      // Now drop - should reset state
      const dropEvent = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
      })
      element.dispatchEvent(dropEvent)

      expect(dropZone.isDragActive()).toBe(false)

      dropZone.destroy()
    })
  })

  describe('dragover', () => {
    it('should call onDragOver callback', () => {
      const onDragOver = vi.fn()
      const dropZone = createDropZone(element, {
        endpoint: '/upload',
        onDragOver,
      })

      const overEvent = new DragEvent('dragover', {
        bubbles: true,
        cancelable: true,
      })
      element.dispatchEvent(overEvent)

      expect(onDragOver).toHaveBeenCalled()

      dropZone.destroy()
    })
  })

  describe('destroy', () => {
    it('should remove hidden input', () => {
      const dropZone = createDropZone(element, { endpoint: '/upload' })

      expect(element.querySelector('input[type="file"]')).not.toBeNull()

      dropZone.destroy()

      expect(element.querySelector('input[type="file"]')).toBeNull()
    })

    it('should remove classes', () => {
      const dropZone = createDropZone(element, {
        endpoint: '/upload',
        activeClass: 'drag-active',
        acceptClass: 'drag-accept',
        rejectClass: 'drag-reject',
      })

      element.classList.add('drag-active', 'drag-accept', 'drag-reject')

      dropZone.destroy()

      expect(element.classList.contains('drag-active')).toBe(false)
      expect(element.classList.contains('drag-accept')).toBe(false)
      expect(element.classList.contains('drag-reject')).toBe(false)
    })

    it('should destroy uploader', () => {
      const dropZone = createDropZone(element, { endpoint: '/upload' })

      dropZone.uploader.addFile(createMockFile())
      expect(dropZone.uploader.getFiles().length).toBe(1)

      dropZone.destroy()
      expect(dropZone.uploader.getFiles().length).toBe(0)
    })
  })
})
