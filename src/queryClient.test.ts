import { describe, it, expect } from 'vitest'
import { queryClient } from './queryClient'

describe('QueryClient Configuration', () => {
  it('should have correct default options', () => {
    const defaultOptions = queryClient.getDefaultOptions()

    expect(defaultOptions.queries?.staleTime).toBe(5 * 60 * 1000) // 5 minutes
    expect(defaultOptions.queries?.gcTime).toBe(10 * 60 * 1000) // 10 minutes
    expect(defaultOptions.queries?.refetchOnWindowFocus).toBe(true)
    expect(defaultOptions.queries?.refetchOnReconnect).toBe(true)
    expect(defaultOptions.queries?.refetchOnMount).toBe(false)
  })

  it('should have retry configuration', () => {
    const defaultOptions = queryClient.getDefaultOptions()
    const retryFn = defaultOptions.queries?.retry

    if (typeof retryFn === 'function') {
      expect(retryFn(0)).toBe(true) // Should retry on first failure
      expect(retryFn(2)).toBe(true) // Should retry on second failure
      expect(retryFn(3)).toBe(false) // Should not retry after 3 failures
    }
  })

  it('should have mutation retry configuration', () => {
    const defaultOptions = queryClient.getDefaultOptions()
    expect(defaultOptions.mutations?.retry).toBe(1)
  })
})
