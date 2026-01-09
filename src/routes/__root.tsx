import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { router } from '../router'

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex space-x-8">
                <Link
                  to="/"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
                  activeProps={{
                    className: 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600',
                  }}
                  onMouseEnter={() => router.preloadRoute({ to: '/' })}
                >
                  Home
                </Link>
                <Link
                  to="/pokemon-table"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
                  activeProps={{
                    className: 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600',
                  }}
                  onMouseEnter={() => router.preloadRoute({ to: '/pokemon-table' })}
                >
                  Table
                </Link>
                <Link
                  to="/form"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
                  activeProps={{
                    className: 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600',
                  }}
                  onMouseEnter={() => router.preloadRoute({ to: '/form' })}
                >
                  Form
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-600 dark:text-red-400 mb-4">
          Something went wrong!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn"
        >
          Reload Page
        </button>
      </div>
    </div>
  ),
})
