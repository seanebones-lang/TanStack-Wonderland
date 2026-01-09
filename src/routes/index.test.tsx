import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter, createMemoryHistory } from '@tanstack/react-router'
import { routeTree } from '../routeTree.gen'

const createTestRouter = (initialEntries = ['/']) => {
  const history = createMemoryHistory({ initialEntries })
  return createRouter({
    routeTree,
    history,
  })
}

describe('Home Page', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    vi.clearAllMocks()
  })

  it('renders welcome message', () => {
    const router = createTestRouter()
    render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    )

    expect(screen.getByText(/Welcome to TanStack Wonderland/i)).toBeInTheDocument()
    expect(screen.getByText(/Explore the TanStack ecosystem/i)).toBeInTheDocument()
  })

  it('renders search input', () => {
    const router = createTestRouter()
    render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    )

    const searchInput = screen.getByLabelText(/Search Pokemon/i)
    expect(searchInput).toBeInTheDocument()
    expect(searchInput).toHaveAttribute('placeholder', 'Search Pokemon...')
  })

  it('displays skeleton loaders while loading', async () => {
    const router = createTestRouter()
    render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    )

    // Check for skeleton cards
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('filters Pokemon by search query', async () => {
    const user = userEvent.setup()
    const router = createTestRouter()

    // Mock fetch
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [
          { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' },
          { name: 'charizard', url: 'https://pokeapi.co/api/v2/pokemon/6/' },
        ],
        next: null,
      }),
    })

    render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    )

    const searchInput = screen.getByLabelText(/Search Pokemon/i)
    await user.type(searchInput, 'pikachu')

    await waitFor(() => {
      expect(screen.getByText(/matching "pikachu"/i)).toBeInTheDocument()
    })
  })

  it('shows error message on fetch failure', async () => {
    const router = createTestRouter()
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'))

    render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/Error loading Pokemon/i)).toBeInTheDocument()
    })

    const retryButton = screen.getByLabelText(/Retry loading Pokemon/i)
    expect(retryButton).toBeInTheDocument()
  })

  it('loads more Pokemon on scroll', async () => {
    const router = createTestRouter()
    let callCount = 0

    global.fetch = vi.fn().mockImplementation(() => {
      callCount++
      return Promise.resolve({
        ok: true,
        json: async () => ({
          results: Array.from({ length: 20 }, (_, i) => ({
            name: `pokemon-${callCount}-${i}`,
            url: `https://pokeapi.co/api/v2/pokemon/${callCount * 20 + i}/`,
          })),
          next: callCount < 2 ? 'next-url' : null,
        }),
      })
    })

    render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })

    // Simulate scroll
    const scrollContainer = document.querySelector('[role="region"]')
    if (scrollContainer) {
      Object.defineProperty(scrollContainer, 'scrollHeight', { value: 2000, configurable: true })
      Object.defineProperty(scrollContainer, 'scrollTop', { value: 1800, configurable: true })
      Object.defineProperty(scrollContainer, 'clientHeight', { value: 600, configurable: true })

      scrollContainer.dispatchEvent(new Event('scroll'))
    }

    await waitFor(() => {
      expect(callCount).toBeGreaterThan(1)
    }, { timeout: 3000 })
  })

  it('prefetches Pokemon detail on card hover', async () => {
    const user = userEvent.setup()
    const router = createTestRouter()

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [{ name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' }],
        next: null,
      }),
    })

    render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/View details for pikachu/i)).toBeInTheDocument()
    })

    const card = screen.getByLabelText(/View details for pikachu/i)
    await user.hover(card)

    // Should prefetch Pokemon detail
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2) // Initial + prefetch
    })
  })
})
