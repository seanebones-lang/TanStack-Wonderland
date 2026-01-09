import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000, // 60 seconds
      refetchOnWindowFocus: true, // Sync across tabs
      retry: 1, // Retry failed requests once
    },
  },
})
