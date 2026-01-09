import { createRootRoute, Link, Outlet, useRouterState } from '@tanstack/react-router'
import { router } from '../router'
import { useState, useEffect } from 'react'

function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [currentPath])

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/pokemon-table', label: 'Table' },
    { to: '/form', label: 'Form' },
  ]

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link
              to="/"
              className="text-xl font-bold text-gray-900 dark:text-gray-100"
              aria-label="TanStack Wonderland Home"
            >
              TanStack Wonderland
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                activeProps={{
                  className: 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600',
                }}
                onMouseEnter={() => router.preloadRoute({ to: link.to })}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <span className="text-2xl">{isMobileMenuOpen ? '✕' : '☰'}</span>
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          id="mobile-menu"
          className={`md:hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen
              ? 'max-h-96 opacity-100'
              : 'max-h-0 opacity-0 overflow-hidden'
          }`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="block px-3 py-2 text-base font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                activeProps={{
                  className: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
                }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}

function Breadcrumbs() {
  const routerState = useRouterState()
  const matches = routerState.matches

  if (matches.length <= 1) return null

  const breadcrumbLabels: Record<string, string> = {
    '/': 'Home',
    '/pokemon-table': 'Pokemon Table',
    '/form': 'Team Builder',
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
        {matches
          .filter((match) => match.routeId !== '__root__')
          .map((match, index, array) => {
            const isLast = index === array.length - 1
            const label = breadcrumbLabels[match.pathname] || match.routeId

            return (
              <li key={match.routeId} className="flex items-center">
                {index > 0 && <span className="mx-2">/</span>}
                {isLast ? (
                  <span className="font-semibold text-gray-900 dark:text-gray-100" aria-current="page">
                    {label}
                  </span>
                ) : (
                  <Link
                    to={match.pathname}
                    className="hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                  >
                    {label}
                  </Link>
                )}
              </li>
            )
          })}
      </ol>
    </nav>
  )
}

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Breadcrumbs />
        <Outlet />
      </main>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center" role="alert">
      <div className="text-center max-w-md px-4">
        <h1 className="text-4xl font-bold text-red-600 dark:text-red-400 mb-4">
          Something went wrong!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error.message}</p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="btn focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Reload page"
          >
            Reload Page
          </button>
          <Link
            to="/"
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  ),
})
