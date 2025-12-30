import { describe, it, expect } from 'vitest'
import { generateId } from '../../../src/utils/id'

describe('generateId', () => {
  it('should generate a unique ID', () => {
    const id = generateId()
    expect(id).toBeDefined()
    expect(typeof id).toBe('string')
  })

  it('should start with "file_"', () => {
    const id = generateId()
    expect(id.startsWith('file_')).toBe(true)
  })

  it('should generate different IDs each time', () => {
    const ids = new Set<string>()
    for (let i = 0; i < 100; i++) {
      ids.add(generateId())
    }
    expect(ids.size).toBe(100)
  })

  it('should have format file_[timestamp]_[random]', () => {
    const id = generateId()
    const parts = id.split('_')
    expect(parts.length).toBe(3)
    expect(parts[0]).toBe('file')
    expect(parts[1]?.length).toBeGreaterThan(0)
    expect(parts[2]?.length).toBeGreaterThan(0)
  })
})
