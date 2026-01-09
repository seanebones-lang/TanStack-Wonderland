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
console.log('Router:', router)
console.log('QueryClient:', queryClient)

try {
  console.log('Creating root...')
  const root = createRoot(rootElement)
  
  console.log('Rendering app...')
  
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider 
          router={router}
          defaultErrorComponent={({ error }) => (
            <div style={{ padding: '2rem', textAlign: 'center', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <h1 style={{ color: '#dc2626', marginBottom: '1rem' }}>Router Error</h1>
              <p>{error?.message || 'Unknown router error'}</p>
              <button 
                onClick={() => window.location.reload()} 
                style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}
              >
                Reload Page
              </button>
            </div>
          )}
        />
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </StrictMode>,
  )
  
  console.log('App rendered successfully!')
  
  // Verify the root element has content after a short delay
  setTimeout(() => {
    if (rootElement.children.length === 0) {
      console.error('Root element is empty after render!')
      rootElement.innerHTML = `
        <div style="padding: 2rem; text-align: center; font-family: system-ui; background: white; min-height: 100vh; display: flex; align-items: center; justify-content: center; flex-direction: column;">
          <h1 style="color: #dc2626; margin-bottom: 1rem;">Render Issue Detected</h1>
          <p>The app rendered but no content appeared. Check console for errors.</p>
          <p style="color: #666; font-size: 0.875rem; margin-top: 0.5rem;">Open browser console (F12) to see detailed error messages.</p>
          <button onclick="window.location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.25rem; cursor: pointer;">Reload Page</button>
        </div>
      `
    } else {
      console.log('Root element has content:', rootElement.children.length, 'children')
    }
  }, 2000)
} catch (error) {
  console.error('Failed to render app:', error)
  console.error('Error stack:', error instanceof Error ? error.stack : 'No stack')
  rootElement.innerHTML = `
    <div style="padding: 2rem; text-align: center; font-family: system-ui; background: white; min-height: 100vh;">
      <h1 style="color: #dc2626;">Application Error</h1>
      <p>Failed to initialize the application. Please check the console for details.</p>
      <p style="color: #666; font-size: 0.875rem; margin-top: 1rem;">${error instanceof Error ? error.message : 'Unknown error'}</p>
      <pre style="text-align: left; background: #f3f4f6; padding: 1rem; border-radius: 0.25rem; margin-top: 1rem; overflow: auto;">${error instanceof Error ? error.stack : String(error)}</pre>
      <button onclick="window.location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.25rem; cursor: pointer;">Reload Page</button>
    </div>
  `
}
