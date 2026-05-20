import { describe, it, expect } from 'vitest'
import { validator } from '@/utils/validator'

describe('validator utility', () => {
  describe('username validation', () => {
    it('returns invalid for empty username', () => {
      const result = validator.username('')
      expect(result.valid).toBe(false)
      expect(result.message).toBe('Username is required')
    })

    it('returns invalid for username too short', () => {
      const result = validator.username('ab')
      expect(result.valid).toBe(false)
      expect(result.message).toBe('Username must be at least 3 characters')
    })

    it('returns invalid for username too long', () => {
      const result = validator.username('a'.repeat(21))
      expect(result.valid).toBe(false)
      expect(result.message).toBe('Username must be at most 20 characters')
    })

    it('returns invalid for username with special characters', () => {
      const result = validator.username('user@name')
      expect(result.valid).toBe(false)
      expect(result.message).toBe('Username can only contain letters, numbers, and underscores')
    })

    it('returns valid for correct username', () => {
      const result = validator.username('john_doe')
      expect(result.valid).toBe(true)
      expect(result.message).toBe('')
    })

    it('returns valid for alphanumeric username', () => {
      const result = validator.username('User123')
      expect(result.valid).toBe(true)
    })
  })

  describe('password validation', () => {
    it('returns invalid for empty password', () => {
      const result = validator.password('')
      expect(result.valid).toBe(false)
      expect(result.strength).toBe(0)
    })

    it('returns invalid for password too short', () => {
      const result = validator.password('short')
      expect(result.valid).toBe(false)
      expect(result.strength).toBe(0)
    })

    it('returns weak password with low strength', () => {
      const result = validator.password('weakpass')
      expect(result.valid).toBe(true)
      expect(result.strength).toBeGreaterThan(0)
      expect(result.strength).toBeLessThanOrEqual(4)
    })

    it('returns stronger password with more criteria', () => {
      const weak = validator.password('password')
      const stronger = validator.password('Password1')
      expect(stronger.strength).toBeGreaterThan(weak.strength)
    })

    it('returns strength of 0-4', () => {
      const result = validator.password('StrongPass123')
      expect(result.strength).toBeGreaterThanOrEqual(0)
      expect(result.strength).toBeLessThanOrEqual(4)
    })

    it('handles very long passwords', () => {
      const result = validator.password('a'.repeat(100))
      expect(result.valid).toBe(true)
      expect(result.strength).toBeGreaterThan(0)
    })

    it('returns password strength correctly scaled (0-4)', () => {
      // Empty - 0
      expect(validator.password('').strength).toBe(0)
      // Short - 0
      expect(validator.password('abc').strength).toBe(0)
      // Just lowercase (length 8+) - at least 1
      const lowerOnly = validator.password('password')
      expect(lowerOnly.strength).toBeGreaterThanOrEqual(1)
      expect(lowerOnly.strength).toBeLessThanOrEqual(4)
      // Mix of length + lowercase + uppercase - higher
      const mixed = validator.password('Password')
      expect(mixed.strength).toBeGreaterThan(lowerOnly.strength)
      // With numbers - even higher
      const withNumbers = validator.password('Password1')
      expect(withNumbers.strength).toBeGreaterThan(mixed.strength)
      // With special - max 4
      const withSpecial = validator.password('Password1!')
      expect(withSpecial.strength).toBeLessThanOrEqual(4)
    })
  })
})