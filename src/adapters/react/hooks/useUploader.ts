import { useCallback, useEffect, useMemo, useState } from 'react'
import type {
  FileItem,
  FileStatus,
  OverallProgress,
  Uploader,
  UploaderConfig,
} from '../../../types'
import { createUploader } from '../../../core/uploader'

export interface UseUploaderResult {
  // Files
  files: FileItem[]
  addFile: (file: File) => FileItem
  addFiles: (files: File[] | FileList) => FileItem[]
  removeFile: (fileId: string) => void
  removeAll: () => void

  // Upload
  upload: (fileId?: string) => Promise<void>
  uploadAll: () => Promise<void>

  // Control
  pause: (fileId?: string) => void
  resume: (fileId?: string) => void
  cancel: (fileId?: string) => void
  retry: (fileId?: string) => void

  // State
  isUploading: boolean
  isPaused: boolean
  progress: OverallProgress

  // Query
  getFilesByStatus: (status: FileStatus) => FileItem[]

  // Config
  setConfig: (config: Partial<UploaderConfig>) => void

  // Uploader instance
  uploader: Uploader
}

export function useUploader(config: UploaderConfig): UseUploaderResult {
  const [files, setFiles] = useState<FileItem[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [progress, setProgress] = useState<OverallProgress>({
    totalFiles: 0,
    completedFiles: 0,
    failedFiles: 0,
    totalBytes: 0,
    uploadedBytes: 0,
    percentage: 0,
    speed: 0,
    remainingTime: 0,
  })

  // Create uploader instance
  const uploader = useMemo(() => createUploader(config), [])

  // Update state from uploader
  const updateState = useCallback(() => {
    setFiles([...uploader.getFiles()])
    setIsUploading(uploader.isUploading())
    setIsPaused(uploader.isPaused())
    setProgress(uploader.getProgress())
  }, [uploader])

  // Subscribe to events
  useEffect(() => {
    const unsubscribers = [
      uploader.on('add', updateState),
      uploader.on('remove', updateState),
      uploader.on('start', updateState),
      uploader.on('progress', updateState),
      uploader.on('complete', updateState),
      uploader.on('error', updateState),
      uploader.on('pause', updateState),
      uploader.on('resume', updateState),
      uploader.on('cancel', updateState),
      uploader.on('allComplete', updateState),
    ]

    // Initial state
    updateState()

    return () => {
      unsubscribers.forEach((unsub) => unsub())
      uploader.destroy()
    }
  }, [uploader, updateState])

  // Memoized callbacks
  const addFile = useCallback(
    (file: File) => {
      const item = uploader.addFile(file)
      updateState()
      return item
    },
    [uploader, updateState]
  )

  const addFiles = useCallback(
    (fileList: File[] | FileList) => {
      const items = uploader.addFiles(fileList)
      updateState()
      return items
    },
    [uploader, updateState]
  )

  const removeFile = useCallback(
    (fileId: string) => {
      uploader.removeFile(fileId)
      updateState()
    },
    [uploader, updateState]
  )

  const removeAll = useCallback(() => {
    uploader.removeAll()
    updateState()
  }, [uploader, updateState])

  const upload = useCallback(
    async (fileId?: string) => {
      await uploader.upload(fileId)
    },
    [uploader]
  )

  const uploadAll = useCallback(async () => {
    await uploader.uploadAll()
  }, [uploader])

  const pause = useCallback(
    (fileId?: string) => {
      uploader.pause(fileId)
      updateState()
    },
    [uploader, updateState]
  )

  const resume = useCallback(
    (fileId?: string) => {
      uploader.resume(fileId)
      updateState()
    },
    [uploader, updateState]
  )

  const cancel = useCallback(
    (fileId?: string) => {
      uploader.cancel(fileId)
      updateState()
    },
    [uploader, updateState]
  )

  const retry = useCallback(
    (fileId?: string) => {
      uploader.retry(fileId)
      updateState()
    },
    [uploader, updateState]
  )

  const getFilesByStatus = useCallback(
    (status: FileStatus) => {
      return uploader.getFilesByStatus(status)
    },
    [uploader]
  )

  const setConfig = useCallback(
    (newConfig: Partial<UploaderConfig>) => {
      uploader.setConfig(newConfig)
    },
    [uploader]
  )

  return {
    files,
    addFile,
    addFiles,
    removeFile,
    removeAll,
    upload,
    uploadAll,
    pause,
    resume,
    cancel,
    retry,
    isUploading,
    isPaused,
    progress,
    getFilesByStatus,
    setConfig,
    uploader,
  }
}
