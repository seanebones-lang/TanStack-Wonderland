/**
 * Analytics Utility
 * 
 * Provides analytics tracking for user behavior, conversions, and performance.
 * Can be integrated with Google Analytics, Mixpanel, Amplitude, etc.
 */

export interface AnalyticsEvent {
  name: string
  category: string
  action?: string
  label?: string
  value?: number
  [key: string]: unknown
}

class Analytics {
  private enabled = true
  private userId: string | null = null

  /**
   * Initialize analytics
   */
  init(config?: { enabled?: boolean; userId?: string }) {
    this.enabled = config?.enabled ?? true
    this.userId = config?.userId ?? null

    if (!this.enabled || typeof window === 'undefined') return

    // Track page view
    this.trackPageView(window.location.pathname)

    // Track performance metrics
    if ('performance' in window) {
      window.addEventListener('load', () => {
        this.trackPerformance()
      })
    }
  }

  /**
   * Track a custom event
   */
  trackEvent(event: AnalyticsEvent): void {
    if (!this.enabled) return

    const eventData = {
      ...event,
      userId: this.userId,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    }

    // Log in development
    if (import.meta.env.DEV) {
      console.log('[Analytics]', eventData)
    }

    // Send to analytics service
    // Example: gtag('event', event.name, { ...eventData })
    // Example: mixpanel.track(event.name, eventData)
    // Example: amplitude.track(event.name, eventData)
  }

  /**
   * Track page view
   */
  trackPageView(path: string): void {
    this.trackEvent({
      name: 'page_view',
      category: 'navigation',
      action: 'view',
      label: path,
    })
  }

  /**
   * Track user interaction
   */
  trackInteraction(element: string, action: string): void {
    this.trackEvent({
      name: 'interaction',
      category: 'user',
      action,
      label: element,
    })
  }

  /**
   * Track conversion
   */
  trackConversion(conversionName: string, value?: number): void {
    this.trackEvent({
      name: 'conversion',
      category: 'business',
      action: conversionName,
      value,
    })
  }

  /**
   * Track error
   */
  trackError(error: Error, context?: Record<string, unknown>): void {
    this.trackEvent({
      name: 'error',
      category: 'exception',
      action: error.name,
      label: error.message,
      ...context,
    })
  }

  /**
   * Track performance metrics
   */
  private trackPerformance(): void {
    if (!('performance' in window)) return

    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigation) {
        this.trackEvent({
          name: 'performance',
          category: 'performance',
          action: 'page_load',
          value: navigation.loadEventEnd - navigation.fetchStart,
          label: 'page_load_time',
        })
      }
    } catch (e) {
      // Performance API not available
    }
  }

  /**
   * Set user ID
   */
  setUserId(userId: string): void {
    this.userId = userId
  }

  /**
   * Identify user
   */
  identify(userId: string, traits?: Record<string, unknown>): void {
    this.setUserId(userId)
    this.trackEvent({
      name: 'identify',
      category: 'user',
      action: 'identify',
      label: userId,
      ...traits,
    })
  }
}

export const analytics = new Analytics()

// Initialize on module load
if (typeof window !== 'undefined') {
  analytics.init({
    enabled: !import.meta.env.DEV,
  })
}
