import { describe, it, expect } from 'vitest'
import {
  sanitizeString,
  isValidPokemonId,
  isValidPokemonName,
  sanitizeUrl,
  isValidEmail,
  escapeHtml,
  sanitizeSearchQuery,
} from './inputValidation'

describe('Input Validation', () => {
  describe('sanitizeString', () => {
    it('removes HTML tags', () => {
      expect(sanitizeString('<script>alert("xss")</script>')).toBe('alert("xss")')
    })

    it('preserves plain text', () => {
      expect(sanitizeString('Hello World')).toBe('Hello World')
    })
  })

  describe('isValidPokemonId', () => {
    it('validates valid Pokemon IDs', () => {
      expect(isValidPokemonId(1)).toBe(true)
      expect(isValidPokemonId(25)).toBe(true)
      expect(isValidPokemonId('25')).toBe(true)
      expect(isValidPokemonId(1025)).toBe(true)
    })

    it('rejects invalid Pokemon IDs', () => {
      expect(isValidPokemonId(0)).toBe(false)
      expect(isValidPokemonId(-1)).toBe(false)
      expect(isValidPokemonId(1026)).toBe(false)
      expect(isValidPokemonId('invalid')).toBe(false)
    })
  })

  describe('isValidPokemonName', () => {
    it('validates valid Pokemon names', () => {
      expect(isValidPokemonName('pikachu')).toBe(true)
      expect(isValidPokemonName('charizard')).toBe(true)
      expect(isValidPokemonName('mr-mime')).toBe(true)
    })

    it('rejects invalid Pokemon names', () => {
      expect(isValidPokemonName('')).toBe(false)
      expect(isValidPokemonName('Pikachu')).toBe(false) // Uppercase
      expect(isValidPokemonName('pikachu!')).toBe(false) // Special chars
      expect(isValidPokemonName('a'.repeat(51))).toBe(false) // Too long
    })
  })

  describe('sanitizeUrl', () => {
    it('allows HTTPS URLs', () => {
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com/')
    })

    it('rejects HTTP URLs', () => {
      expect(sanitizeUrl('http://example.com')).toBe('')
    })

    it('rejects invalid URLs', () => {
      expect(sanitizeUrl('not-a-url')).toBe('')
    })
  })

  describe('isValidEmail', () => {
    it('validates valid emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
    })

    it('rejects invalid emails', () => {
      expect(isValidEmail('invalid')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
    })
  })

  describe('escapeHtml', () => {
    it('escapes HTML characters', () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
      )
    })
  })

  describe('sanitizeSearchQuery', () => {
    it('removes dangerous characters', () => {
      expect(sanitizeSearchQuery('<script>')).toBe('script')
      expect(sanitizeSearchQuery('pikachu')).toBe('pikachu')
    })

    it('limits length', () => {
      const longQuery = 'a'.repeat(200)
      expect(sanitizeSearchQuery(longQuery).length).toBeLessThanOrEqual(100)
    })

    it('trims whitespace', () => {
      expect(sanitizeSearchQuery('  pikachu  ')).toBe('pikachu')
    })
  })
})
