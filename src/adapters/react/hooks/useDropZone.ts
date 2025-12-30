import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type InputHTMLAttributes,
} from 'react'
import type { DropZoneConfig, FileItem, Uploader } from '../../../types'
import { createUploader } from '../../../core/uploader'
import { matchesAnyMimePattern } from '../../../utils/mime'

export interface UseDropZoneResult {
  // Props to spread
  getRootProps: () => HTMLAttributes<HTMLElement>
  getInputProps: () => InputHTMLAttributes<HTMLInputElement>

  // State
  isDragActive: boolean
  isDragAccept: boolean
  isDragReject: boolean

  // Files
  files: FileItem[]

  // Open dialog
  open: () => void

  // Uploader access
  uploader: Uploader
}

export function useDropZone(config: DropZoneConfig): UseDropZoneResult {
  const [isDragActive, setIsDragActive] = useState(false)
  const [isDragAccept, setIsDragAccept] = useState(false)
  const [isDragReject, setIsDragReject] = useState(false)
  const [files, setFiles] = useState<FileItem[]>([])

  const inputRef = useRef<HTMLInputElement | null>(null)
  const dragCounter = useRef(0)

  // Create uploader
  const uploader = useMemo(() => createUploader(config), [])

  // Update files state
  const updateFiles = useCallback(() => {
    setFiles([...uploader.getFiles()])
  }, [uploader])

  // Subscribe to uploader events
  useEffect(() => {
    const unsubscribers = [
      uploader.on('add', updateFiles),
      uploader.on('remove', updateFiles),
      uploader.on('complete', updateFiles),
      uploader.on('error', updateFiles),
      uploader.on('progress', updateFiles),
    ]

    return () => {
      unsubscribers.forEach((unsub) => unsub())
      uploader.destroy()
    }
  }, [uploader, updateFiles])

  // Check if files are acceptable
  const checkAcceptable = useCallback(
    (dataTransfer: DataTransfer): boolean => {
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
    },
    [config.allowedTypes]
  )

  // Handle drag enter
  const handleDragEnter = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      event.stopPropagation()

      dragCounter.current++

      if (event.dataTransfer) {
        const acceptable = checkAcceptable(event.dataTransfer)
        setIsDragActive(true)
        setIsDragAccept(acceptable)
        setIsDragReject(!acceptable)
      }

      config.onDragEnter?.(event.nativeEvent)
    },
    [config, checkAcceptable]
  )

  // Handle drag over
  const handleDragOver = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      event.stopPropagation()

      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = isDragAccept ? 'copy' : 'none'
      }

      config.onDragOver?.(event.nativeEvent)
    },
    [config, isDragAccept]
  )

  // Handle drag leave
  const handleDragLeave = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      event.stopPropagation()

      dragCounter.current--

      if (dragCounter.current === 0) {
        setIsDragActive(false)
        setIsDragAccept(false)
        setIsDragReject(false)
      }

      config.onDragLeave?.(event.nativeEvent)
    },
    [config]
  )

  // Handle drop
  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      event.stopPropagation()

      dragCounter.current = 0
      setIsDragActive(false)
      setIsDragAccept(false)
      setIsDragReject(false)

      if (!event.dataTransfer) return

      const droppedFiles = event.dataTransfer.files
      if (droppedFiles.length > 0) {
        const items = uploader.addFiles(droppedFiles)
        updateFiles()
        config.onDrop?.(items, event.nativeEvent)
      }
    },
    [uploader, updateFiles, config]
  )

  // Handle click
  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      if (config.clickable === false) return
      event.stopPropagation()
      inputRef.current?.click()
    },
    [config.clickable]
  )

  // Handle input change
  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = event.target.files
      if (selectedFiles && selectedFiles.length > 0) {
        uploader.addFiles(selectedFiles)
        updateFiles()
      }
      // Reset input
      event.target.value = ''
    },
    [uploader, updateFiles]
  )

  // Open file dialog
  const open = useCallback(() => {
    inputRef.current?.click()
  }, [])

  // Get root props
  const getRootProps = useCallback(
    (): HTMLAttributes<HTMLElement> => ({
      onDragEnter: handleDragEnter,
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
      onClick: handleClick,
    }),
    [handleDragEnter, handleDragOver, handleDragLeave, handleDrop, handleClick]
  )

  // Get input props
  const getInputProps = useCallback(
    (): InputHTMLAttributes<HTMLInputElement> & { ref: (el: HTMLInputElement | null) => void } => ({
      ref: (el: HTMLInputElement | null) => {
        inputRef.current = el
      },
      type: 'file',
      multiple: config.multiple ?? true,
      accept: config.allowedTypes?.join(','),
      style: { display: 'none' },
      onChange: handleInputChange,
    }),
    [config.multiple, config.allowedTypes, handleInputChange]
  )

  return {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
    files,
    open,
    uploader,
  }
}
