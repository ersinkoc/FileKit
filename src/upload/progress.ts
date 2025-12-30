/**
 * Progress calculation result
 */
export interface ProgressInfo {
  percentage: number
  speed: number
  remainingTime: number
}

/**
 * Calculate upload progress with speed and remaining time
 */
export function calculateProgress(
  loaded: number,
  total: number,
  startTime: number
): ProgressInfo {
  const now = Date.now()
  const elapsed = (now - startTime) / 1000 // seconds

  // Calculate percentage
  const percentage = total > 0 ? Math.round((loaded / total) * 100) : 0

  // Calculate speed (bytes per second)
  const speed = elapsed > 0 ? loaded / elapsed : 0

  // Calculate remaining time (seconds)
  const remaining = total - loaded
  const remainingTime = speed > 0 ? remaining / speed : Infinity

  return {
    percentage,
    speed,
    remainingTime,
  }
}

/**
 * Throttle function to limit progress updates
 */
export function throttle<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): T {
  let lastCall = 0
  let timeout: ReturnType<typeof setTimeout> | null = null
  let pendingArgs: Parameters<T> | null = null

  return ((...args: Parameters<T>) => {
    const now = Date.now()

    if (now - lastCall >= delay) {
      lastCall = now
      fn(...args)
    } else {
      // Store latest args for delayed execution
      pendingArgs = args
      if (!timeout) {
        timeout = setTimeout(
          () => {
            lastCall = Date.now()
            timeout = null
            if (pendingArgs) {
              fn(...pendingArgs)
              pendingArgs = null
            }
          },
          delay - (now - lastCall)
        )
      }
    }
  }) as T
}
