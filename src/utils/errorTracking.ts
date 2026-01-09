/**
 * Error Tracking Utility
 * 
 * Provides centralized error tracking and logging.
 * Can be integrated with services like Sentry, LogRocket, or custom analytics.
 */

export interface ErrorContext {
  userId?: string
  route?: string
  userAgent?: string
  timestamp?: string
  [key: string]: unknown
}

class ErrorTracker {
  private enabled = true
  private context: ErrorContext = {}

  /**
   * Initialize error tracking
   */
  init(config?: { enabled?: boolean; context?: ErrorContext }) {
    this.enabled = config?.enabled ?? true
    this.context = { ...this.context, ...config?.context }

    // Set up global error handlers
    if (this.enabled) {
      window.addEventListener('error', this.handleError.bind(this))
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this))
    }
  }

  /**
   * Set additional context for error tracking
   */
  setContext(context: ErrorContext) {
    this.context = { ...this.context, ...context }
  }

  /**
   * Track an error
   */
  trackError(error: Error, context?: ErrorContext) {
    if (!this.enabled) return

    const errorData = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...this.context,
      ...context,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('Error tracked:', errorData)
    }

    // In production, send to error tracking service
    // Example: Sentry.captureException(error, { extra: errorData })
    // Example: fetch('/api/errors', { method: 'POST', body: JSON.stringify(errorData) })
  }

  /**
   * Track a warning
   */
  trackWarning(message: string, context?: ErrorContext) {
    if (!this.enabled) return

    const warningData = {
      message,
      ...this.context,
      ...context,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    }

    if (import.meta.env.DEV) {
      console.warn('Warning tracked:', warningData)
    }

    // Send to tracking service
  }

  /**
   * Handle global errors
   */
  private handleError(event: ErrorEvent) {
    const error = event.error || new Error(event.message)
    this.trackError(error, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    })
  }

  /**
   * Handle unhandled promise rejections
   */
  private handleUnhandledRejection(event: PromiseRejectionEvent) {
    const error = event.reason instanceof Error
      ? event.reason
      : new Error(String(event.reason))
    
    this.trackError(error, {
      type: 'unhandledRejection',
    })
  }
}

export const errorTracker = new ErrorTracker()

// Initialize on module load
if (typeof window !== 'undefined') {
  errorTracker.init({
    enabled: !import.meta.env.DEV, // Disable in dev, enable in prod
    context: {
      appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
    },
  })
}
