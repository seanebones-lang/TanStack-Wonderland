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
// Wrap each initialization separately to prevent one failure from blocking others
try {
  errorTracker.init({
    enabled: !import.meta.env.DEV,
    context: {
      appVersion: '1.0.0',
    },
  })
} catch (error) {
  console.warn('Failed to initialize error tracker:', error)
}

try {
  performanceMonitor.init({
    enabled: !import.meta.env.DEV,
  })
} catch (error) {
  console.warn('Failed to initialize performance monitor:', error)
}

try {
  analytics.init({
    enabled: !import.meta.env.DEV,
  })
} catch (error) {
  console.warn('Failed to initialize analytics:', error)
}

try {
  sustainabilityTracker.trackPageLoad()
} catch (error) {
  console.warn('Failed to track page load:', error)
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

// Add global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error)
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
})

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

console.log('Starting app initialization...')

try {
  console.log('Creating root...')
  const root = createRoot(rootElement)
  
  console.log('Rendering app...')
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </StrictMode>,
  )
  
  console.log('App rendered successfully!')
} catch (error) {
  console.error('Failed to render app:', error)
  rootElement.innerHTML = `
    <div style="padding: 2rem; text-align: center; font-family: system-ui; background: white; min-height: 100vh;">
      <h1 style="color: #dc2626;">Application Error</h1>
      <p>Failed to initialize the application. Please check the console for details.</p>
      <p style="color: #666; font-size: 0.875rem; margin-top: 1rem;">${error instanceof Error ? error.message : 'Unknown error'}</p>
      <button onclick="window.location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.25rem; cursor: pointer;">Reload Page</button>
    </div>
  `
}
