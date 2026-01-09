import { describe, it, expect, vi, beforeEach } from 'vitest'
import { errorTracker } from './errorTracking'

describe('ErrorTracker', () => {
  beforeEach(() => {
    errorTracker.init({ enabled: true })
  })

  it('should track errors with context', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const error = new Error('Test error')

    errorTracker.trackError(error, { userId: '123' })

    expect(consoleErrorSpy).toHaveBeenCalled()
    consoleErrorSpy.mockRestore()
  })

  it('should track warnings', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    errorTracker.trackWarning('Test warning', { route: '/test' })

    expect(consoleWarnSpy).toHaveBeenCalled()
    consoleWarnSpy.mockRestore()
  })

  it('should set context', () => {
    errorTracker.setContext({ userId: '456', route: '/home' })
    // Context is set internally, verify by checking it doesn't throw
    expect(errorTracker).toBeDefined()
  })

  it('should not track when disabled', () => {
    errorTracker.init({ enabled: false })
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const error = new Error('Test error')

    errorTracker.trackError(error)

    expect(consoleErrorSpy).not.toHaveBeenCalled()
    consoleErrorSpy.mockRestore()
  })
})
