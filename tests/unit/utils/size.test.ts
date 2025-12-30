import { describe, it, expect } from 'vitest'
import {
  formatFileSize,
  parseFileSize,
  formatSpeed,
  formatTime,
} from '../../../src/utils/size'

describe('formatFileSize', () => {
  it('should format bytes correctly', () => {
    expect(formatFileSize(0)).toBe('0 Bytes')
    expect(formatFileSize(500)).toBe('500 Bytes')
    expect(formatFileSize(1023)).toBe('1023 Bytes')
  })

  it('should format KB correctly', () => {
    expect(formatFileSize(1024)).toBe('1.00 KB')
    expect(formatFileSize(1536)).toBe('1.50 KB')
    expect(formatFileSize(10240)).toBe('10.0 KB')
    expect(formatFileSize(102400)).toBe('100 KB')
  })

  it('should format MB correctly', () => {
    expect(formatFileSize(1024 * 1024)).toBe('1.00 MB')
    expect(formatFileSize(1.5 * 1024 * 1024)).toBe('1.50 MB')
    expect(formatFileSize(100 * 1024 * 1024)).toBe('100 MB')
  })

  it('should format GB correctly', () => {
    expect(formatFileSize(1024 * 1024 * 1024)).toBe('1.00 GB')
    expect(formatFileSize(2.5 * 1024 * 1024 * 1024)).toBe('2.50 GB')
  })

  it('should format TB correctly', () => {
    expect(formatFileSize(1024 * 1024 * 1024 * 1024)).toBe('1.00 TB')
  })

  it('should handle negative values', () => {
    expect(formatFileSize(-1024)).toBe('-1.00 KB')
  })
})

describe('parseFileSize', () => {
  it('should parse bytes', () => {
    expect(parseFileSize('100')).toBe(100)
    expect(parseFileSize('100 bytes')).toBe(100)
    expect(parseFileSize('100 Bytes')).toBe(100)
    expect(parseFileSize('100B')).toBe(100)
  })

  it('should parse KB', () => {
    expect(parseFileSize('1 KB')).toBe(1024)
    expect(parseFileSize('1.5KB')).toBe(1536)
    expect(parseFileSize('10 K')).toBe(10240)
  })

  it('should parse MB', () => {
    expect(parseFileSize('1 MB')).toBe(1024 * 1024)
    expect(parseFileSize('10MB')).toBe(10 * 1024 * 1024)
    expect(parseFileSize('1.5 M')).toBe(1.5 * 1024 * 1024)
  })

  it('should parse GB', () => {
    expect(parseFileSize('1 GB')).toBe(1024 * 1024 * 1024)
    expect(parseFileSize('2.5GB')).toBe(2.5 * 1024 * 1024 * 1024)
  })

  it('should parse TB', () => {
    expect(parseFileSize('1 TB')).toBe(1024 * 1024 * 1024 * 1024)
  })

  it('should be case-insensitive', () => {
    expect(parseFileSize('1 mb')).toBe(1024 * 1024)
    expect(parseFileSize('1 MB')).toBe(1024 * 1024)
  })

  it('should handle empty string', () => {
    expect(parseFileSize('')).toBe(0)
  })

  it('should return NaN for invalid input', () => {
    expect(parseFileSize('invalid')).toBeNaN()
    expect(parseFileSize('abc MB')).toBeNaN()
  })
})

describe('formatSpeed', () => {
  it('should format speed correctly', () => {
    expect(formatSpeed(1024)).toBe('1.00 KB/s')
    expect(formatSpeed(1024 * 1024)).toBe('1.00 MB/s')
    expect(formatSpeed(500)).toBe('500 Bytes/s')
  })
})

describe('formatTime', () => {
  it('should format seconds correctly', () => {
    expect(formatTime(45)).toBe('0:45')
    expect(formatTime(0)).toBe('0:00')
  })

  it('should format minutes and seconds', () => {
    expect(formatTime(65)).toBe('1:05')
    expect(formatTime(125)).toBe('2:05')
    expect(formatTime(3599)).toBe('59:59')
  })

  it('should format hours, minutes and seconds', () => {
    expect(formatTime(3600)).toBe('1:00:00')
    expect(formatTime(3665)).toBe('1:01:05')
    expect(formatTime(7325)).toBe('2:02:05')
  })

  it('should handle invalid values', () => {
    expect(formatTime(-1)).toBe('--:--')
    expect(formatTime(Infinity)).toBe('--:--')
  })
})
