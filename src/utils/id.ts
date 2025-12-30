/**
 * Generate a unique ID for file items
 * Format: file_[timestamp]_[random]
 */
export function generateId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 9)
  return `file_${timestamp}_${random}`
}
