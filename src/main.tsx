import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { RouterProvider } from '@tanstack/react-router'
import './index.css'
import './i18n/config'
import { router } from './router'
import { queryClient } from './queryClient'
import { errorTracker } from './utils/errorTracking'
import { performanceMonitor } from './utils/performance'
import { analytics } from './utils/analytics'
import { sustainabilityTracker } from './utils/sustainability'

// Initialize error tracking and performance monitoring
errorTracker.init({
  enabled: !import.meta.env.DEV,
  context: {
    appVersion: '1.0.0',
  },
})

performanceMonitor.init({
  enabled: !import.meta.env.DEV,
})

// Initialize analytics
analytics.init({
  enabled: !import.meta.env.DEV,
})

// Track initial page load for sustainability
sustainabilityTracker.trackPageLoad()

// Register Service Worker for PWA
if ('serviceWorker' in navigator && !import.meta.env.DEV) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered:', registration.scope)
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error)
      })
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </StrictMode>,
)
