import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { withRetry } from '../../../src/upload/retry'

describe('withRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return result on success', async () => {
    const fn = vi.fn().mockResolvedValue('success')

    const promise = withRetry(fn, { maxRetries: 3, delay: 100 })
    await vi.runAllTimersAsync()
    const result = await promise

    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should retry on failure', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('success')

    const promise = withRetry(fn, { maxRetries: 3, delay: 100 })
    await vi.runAllTimersAsync()
    const result = await promise

    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('should throw after max retries', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('always fail'))

    const promise = withRetry(fn, { maxRetries: 2, delay: 100 })

    // Attach catch handler immediately to prevent unhandled rejection
    const resultPromise = promise.catch((e: Error) => e)

    await vi.runAllTimersAsync()

    const error = await resultPromise
    expect(error).toBeInstanceOf(Error)
    expect((error as Error).message).toBe('always fail')
    expect(fn).toHaveBeenCalledTimes(3) // initial + 2 retries
  })

  it('should use exponential backoff', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('success')

    const promise = withRetry(fn, { maxRetries: 3, delay: 100 })

    // First call is immediate
    expect(fn).toHaveBeenCalledTimes(1)

    // First retry after 100ms (100 * 2^0)
    await vi.advanceTimersByTimeAsync(100)
    expect(fn).toHaveBeenCalledTimes(2)

    // Second retry after 200ms (100 * 2^1)
    await vi.advanceTimersByTimeAsync(200)
    expect(fn).toHaveBeenCalledTimes(3)

    await promise
  })

  it('should respect shouldRetry option', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('non-retryable'))
    const shouldRetry = vi.fn().mockReturnValue(false)

    const promise = withRetry(fn, { maxRetries: 3, delay: 100, shouldRetry })

    // Attach catch handler immediately to prevent unhandled rejection
    const resultPromise = promise.catch((e: Error) => e)

    await vi.runAllTimersAsync()

    const error = await resultPromise
    expect(error).toBeInstanceOf(Error)
    expect((error as Error).message).toBe('non-retryable')
    expect(fn).toHaveBeenCalledTimes(1)
    expect(shouldRetry).toHaveBeenCalledWith(expect.any(Error), 0)
  })

  it('should pass attempt number to shouldRetry', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail1'))
      .mockRejectedValueOnce(new Error('fail2'))
      .mockResolvedValue('success')

    const shouldRetry = vi.fn().mockReturnValue(true)

    const promise = withRetry(fn, { maxRetries: 3, delay: 100, shouldRetry })
    await vi.runAllTimersAsync()
    await promise

    expect(shouldRetry).toHaveBeenCalledTimes(2)
    expect(shouldRetry).toHaveBeenNthCalledWith(1, expect.any(Error), 0)
    expect(shouldRetry).toHaveBeenNthCalledWith(2, expect.any(Error), 1)
  })

  it('should use default options', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('success')

    const promise = withRetry(fn)
    await vi.runAllTimersAsync()
    const result = await promise

    expect(result).toBe('success')
  })
})
