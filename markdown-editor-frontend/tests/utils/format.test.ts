import { describe, it, expect } from 'vitest'
import { format } from '@/utils/format'
import dayjs from 'dayjs'

describe('format utility', () => {
  const testDate = '2024-06-15T14:30:00.000Z'

  it('date() formats date with default format', () => {
    const result = format.date(testDate)
    expect(result).toMatch(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}/)
  })

  it('date() formats date with custom format', () => {
    const result = format.date(testDate, 'YYYY-MM-DD')
    expect(result).toBe('2024-06-15')
  })

  it('date() formats date with different format patterns', () => {
    expect(format.date(testDate, 'MM/DD/YYYY')).toBe('06/15/2024')
    expect(format.date(testDate, 'DD-MMM-YYYY')).toBe('15-Jun-2024')
  })

  it('relative() returns relative time string', () => {
    const result = format.relative(testDate)
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('relative() works with Date object', () => {
    const dateObj = new Date(testDate)
    const result = format.relative(dateObj)
    expect(typeof result).toBe('string')
  })

  it('relative() works with string date', () => {
    const result = format.relative('2024-01-01')
    expect(typeof result).toBe('string')
  })
})