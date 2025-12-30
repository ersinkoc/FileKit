import { describe, it, expect, vi } from 'vitest'
import { EventEmitter } from '../../../src/core/events'

type TestEvents = {
  message: [text: string]
  count: [value: number]
  multi: [a: string, b: number]
  empty: []
}

describe('EventEmitter', () => {
  it('should emit events to listeners', () => {
    const emitter = new EventEmitter<TestEvents>()
    const handler = vi.fn()

    emitter.on('message', handler)
    emitter.emit('message', 'hello')

    expect(handler).toHaveBeenCalledWith('hello')
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('should support multiple listeners', () => {
    const emitter = new EventEmitter<TestEvents>()
    const handler1 = vi.fn()
    const handler2 = vi.fn()

    emitter.on('message', handler1)
    emitter.on('message', handler2)
    emitter.emit('message', 'test')

    expect(handler1).toHaveBeenCalledWith('test')
    expect(handler2).toHaveBeenCalledWith('test')
  })

  it('should return unsubscribe function from on()', () => {
    const emitter = new EventEmitter<TestEvents>()
    const handler = vi.fn()

    const unsubscribe = emitter.on('message', handler)
    emitter.emit('message', 'first')
    unsubscribe()
    emitter.emit('message', 'second')

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith('first')
  })

  it('should unsubscribe with off()', () => {
    const emitter = new EventEmitter<TestEvents>()
    const handler = vi.fn()

    emitter.on('message', handler)
    emitter.emit('message', 'first')
    emitter.off('message', handler)
    emitter.emit('message', 'second')

    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('should handle events with multiple arguments', () => {
    const emitter = new EventEmitter<TestEvents>()
    const handler = vi.fn()

    emitter.on('multi', handler)
    emitter.emit('multi', 'text', 42)

    expect(handler).toHaveBeenCalledWith('text', 42)
  })

  it('should handle events with no arguments', () => {
    const emitter = new EventEmitter<TestEvents>()
    const handler = vi.fn()

    emitter.on('empty', handler)
    emitter.emit('empty')

    expect(handler).toHaveBeenCalled()
  })

  it('should support once() for single-fire listeners', () => {
    const emitter = new EventEmitter<TestEvents>()
    const handler = vi.fn()

    emitter.once('message', handler)
    emitter.emit('message', 'first')
    emitter.emit('message', 'second')

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith('first')
  })

  it('should return unsubscribe function from once()', () => {
    const emitter = new EventEmitter<TestEvents>()
    const handler = vi.fn()

    const unsubscribe = emitter.once('message', handler)
    unsubscribe()
    emitter.emit('message', 'test')

    expect(handler).not.toHaveBeenCalled()
  })

  it('should remove all listeners for specific event', () => {
    const emitter = new EventEmitter<TestEvents>()
    const handler1 = vi.fn()
    const handler2 = vi.fn()

    emitter.on('message', handler1)
    emitter.on('message', handler2)
    emitter.removeAllListeners('message')
    emitter.emit('message', 'test')

    expect(handler1).not.toHaveBeenCalled()
    expect(handler2).not.toHaveBeenCalled()
  })

  it('should remove all listeners for all events', () => {
    const emitter = new EventEmitter<TestEvents>()
    const msgHandler = vi.fn()
    const countHandler = vi.fn()

    emitter.on('message', msgHandler)
    emitter.on('count', countHandler)
    emitter.removeAllListeners()
    emitter.emit('message', 'test')
    emitter.emit('count', 42)

    expect(msgHandler).not.toHaveBeenCalled()
    expect(countHandler).not.toHaveBeenCalled()
  })

  it('should return correct listener count', () => {
    const emitter = new EventEmitter<TestEvents>()

    expect(emitter.listenerCount('message')).toBe(0)

    const handler1 = vi.fn()
    const handler2 = vi.fn()
    emitter.on('message', handler1)
    emitter.on('message', handler2)

    expect(emitter.listenerCount('message')).toBe(2)

    emitter.off('message', handler1)
    expect(emitter.listenerCount('message')).toBe(1)
  })

  it('should not throw when emitting with no listeners', () => {
    const emitter = new EventEmitter<TestEvents>()
    expect(() => emitter.emit('message', 'test')).not.toThrow()
  })

  it('should not throw when removing non-existent listener', () => {
    const emitter = new EventEmitter<TestEvents>()
    const handler = vi.fn()
    expect(() => emitter.off('message', handler)).not.toThrow()
  })

  it('should catch and log errors from handlers', () => {
    const emitter = new EventEmitter<TestEvents>()
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const goodHandler = vi.fn()
    const badHandler = vi.fn(() => {
      throw new Error('Handler error')
    })

    emitter.on('message', badHandler)
    emitter.on('message', goodHandler)
    emitter.emit('message', 'test')

    expect(consoleSpy).toHaveBeenCalled()
    expect(goodHandler).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })
})
