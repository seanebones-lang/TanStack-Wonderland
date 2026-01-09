import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { RateLimiter, apiRateLimiter, rateLimitedFetch } from './rateLimiter'

describe('RateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('allows requests within limit', () => {
    const limiter = new RateLimiter({ maxRequests: 5, windowMs: 1000 })

    expect(limiter.isAllowed()).toBe(true)
    expect(limiter.isAllowed()).toBe(true)
    expect(limiter.isAllowed()).toBe(true)
    expect(limiter.isAllowed()).toBe(true)
    expect(limiter.isAllowed()).toBe(true)
  })

  it('blocks requests exceeding limit', () => {
    const onLimitReached = vi.fn()
    const limiter = new RateLimiter({
      maxRequests: 2,
      windowMs: 1000,
      onLimitReached,
    })

    expect(limiter.isAllowed()).toBe(true)
    expect(limiter.isAllowed()).toBe(true)
    expect(limiter.isAllowed()).toBe(false)
    expect(onLimitReached).toHaveBeenCalled()
  })

  it('resets after window expires', () => {
    const limiter = new RateLimiter({ maxRequests: 2, windowMs: 1000 })

    expect(limiter.isAllowed()).toBe(true)
    expect(limiter.isAllowed()).toBe(true)
    expect(limiter.isAllowed()).toBe(false)

    vi.advanceTimersByTime(1001)

    expect(limiter.isAllowed()).toBe(true)
  })

  it('tracks remaining requests', () => {
    const limiter = new RateLimiter({ maxRequests: 5, windowMs: 1000 })

    expect(limiter.getRemaining()).toBe(4)
    limiter.isAllowed()
    expect(limiter.getRemaining()).toBe(3)
  })

  it('calculates time until reset', () => {
    const limiter = new RateLimiter({ maxRequests: 5, windowMs: 1000 })

    limiter.isAllowed()
    const timeUntilReset = limiter.getTimeUntilReset()

    expect(timeUntilReset).toBeGreaterThan(0)
    expect(timeUntilReset).toBeLessThanOrEqual(1000)
  })

  it('resets manually', () => {
    const limiter = new RateLimiter({ maxRequests: 2, windowMs: 1000 })

    limiter.isAllowed()
    limiter.isAllowed()
    expect(limiter.isAllowed()).toBe(false)

    limiter.reset()
    expect(limiter.isAllowed()).toBe(true)
  })

  it('rateLimitedFetch throws on rate limit', async () => {
    const limiter = new RateLimiter({ maxRequests: 1, windowMs: 1000 })

    global.fetch = vi.fn().mockResolvedValue({ ok: true })

    await rateLimitedFetch('https://api.example.com/data', {}, limiter)
    
    await expect(
      rateLimitedFetch('https://api.example.com/data', {}, limiter)
    ).rejects.toThrow('Rate limit exceeded')
  })
})
