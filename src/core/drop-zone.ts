import type { DropZone, DropZoneConfig } from '../types'
import { createUploader } from './uploader'
import { matchesAnyMimePattern } from '../utils/mime'

/**
 * Create a drop zone attached to an element
 */
export function createDropZone(
  element: HTMLElement,
  config: DropZoneConfig
): DropZone {
  const uploader = createUploader(config)

  let dragActive = false
  let dragAccept = false
  let dragReject = false
  let hiddenInput: HTMLInputElement | null = null

  // Create hidden file input
  function createHiddenInput(): HTMLInputElement {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = config.multiple ?? true
    input.style.display = 'none'

    if (config.allowedTypes && config.allowedTypes.length > 0) {
      input.accept = config.allowedTypes.join(',')
    }

    input.addEventListener('change', handleInputChange)
    element.appendChild(input)

    return input
  }

  // Handle file input change
  function handleInputChange(event: Event): void {
    const input = event.target as HTMLInputElement
    if (input.files && input.files.length > 0) {
      addFiles(input.files)
      input.value = '' // Reset for next selection
    }
  }

  // Add files from drop or input
  function addFiles(fileList: FileList): void {
    const items = uploader.addFiles(fileList)
    config.onDrop?.(items, new DragEvent('drop'))
  }

  // Check if files are acceptable
  function checkAcceptable(dataTransfer: DataTransfer): boolean {
    if (!config.allowedTypes || config.allowedTypes.length === 0) {
      return true
    }

    const items = dataTransfer.items
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item) {
        const type = item.type || 'application/octet-stream'
        if (!matchesAnyMimePattern(type, config.allowedTypes)) {
          return false
        }
      }
    }

    return true
  }

  // Update visual classes
  function updateClasses(): void {
    if (config.activeClass) {
      element.classList.toggle(config.activeClass, dragActive)
    }
    if (config.acceptClass) {
      element.classList.toggle(config.acceptClass, dragAccept)
    }
    if (config.rejectClass) {
      element.classList.toggle(config.rejectClass, dragReject)
    }
  }

  // Handle drag enter
  function handleDragEnter(event: DragEvent): void {
    event.preventDefault()
    event.stopPropagation()

    dragActive = true

    if (event.dataTransfer) {
      const acceptable = checkAcceptable(event.dataTransfer)
      dragAccept = acceptable
      dragReject = !acceptable
    }

    updateClasses()
    config.onDragEnter?.(event)
  }

  // Handle drag over
  function handleDragOver(event: DragEvent): void {
    event.preventDefault()
    event.stopPropagation()

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = dragAccept ? 'copy' : 'none'
    }

    config.onDragOver?.(event)
  }

  // Handle drag leave
  function handleDragLeave(event: DragEvent): void {
    event.preventDefault()
    event.stopPropagation()

    // Only deactivate if leaving the element entirely
    const relatedTarget = event.relatedTarget as Node | null
    if (relatedTarget && element.contains(relatedTarget)) {
      return
    }

    dragActive = false
    dragAccept = false
    dragReject = false

    updateClasses()
    config.onDragLeave?.(event)
  }

  // Handle drop
  function handleDrop(event: DragEvent): void {
    event.preventDefault()
    event.stopPropagation()

    dragActive = false
    dragAccept = false
    dragReject = false
    updateClasses()

    if (!event.dataTransfer) {
      return
    }

    const files = event.dataTransfer.files
    if (files.length > 0) {
      const items = uploader.addFiles(files)
      config.onDrop?.(items, event)
    }
  }

  // Handle click
  function handleClick(event: MouseEvent): void {
    if (config.clickable === false) {
      return
    }

    event.preventDefault()
    open()
  }

  // Open file dialog
  function open(): void {
    if (!hiddenInput) {
      hiddenInput = createHiddenInput()
    }
    hiddenInput.click()
  }

  // Add event listeners
  element.addEventListener('dragenter', handleDragEnter)
  element.addEventListener('dragover', handleDragOver)
  element.addEventListener('dragleave', handleDragLeave)
  element.addEventListener('drop', handleDrop)
  element.addEventListener('click', handleClick)

  // Create hidden input
  hiddenInput = createHiddenInput()

  // State getters
  function isDragActive(): boolean {
    return dragActive
  }

  function isDragAccept(): boolean {
    return dragAccept
  }

  function isDragReject(): boolean {
    return dragReject
  }

  // Cleanup
  function destroy(): void {
    element.removeEventListener('dragenter', handleDragEnter)
    element.removeEventListener('dragover', handleDragOver)
    element.removeEventListener('dragleave', handleDragLeave)
    element.removeEventListener('drop', handleDrop)
    element.removeEventListener('click', handleClick)

    if (hiddenInput) {
      hiddenInput.removeEventListener('change', handleInputChange)
      hiddenInput.remove()
      hiddenInput = null
    }

    // Remove classes
    if (config.activeClass) element.classList.remove(config.activeClass)
    if (config.acceptClass) element.classList.remove(config.acceptClass)
    if (config.rejectClass) element.classList.remove(config.rejectClass)

    uploader.destroy()
  }

  return {
    uploader,
    isDragActive,
    isDragAccept,
    isDragReject,
    open,
    destroy,
  }
}
