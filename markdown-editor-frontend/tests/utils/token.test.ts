import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { token } from '@/utils/token'

const TEST_KEY = 'token'

describe('token utility', () => {
  beforeEach(() => {
    localStorage.removeItem(TEST_KEY)
  })

  afterEach(() => {
    localStorage.removeItem(TEST_KEY)
  })

  it('get() returns null when no token exists', () => {
    expect(token.get()).toBeNull()
  })

  it('set() stores token in localStorage', () => {
    token.set('test-token-123')
    expect(localStorage.getItem(TEST_KEY)).toBe('test-token-123')
  })

  it('get() returns stored token', () => {
    localStorage.setItem(TEST_KEY, 'my-token')
    expect(token.get()).toBe('my-token')
  })

  it('remove() clears token from localStorage', () => {
    localStorage.setItem(TEST_KEY, 'to-be-removed')
    token.remove()
    expect(localStorage.getItem(TEST_KEY)).toBeNull()
  })

  it('get() returns null after remove()', () => {
    localStorage.setItem(TEST_KEY, 'temp-token')
    token.remove()
    expect(token.get()).toBeNull()
  })
})