/**
 * Size units for formatting
 */
const SIZE_UNITS = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'] as const

/**
 * Format bytes to human-readable string
 * @example formatFileSize(1024) // "1 KB"
 * @example formatFileSize(1536000) // "1.46 MB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) {
    return '0 Bytes'
  }

  if (bytes < 0) {
    return '-' + formatFileSize(-bytes)
  }

  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  // Clamp to available units
  const unitIndex = Math.min(i, SIZE_UNITS.length - 1)
  const unit = SIZE_UNITS[unitIndex]

  if (unit === undefined) {
    return `${bytes} Bytes`
  }

  const size = bytes / Math.pow(k, unitIndex)

  // Format with appropriate decimal places
  if (size >= 100) {
    return `${Math.round(size)} ${unit}`
  } else if (size >= 10) {
    return `${size.toFixed(1)} ${unit}`
  } else {
    return `${size.toFixed(2)} ${unit}`
  }
}

/**
 * Parse human-readable size string to bytes
 * @example parseFileSize("10 MB") // 10485760
 * @example parseFileSize("1.5GB") // 1610612736
 * @example parseFileSize("100") // 100 (bytes when no unit specified)
 */
export function parseFileSize(size: string): number {
  const trimmed = size.trim()

  if (!trimmed) {
    return 0
  }

  // Match number and optional unit (B, KB, MB, GB, TB, PB, bytes, k, m, g, t, p)
  const match = trimmed.match(/^(-?\d+(?:\.\d+)?)\s*(bytes?|[kmgtp]?b?)?$/i)

  if (!match || match[1] === undefined) {
    return NaN
  }

  const value = parseFloat(match[1])
  const unit = match[2] ? match[2].toUpperCase() : ''

  // No unit means bytes
  if (!unit) {
    return Math.round(value)
  }

  const multipliers: Record<string, number> = {
    BYTE: 1,
    BYTES: 1,
    B: 1,
    K: 1024,
    KB: 1024,
    M: 1024 * 1024,
    MB: 1024 * 1024,
    G: 1024 * 1024 * 1024,
    GB: 1024 * 1024 * 1024,
    T: 1024 * 1024 * 1024 * 1024,
    TB: 1024 * 1024 * 1024 * 1024,
    P: 1024 * 1024 * 1024 * 1024 * 1024,
    PB: 1024 * 1024 * 1024 * 1024 * 1024,
  }

  const multiplier = multipliers[unit]
  if (multiplier === undefined) {
    return NaN
  }

  return Math.round(value * multiplier)
}

/**
 * Format speed in bytes per second
 * @example formatSpeed(1024000) // "1000 KB/s"
 */
export function formatSpeed(bytesPerSecond: number): string {
  return `${formatFileSize(bytesPerSecond)}/s`
}

/**
 * Format time in seconds to human-readable
 * @example formatTime(65) // "1:05"
 * @example formatTime(3665) // "1:01:05"
 */
export function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) {
    return '--:--'
  }

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  return `${minutes}:${String(secs).padStart(2, '0')}`
}
