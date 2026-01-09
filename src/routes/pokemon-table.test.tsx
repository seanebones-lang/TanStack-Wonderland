import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter, createMemoryHistory } from '@tanstack/react-router'
import { routeTree } from '../routeTree.gen'

const createTestRouter = (path = '/pokemon-table') => {
  const history = createMemoryHistory({ initialEntries: [path] })
  return createRouter({
    routeTree,
    history,
  })
}

describe('Pokemon Table', () => {
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

  it('renders table title', () => {
    const router = createTestRouter()
    render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    )

    expect(screen.getByText(/Pokemon Table/i)).toBeInTheDocument()
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
  })

  it('displays Pokemon data in table', async () => {
    const router = createTestRouter()
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

    await waitFor(() => {
      expect(screen.getByText(/pikachu/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/charizard/i)).toBeInTheDocument()
  })

  it('filters table by search query', async () => {
    const user = userEvent.setup()
    const router = createTestRouter()
    
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

    await waitFor(() => {
      expect(screen.getByText(/pikachu/i)).toBeInTheDocument()
    })

    const searchInput = screen.getByLabelText(/Search Pokemon/i)
    await user.type(searchInput, 'pikachu')

    await waitFor(() => {
      expect(screen.getByText(/pikachu/i)).toBeInTheDocument()
      expect(screen.queryByText(/charizard/i)).not.toBeInTheDocument()
    })
  })

  it('selects individual rows', async () => {
    const user = userEvent.setup()
    const router = createTestRouter()
    
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [
          { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' },
        ],
        next: null,
      }),
    })

    render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/pikachu/i)).toBeInTheDocument()
    })

    const checkbox = screen.getByLabelText(/Select pikachu/i)
    await user.click(checkbox)

    expect(checkbox).toBeChecked()
    expect(screen.getByText(/1 selected/i)).toBeInTheDocument()
  })

  it('selects all rows', async () => {
    const user = userEvent.setup()
    const router = createTestRouter()
    
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

    await waitFor(() => {
      expect(screen.getByText(/pikachu/i)).toBeInTheDocument()
    })

    const selectAllCheckbox = screen.getByLabelText(/Select all rows/i)
    await user.click(selectAllCheckbox)

    expect(selectAllCheckbox).toBeChecked()
    expect(screen.getByText(/2 selected/i)).toBeInTheDocument()
  })

  it('toggles column visibility', async () => {
    const user = userEvent.setup()
    const router = createTestRouter()
    
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [
          { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' },
        ],
        next: null,
      }),
    })

    render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/pikachu/i)).toBeInTheDocument()
    })

    const columnButton = screen.getByLabelText(/Toggle column visibility/i)
    await user.click(columnButton)

    await waitFor(() => {
      expect(screen.getByText(/Toggle All/i)).toBeInTheDocument()
    })
  })

  it('sorts table by column', async () => {
    const user = userEvent.setup()
    const router = createTestRouter()
    
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [
          { name: 'charizard', url: 'https://pokeapi.co/api/v2/pokemon/6/' },
          { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' },
        ],
        next: null,
      }),
    })

    render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/Name/i)).toBeInTheDocument()
    })

    const nameHeader = screen.getByLabelText(/Sort by name/i)
    await user.click(nameHeader)

    // Table should be sorted
    const rows = screen.getAllByRole('row')
    expect(rows.length).toBeGreaterThan(1)
  })

  it('exports selected rows to CSV', async () => {
    const user = userEvent.setup()
    const router = createTestRouter()
    
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [
          { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' },
        ],
        next: null,
      }),
    })

    const createElementSpy = vi.spyOn(document, 'createElement')
    const clickSpy = vi.fn()
    createElementSpy.mockReturnValue({
      href: '',
      download: '',
      click: clickSpy,
    } as any)

    render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/pikachu/i)).toBeInTheDocument()
    })

    const checkbox = screen.getByLabelText(/Select pikachu/i)
    await user.click(checkbox)

    const exportButton = screen.getByLabelText(/Export to CSV/i)
    await user.click(exportButton)

    expect(clickSpy).toHaveBeenCalled()
  })

  it('loads more Pokemon on button click', async () => {
    const user = userEvent.setup()
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
      expect(screen.getByRole('button', { name: /Load More/i })).toBeInTheDocument()
    })

    const loadMoreButton = screen.getByRole('button', { name: /Load More/i })
    await user.click(loadMoreButton)

    await waitFor(() => {
      expect(callCount).toBeGreaterThan(1)
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
  })
})
