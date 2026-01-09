/**
 * API Rate Limiter
 * 
 * Implements client-side rate limiting to prevent excessive API calls
 * and protect against accidental DoS scenarios.
 */

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
  onLimitReached?: () => void
}

interface RequestRecord {
  timestamp: number
  count: number
}

class RateLimiter {
  private requests: Map<string, RequestRecord> = new Map()
  private config: RateLimitConfig
  private cleanupInterval?: ReturnType<typeof setInterval>

  constructor(config: RateLimitConfig) {
    this.config = config
    this.startCleanup()
  }

  /**
   * Check if a request is allowed
   */
  isAllowed(key: string = 'default'): boolean {
    const now = Date.now()
    const record = this.requests.get(key)

    if (!record) {
      this.requests.set(key, { timestamp: now, count: 1 })
      return true
    }

    // Reset if window has passed
    if (now - record.timestamp > this.config.windowMs) {
      this.requests.set(key, { timestamp: now, count: 1 })
      return true
    }

    // Check if limit exceeded
    if (record.count >= this.config.maxRequests) {
      this.config.onLimitReached?.()
      return false
    }

    // Increment count
    record.count++
    return true
  }

  /**
   * Get remaining requests in current window
   */
  getRemaining(key: string = 'default'): number {
    const record = this.requests.get(key)
    if (!record) return this.config.maxRequests

    const now = Date.now()
    if (now - record.timestamp > this.config.windowMs) {
      return this.config.maxRequests
    }

    return Math.max(0, this.config.maxRequests - record.count)
  }

  /**
   * Get time until next window reset
   */
  getTimeUntilReset(key: string = 'default'): number {
    const record = this.requests.get(key)
    if (!record) return 0

    const now = Date.now()
    const elapsed = now - record.timestamp
    return Math.max(0, this.config.windowMs - elapsed)
  }

  /**
   * Reset rate limit for a key
   */
  reset(key: string = 'default'): void {
    this.requests.delete(key)
  }

  /**
   * Cleanup old entries periodically
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now()
      for (const [key, record] of this.requests.entries()) {
        if (now - record.timestamp > this.config.windowMs) {
          this.requests.delete(key)
        }
      }
    }, this.config.windowMs)
  }

  /**
   * Stop cleanup interval (useful for testing or cleanup)
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = undefined
    }
  }
}

// Default rate limiter: 100 requests per minute
export const apiRateLimiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 60 * 1000, // 1 minute
  onLimitReached: () => {
    console.warn('API rate limit reached. Please wait before making more requests.')
  },
})

// Strict rate limiter: 10 requests per second
export const strictRateLimiter = new RateLimiter({
  maxRequests: 10,
  windowMs: 1000, // 1 second
  onLimitReached: () => {
    console.warn('Strict rate limit reached. Throttling requests.')
  },
})

/**
 * Rate-limited fetch wrapper
 */
export async function rateLimitedFetch(
  url: string,
  options?: RequestInit,
  limiter: RateLimiter = apiRateLimiter
): Promise<Response> {
  const key = new URL(url).origin

  if (!limiter.isAllowed(key)) {
    const waitTime = limiter.getTimeUntilReset(key)
    throw new Error(
      `Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds before retrying.`
    )
  }

  return fetch(url, options)
}
