import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { calculateProgress, throttle } from '../../../src/upload/progress'

describe('calculateProgress', () => {
  it('should calculate percentage correctly', () => {
    const startTime = Date.now() - 1000 // 1 second ago
    const result = calculateProgress(500, 1000, startTime)

    expect(result.percentage).toBe(50)
  })

  it('should calculate 0% for no progress', () => {
    const result = calculateProgress(0, 1000, Date.now())
    expect(result.percentage).toBe(0)
  })

  it('should calculate 100% when complete', () => {
    const result = calculateProgress(1000, 1000, Date.now() - 1000)
    expect(result.percentage).toBe(100)
  })

  it('should handle zero total', () => {
    const result = calculateProgress(0, 0, Date.now())
    expect(result.percentage).toBe(0)
  })

  it('should calculate speed', () => {
    const startTime = Date.now() - 2000 // 2 seconds ago
    const result = calculateProgress(1000, 2000, startTime)

    // 1000 bytes in 2 seconds = 500 bytes/sec
    expect(result.speed).toBeCloseTo(500, 0)
  })

  it('should calculate remaining time', () => {
    const startTime = Date.now() - 2000 // 2 seconds ago
    const result = calculateProgress(1000, 2000, startTime)

    // 1000 remaining at 500 bytes/sec = 2 seconds
    expect(result.remainingTime).toBeCloseTo(2, 0)
  })

  it('should return Infinity for remaining time when speed is 0', () => {
    const result = calculateProgress(0, 1000, Date.now())
    expect(result.remainingTime).toBe(Infinity)
  })
})

describe('throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should call function immediately on first call', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled()

    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should throttle subsequent calls', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled()
    throttled()
    throttled()

    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should call function after delay', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled()
    throttled()

    vi.advanceTimersByTime(100)

    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('should pass arguments to function', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled('arg1', 'arg2')

    expect(fn).toHaveBeenCalledWith('arg1', 'arg2')
  })

  it('should use latest arguments for delayed call', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled('first')
    throttled('second')
    throttled('third')

    vi.advanceTimersByTime(100)

    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenLastCalledWith('third')
  })

  it('should allow calls after delay passes', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled()
    vi.advanceTimersByTime(100)
    throttled()

    expect(fn).toHaveBeenCalledTimes(2)
  })
})
