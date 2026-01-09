/**
 * Performance Monitoring Utility
 * 
 * Tracks Core Web Vitals and custom performance metrics.
 * Can be integrated with analytics services like Google Analytics, Vercel Analytics, etc.
 */

export interface PerformanceMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta?: number
  id: string
  navigationType?: string
}

class PerformanceMonitor {
  private enabled = true
  private metrics: PerformanceMetric[] = []

  /**
   * Initialize performance monitoring
   */
  init(config?: { enabled?: boolean }) {
    this.enabled = config?.enabled ?? true

    if (!this.enabled || typeof window === 'undefined') return

    // Track Core Web Vitals
    this.trackLCP()
    this.trackFID()
    this.trackCLS()
    this.trackFCP()
    this.trackTTFB()

    // Track custom metrics
    this.trackPageLoad()
  }

  /**
   * Track Largest Contentful Paint (LCP)
   */
  private trackLCP() {
    if (!('PerformanceObserver' in window)) return

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
          renderTime?: number
          loadTime?: number
        }

        const metric: PerformanceMetric = {
          name: 'LCP',
          value: lastEntry.renderTime || lastEntry.loadTime || 0,
          rating: this.getRating('LCP', lastEntry.renderTime || lastEntry.loadTime || 0),
          id: lastEntry.name,
        }

        this.recordMetric(metric)
      })

      observer.observe({ entryTypes: ['largest-contentful-paint'] })
    } catch (e) {
      // PerformanceObserver not supported
    }
  }

  /**
   * Track First Input Delay (FID)
   */
  private trackFID() {
    if (!('PerformanceObserver' in window)) return

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          const fidEntry = entry as PerformanceEventTiming
          const metric: PerformanceMetric = {
            name: 'FID',
            value: fidEntry.processingStart - fidEntry.startTime,
            rating: this.getRating('FID', fidEntry.processingStart - fidEntry.startTime),
            id: fidEntry.name,
          }

          this.recordMetric(metric)
        })
      })

      observer.observe({ entryTypes: ['first-input'] })
    } catch (e) {
      // PerformanceObserver not supported
    }
  }

  /**
   * Track Cumulative Layout Shift (CLS)
   */
  private trackCLS() {
    if (!('PerformanceObserver' in window)) return

    try {
      let clsValue = 0
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        })

        const metric: PerformanceMetric = {
          name: 'CLS',
          value: clsValue,
          rating: this.getRating('CLS', clsValue),
          id: 'cls',
        }

        this.recordMetric(metric)
      })

      observer.observe({ entryTypes: ['layout-shift'] })
    } catch (e) {
      // PerformanceObserver not supported
    }
  }

  /**
   * Track First Contentful Paint (FCP)
   */
  private trackFCP() {
    if (!('PerformanceObserver' in window)) return

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          const metric: PerformanceMetric = {
            name: 'FCP',
            value: entry.startTime,
            rating: this.getRating('FCP', entry.startTime),
            id: entry.name,
          }

          this.recordMetric(metric)
        })
      })

      observer.observe({ entryTypes: ['paint'] })
    } catch (e) {
      // PerformanceObserver not supported
    }
  }

  /**
   * Track Time to First Byte (TTFB)
   */
  private trackTTFB() {
    if (!('PerformanceNavigationTiming' in window)) return

    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const ttfb = navigation.responseStart - navigation.requestStart

      const metric: PerformanceMetric = {
        name: 'TTFB',
        value: ttfb,
        rating: this.getRating('TTFB', ttfb),
        id: 'ttfb',
        navigationType: navigation.type,
      }

      this.recordMetric(metric)
    } catch (e) {
      // Not supported
    }
  }

  /**
   * Track page load time
   */
  private trackPageLoad() {
    if (typeof window === 'undefined') return

    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.fetchStart

        const metric: PerformanceMetric = {
          name: 'PageLoad',
          value: loadTime,
          rating: this.getRating('PageLoad', loadTime),
          id: 'page-load',
        }

        this.recordMetric(metric)
      }
    })
  }

  /**
   * Get rating for a metric
   */
  private getRating(metricName: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds: Record<string, { good: number; poor: number }> = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      FCP: { good: 1800, poor: 3000 },
      TTFB: { good: 800, poor: 1800 },
      PageLoad: { good: 3000, poor: 5000 },
    }

    const threshold = thresholds[metricName]
    if (!threshold) return 'good'

    if (value <= threshold.good) return 'good'
    if (value <= threshold.poor) return 'needs-improvement'
    return 'poor'
  }

  /**
   * Record a performance metric
   */
  private recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric)

    if (import.meta.env.DEV) {
      console.log(`[Performance] ${metric.name}: ${metric.value.toFixed(2)}ms (${metric.rating})`)
    }

    // Send to analytics service
    // Example: gtag('event', metric.name, { value: metric.value, rating: metric.rating })
    // Example: fetch('/api/metrics', { method: 'POST', body: JSON.stringify(metric) })
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics]
  }

  /**
   * Measure a custom operation
   */
  measure(name: string, fn: () => void | Promise<void>): Promise<number> {
    const start = performance.now()
    const result = fn()

    if (result instanceof Promise) {
      return result.then(() => {
        const duration = performance.now() - start
        this.recordMetric({
          name,
          value: duration,
          rating: duration < 100 ? 'good' : duration < 300 ? 'needs-improvement' : 'poor',
          id: `${name}-${Date.now()}`,
        })
        return duration
      })
    }

    const duration = performance.now() - start
    this.recordMetric({
      name,
      value: duration,
      rating: duration < 100 ? 'good' : duration < 300 ? 'needs-improvement' : 'poor',
      id: `${name}-${Date.now()}`,
    })
    return Promise.resolve(duration)
  }
}

export const performanceMonitor = new PerformanceMonitor()

// Initialize on module load
if (typeof window !== 'undefined') {
  performanceMonitor.init({
    enabled: !import.meta.env.DEV, // Disable in dev, enable in prod
  })
}
