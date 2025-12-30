import { describe, it, expect } from 'vitest'
import {
  readAsDataURL,
  readAsText,
  readAsArrayBuffer,
  readAsJSON,
  readSlice,
} from '../../../src/utils/reader'

function createMockFile(content: string, name: string, type: string): File {
  const blob = new Blob([content], { type })
  return new File([blob], name, { type })
}

describe('readAsDataURL', () => {
  it('should read file as data URL', async () => {
    const file = createMockFile('test content', 'test.txt', 'text/plain')
    const result = await readAsDataURL(file)
    expect(result).toContain('data:')
    expect(result).toContain('base64')
  })
})

describe('readAsText', () => {
  it('should read file as text', async () => {
    const file = createMockFile('hello world', 'test.txt', 'text/plain')
    const result = await readAsText(file)
    expect(result).toBe('hello world')
  })

  it('should read file with specific encoding', async () => {
    const file = createMockFile('hello', 'test.txt', 'text/plain')
    const result = await readAsText(file, 'utf-8')
    expect(result).toBe('hello')
  })
})

describe('readAsArrayBuffer', () => {
  it('should read file as ArrayBuffer', async () => {
    const file = createMockFile('test', 'test.txt', 'text/plain')
    const result = await readAsArrayBuffer(file)
    expect(result).toBeInstanceOf(ArrayBuffer)
    expect(result.byteLength).toBe(4)
  })
})

describe('readAsJSON', () => {
  it('should read and parse JSON file', async () => {
    const jsonContent = JSON.stringify({ name: 'test', value: 42 })
    const file = createMockFile(jsonContent, 'data.json', 'application/json')
    const result = await readAsJSON<{ name: string; value: number }>(file)
    expect(result).toEqual({ name: 'test', value: 42 })
  })

  it('should throw on invalid JSON', async () => {
    const file = createMockFile('not json', 'data.json', 'application/json')
    await expect(readAsJSON(file)).rejects.toThrow()
  })
})

describe('readSlice', () => {
  it('should read a slice of the file', async () => {
    const content = '0123456789'
    const file = createMockFile(content, 'test.txt', 'text/plain')
    const result = await readSlice(file, 2, 6)
    const text = new TextDecoder().decode(result)
    expect(text).toBe('2345')
  })
})
