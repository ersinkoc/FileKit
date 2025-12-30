import type { ReactNode } from 'react'
import type { FileItem, OverallProgress, UploaderConfig } from '../../../types'
import { useDropZone } from '../hooks/useDropZone'

export interface DropZoneRenderProps {
  isDragActive: boolean
  isDragAccept: boolean
  isDragReject: boolean
  files: FileItem[]
  progress: OverallProgress
  open: () => void
}

// Configuration props that are passed to the uploader
export interface DropZoneConfigProps extends UploaderConfig {
  multiple?: boolean
  clickable?: boolean
}

export interface DropZoneProps extends DropZoneConfigProps {
  children?: ReactNode | ((props: DropZoneRenderProps) => ReactNode)

  // Container props
  className?: string
  style?: React.CSSProperties

  // Callbacks
  onFilesAdded?: (files: FileItem[]) => void
  onUploadStart?: (file: FileItem) => void
  onUploadProgress?: (progress: { file: FileItem; percentage: number }) => void
  onUploadComplete?: (file: FileItem, response: unknown) => void
  onUploadError?: (file: FileItem, error: Error) => void
  onAllComplete?: (files: FileItem[]) => void

  // Classes for different states
  activeClassName?: string
  acceptClassName?: string
  rejectClassName?: string
}

export function DropZone({
  children,
  className,
  style,
  activeClassName,
  acceptClassName,
  rejectClassName,
  onFilesAdded,
  onUploadStart,
  onUploadProgress,
  onUploadComplete,
  onUploadError,
  onAllComplete,
  multiple,
  clickable,
  ...uploaderConfig
}: DropZoneProps) {
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
    files,
    open,
    uploader,
  } = useDropZone({
    ...uploaderConfig,
    multiple,
    clickable,
    // Map component callbacks to uploader config callbacks
    onAdd: onFilesAdded ? (file) => onFilesAdded([file]) : undefined,
    onProgress: onUploadProgress
      ? (progress) => onUploadProgress({ file: progress.file, percentage: progress.percentage })
      : undefined,
    onComplete: onUploadComplete,
    onError: onUploadError,
    onAllComplete,
  })

  // Call onUploadStart when upload starts (we need to subscribe to the uploader)
  if (onUploadStart) {
    uploader.on('start', onUploadStart)
  }

  // Build class names
  const classNames = [
    className,
    isDragActive && activeClassName,
    isDragAccept && acceptClassName,
    isDragReject && rejectClassName,
  ]
    .filter(Boolean)
    .join(' ')

  // Render props
  const renderProps: DropZoneRenderProps = {
    isDragActive,
    isDragAccept,
    isDragReject,
    files,
    progress: uploader.getProgress(),
    open,
  }

  return (
    <div {...getRootProps()} className={classNames || undefined} style={style}>
      <input {...getInputProps()} />
      {typeof children === 'function' ? children(renderProps) : children}
    </div>
  )
}
