import type { OverallProgress } from '../../../types'
import { formatFileSize, formatSpeed, formatTime } from '../../../utils/size'

export interface UploadProgressProps {
  progress: OverallProgress

  // Display options
  showPercentage?: boolean
  showSpeed?: boolean
  showRemaining?: boolean
  showFileCount?: boolean
  showBytes?: boolean

  // Customization
  className?: string
  barClassName?: string
}

export function UploadProgress({
  progress,
  showPercentage = true,
  showSpeed = false,
  showRemaining = false,
  showFileCount = false,
  showBytes = false,
  className,
  barClassName,
}: UploadProgressProps) {
  const {
    totalFiles,
    completedFiles,
    failedFiles,
    totalBytes,
    uploadedBytes,
    percentage,
    speed,
    remainingTime,
  } = progress

  // Don't render if no files
  if (totalFiles === 0) {
    return null
  }

  return (
    <div className={className}>
      {/* Progress bar */}
      <div
        className={barClassName}
        style={{
          height: '8px',
          background: '#eee',
          borderRadius: '4px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            background:
              failedFiles > 0
                ? 'linear-gradient(90deg, #2196f3, #f44336)'
                : '#2196f3',
            transition: 'width 0.2s ease',
          }}
        />
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '8px',
          fontSize: '0.85em',
          color: '#666',
        }}
      >
        <div style={{ display: 'flex', gap: '16px' }}>
          {showPercentage && <span>{percentage}%</span>}

          {showFileCount && (
            <span>
              {completedFiles}/{totalFiles} files
              {failedFiles > 0 && ` (${failedFiles} failed)`}
            </span>
          )}

          {showBytes && (
            <span>
              {formatFileSize(uploadedBytes)} / {formatFileSize(totalBytes)}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          {showSpeed && speed > 0 && <span>{formatSpeed(speed)}</span>}

          {showRemaining && remainingTime > 0 && remainingTime !== Infinity && (
            <span>{formatTime(remainingTime)} remaining</span>
          )}
        </div>
      </div>
    </div>
  )
}
