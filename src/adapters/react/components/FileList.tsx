import type { ReactNode } from 'react'
import type { FileItem } from '../../../types'
import { formatFileSize } from '../../../utils/size'

export interface FileListActions {
  remove: () => void
  retry: () => void
  cancel: () => void
}

export interface FileListProps {
  files: FileItem[]

  // Display options
  showPreview?: boolean
  showSize?: boolean
  showProgress?: boolean
  showStatus?: boolean

  // Actions
  onRemove?: (file: FileItem) => void
  onRetry?: (file: FileItem) => void
  onCancel?: (file: FileItem) => void

  // Customization
  previewSize?: number
  className?: string
  itemClassName?: string

  // Custom render
  renderItem?: (file: FileItem, actions: FileListActions) => ReactNode
}

export function FileList({
  files,
  showPreview = true,
  showSize = true,
  showProgress = true,
  showStatus = true,
  onRemove,
  onRetry,
  onCancel,
  previewSize = 60,
  className,
  itemClassName,
  renderItem,
}: FileListProps) {
  if (files.length === 0) {
    return null
  }

  return (
    <ul className={className} style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {files.map((file) => {
        const actions: FileListActions = {
          remove: () => onRemove?.(file),
          retry: () => onRetry?.(file),
          cancel: () => onCancel?.(file),
        }

        if (renderItem) {
          return <li key={file.id}>{renderItem(file, actions)}</li>
        }

        return (
          <li
            key={file.id}
            className={itemClassName}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px',
              borderBottom: '1px solid #eee',
            }}
          >
            {/* Preview */}
            {showPreview && file.preview && (
              <img
                src={file.preview}
                alt={file.name}
                style={{
                  width: previewSize,
                  height: previewSize,
                  objectFit: 'cover',
                  borderRadius: '4px',
                }}
              />
            )}

            {/* File info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 500,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {file.name}
              </div>

              <div
                style={{
                  fontSize: '0.85em',
                  color: '#666',
                  display: 'flex',
                  gap: '8px',
                }}
              >
                {showSize && <span>{formatFileSize(file.size)}</span>}
                {showStatus && (
                  <span
                    style={{
                      color:
                        file.status === 'completed'
                          ? 'green'
                          : file.status === 'error'
                            ? 'red'
                            : file.status === 'uploading'
                              ? 'blue'
                              : '#666',
                    }}
                  >
                    {file.status}
                  </span>
                )}
              </div>

              {/* Progress bar */}
              {showProgress && file.status === 'uploading' && (
                <div
                  style={{
                    marginTop: '4px',
                    height: '4px',
                    background: '#eee',
                    borderRadius: '2px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${file.progress}%`,
                      height: '100%',
                      background: '#2196f3',
                      transition: 'width 0.2s ease',
                    }}
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '4px' }}>
              {file.status === 'error' && onRetry && (
                <button
                  onClick={actions.retry}
                  style={{
                    padding: '4px 8px',
                    border: 'none',
                    borderRadius: '4px',
                    background: '#ff9800',
                    color: 'white',
                    cursor: 'pointer',
                  }}
                >
                  Retry
                </button>
              )}

              {file.status === 'uploading' && onCancel && (
                <button
                  onClick={actions.cancel}
                  style={{
                    padding: '4px 8px',
                    border: 'none',
                    borderRadius: '4px',
                    background: '#f44336',
                    color: 'white',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              )}

              {onRemove && file.status !== 'uploading' && (
                <button
                  onClick={actions.remove}
                  style={{
                    padding: '4px 8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    background: 'white',
                    cursor: 'pointer',
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
