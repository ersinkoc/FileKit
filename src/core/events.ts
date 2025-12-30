/**
 * Type-safe event emitter
 */
export class EventEmitter<TEvents extends Record<string, unknown[]>> {
  private listeners = new Map<keyof TEvents, Set<(...args: unknown[]) => void>>()

  /**
   * Subscribe to an event
   * Returns an unsubscribe function
   */
  on<K extends keyof TEvents>(
    event: K,
    handler: (...args: TEvents[K]) => void
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }

    const handlers = this.listeners.get(event)!
    handlers.add(handler as (...args: unknown[]) => void)

    return () => {
      this.off(event, handler)
    }
  }

  /**
   * Unsubscribe from an event
   */
  off<K extends keyof TEvents>(
    event: K,
    handler: (...args: TEvents[K]) => void
  ): void {
    const handlers = this.listeners.get(event)
    if (handlers) {
      handlers.delete(handler as (...args: unknown[]) => void)
    }
  }

  /**
   * Emit an event
   */
  emit<K extends keyof TEvents>(event: K, ...args: TEvents[K]): void {
    const handlers = this.listeners.get(event)
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(...args)
        } catch (error) {
          console.error(`Error in event handler for "${String(event)}":`, error)
        }
      }
    }
  }

  /**
   * Subscribe to an event once
   */
  once<K extends keyof TEvents>(
    event: K,
    handler: (...args: TEvents[K]) => void
  ): () => void {
    const wrappedHandler = (...args: TEvents[K]) => {
      this.off(event, wrappedHandler)
      handler(...args)
    }

    return this.on(event, wrappedHandler)
  }

  /**
   * Remove all listeners for an event, or all events
   */
  removeAllListeners(event?: keyof TEvents): void {
    if (event) {
      this.listeners.delete(event)
    } else {
      this.listeners.clear()
    }
  }

  /**
   * Get the number of listeners for an event
   */
  listenerCount(event: keyof TEvents): number {
    return this.listeners.get(event)?.size ?? 0
  }
}
