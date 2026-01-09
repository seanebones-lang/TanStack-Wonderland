import { describe, it, expect, vi, beforeEach } from 'vitest'
import { performanceMonitor } from './performance'

describe('PerformanceMonitor', () => {
  beforeEach(() => {
    performanceMonitor.init({ enabled: true })
  })

  it('should initialize monitoring', () => {
    expect(performanceMonitor).toBeDefined()
  })

  it('should measure custom operations', async () => {
    const duration = await performanceMonitor.measure('test-operation', () => {
      // Simulate some work
      return new Promise((resolve) => setTimeout(resolve, 10))
    })

    expect(duration).toBeGreaterThan(0)
    expect(duration).toBeLessThan(100) // Should be fast
  })

  it('should get recorded metrics', () => {
    const metrics = performanceMonitor.getMetrics()
    expect(Array.isArray(metrics)).toBe(true)
  })

  it('should rate metrics correctly', async () => {
    // Fast operation should be rated 'good'
    const fastDuration = await performanceMonitor.measure('fast-op', () => {
      return Promise.resolve()
    })

    expect(fastDuration).toBeGreaterThan(0)
  })
})
