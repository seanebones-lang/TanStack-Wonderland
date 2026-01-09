import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { RouterProvider } from '@tanstack/react-router'
import './index.css'
// Don't import i18n config - it's optional and will be loaded by LanguageSelector if needed
import { router } from './router'
import { queryClient } from './queryClient'
import { errorTracker } from './utils/errorTracking'
import { performanceMonitor } from './utils/performance'
import { analytics } from './utils/analytics'
import { sustainabilityTracker } from './utils/sustainability'

// Initialize error tracking and performance monitoring (with error handling)
try {
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
} catch (error) {
  console.warn('Failed to initialize monitoring tools:', error)
}

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

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

try {
  createRoot(rootElement).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </StrictMode>,
  )
} catch (error) {
  console.error('Failed to render app:', error)
  rootElement.innerHTML = `
    <div style="padding: 2rem; text-align: center; font-family: system-ui;">
      <h1>Application Error</h1>
      <p>Failed to initialize the application. Please refresh the page.</p>
      <p style="color: #666; font-size: 0.875rem;">${error instanceof Error ? error.message : 'Unknown error'}</p>
    </div>
  `
}
