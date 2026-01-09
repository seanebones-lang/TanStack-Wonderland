import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryHistory, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Route } from './__root'

describe('Root Route', () => {
  it('renders navigation', () => {
    const queryClient = new QueryClient()
    const history = createMemoryHistory({ initialEntries: ['/'] })
    const router = createRouter({
      routeTree: Route,
      history,
    })

    render(
      <QueryClientProvider client={queryClient}>
        <router.Provider />
      </QueryClientProvider>
    )

    expect(screen.getByText('TanStack Wonderland')).toBeInTheDocument()
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('renders breadcrumbs', () => {
    const queryClient = new QueryClient()
    const history = createMemoryHistory({ initialEntries: ['/pokemon-table'] })
    const router = createRouter({
      routeTree: Route,
      history,
    })

    render(
      <QueryClientProvider client={queryClient}>
        <router.Provider />
      </QueryClientProvider>
    )

    // Breadcrumbs should be present
    expect(screen.getByLabelText('Breadcrumb')).toBeInTheDocument()
  })
})
