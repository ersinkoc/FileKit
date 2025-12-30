import type { RetryOptions } from '../types'

/**
 * Default retry options
 */
const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  delay: 1000,
  shouldRetry: () => true,
}

/**
 * Execute a function with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options }
  let lastError: unknown

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      // Check if we should retry
      if (attempt >= opts.maxRetries) {
        break
      }

      if (opts.shouldRetry && !opts.shouldRetry(error, attempt)) {
        break
      }

      // Wait before retrying
      await delay(opts.delay * Math.pow(2, attempt)) // Exponential backoff
    }
  }

  throw lastError
}

/**
 * Delay for a specified number of milliseconds
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
