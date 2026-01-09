/**
 * Input Validation Utilities
 * 
 * Provides client-side input validation and sanitization.
 * Note: Server-side validation is still required for security.
 */

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input: string): string {
  const div = document.createElement('div')
  div.textContent = input
  return div.innerHTML
}

/**
 * Validate Pokemon ID
 */
export function isValidPokemonId(id: string | number): boolean {
  const numId = typeof id === 'string' ? parseInt(id, 10) : id
  return !isNaN(numId) && numId > 0 && numId <= 1025 // Max Pokemon ID as of 2025
}

/**
 * Validate Pokemon name
 */
export function isValidPokemonName(name: string): boolean {
  if (!name || typeof name !== 'string') return false
  // Pokemon names are lowercase, alphanumeric with hyphens
  return /^[a-z0-9-]+$/.test(name.toLowerCase()) && name.length <= 50
}

/**
 * Sanitize URL
 */
export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url)
    // Only allow https
    if (parsed.protocol !== 'https:') {
      throw new Error('Only HTTPS URLs are allowed')
    }
    return parsed.toString()
  } catch {
    return ''
  }
}

/**
 * Validate email (if needed for future features)
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Escape HTML to prevent XSS
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

/**
 * Validate and sanitize search query
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query || typeof query !== 'string') return ''
  // Remove potentially dangerous characters
  return query
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, 100) // Limit length
}
