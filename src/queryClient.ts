import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh longer
      gcTime: 10 * 60 * 1000, // 10 minutes - cache garbage collection (formerly cacheTime)
      refetchOnWindowFocus: true, // Sync across tabs
      refetchOnReconnect: true, // Refetch when network reconnects
      refetchOnMount: false, // Don't refetch if data is fresh
      retry: (failureCount) => {
        // Retry up to 3 times with exponential backoff
        if (failureCount < 3) {
          return true
        }
        return false
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff, max 30s
      // Keep previous data while fetching new data (stale-while-revalidate pattern)
      placeholderData: (previousData: unknown) => previousData,
    },
    mutations: {
      retry: 1, // Retry mutations once
      retryDelay: 1000,
    },
  },
})
