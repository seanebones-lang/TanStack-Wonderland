import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter, createMemoryHistory } from '@tanstack/react-router'
import { routeTree } from '../routeTree.gen'

const mockPokemonDetail = {
  id: 25,
  name: 'pikachu',
  height: 4,
  weight: 60,
  base_experience: 112,
  types: [{ type: { name: 'electric' } }],
  stats: [
    { base_stat: 35, stat: { name: 'hp' } },
    { base_stat: 55, stat: { name: 'attack' } },
  ],
  sprites: {
    front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
    front_shiny: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/25.png',
  },
  abilities: [
    { ability: { name: 'static' }, is_hidden: false },
    { ability: { name: 'lightning-rod' }, is_hidden: true },
  ],
}

const createTestRouter = (path = '/pokemon/pikachu') => {
  const history = createMemoryHistory({ initialEntries: [path] })
  return createRouter({
    routeTree,
    history,
  })
}

describe('Pokemon Detail Page', () => {
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

  it('renders Pokemon name and ID', async () => {
    const router = createTestRouter()
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockPokemonDetail,
    })

    render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/pikachu/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/#025/i)).toBeInTheDocument()
  })

  it('displays Pokemon stats', async () => {
    const router = createTestRouter()
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockPokemonDetail,
    })

    render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/Base Stats/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/hp/i)).toBeInTheDocument()
    expect(screen.getByText(/35/i)).toBeInTheDocument()
  })

  it('displays Pokemon types', async () => {
    const router = createTestRouter()
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockPokemonDetail,
    })

    render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/Types/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/electric/i)).toBeInTheDocument()
  })

  it('displays Pokemon abilities', async () => {
    const router = createTestRouter()
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockPokemonDetail,
    })

    render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/Abilities/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/static/i)).toBeInTheDocument()
    expect(screen.getByText(/lightning-rod/i)).toBeInTheDocument()
    expect(screen.getByText(/Hidden/i)).toBeInTheDocument()
  })

  it('toggles shiny sprite', async () => {
    const user = userEvent.setup()
    const router = createTestRouter()
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockPokemonDetail,
    })

    render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/pikachu/i)).toBeInTheDocument()
    })

    const shinyButton = screen.getByLabelText(/Switch to.*sprite/i)
    await user.click(shinyButton)

    expect(screen.getByText(/Shiny form/i)).toBeInTheDocument()
  })

  it('navigates to previous Pokemon', async () => {
    const user = userEvent.setup()
    const router = createTestRouter('/pokemon/25')
    
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ...mockPokemonDetail,
        id: 25,
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

    const prevButton = screen.getByLabelText(/Previous Pokemon/i)
    await user.click(prevButton)

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/pokemon/24')
    })
  })

  it('navigates to next Pokemon', async () => {
    const user = userEvent.setup()
    const router = createTestRouter('/pokemon/25')
    
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ...mockPokemonDetail,
        id: 25,
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

    const nextButton = screen.getByLabelText(/Next Pokemon/i)
    await user.click(nextButton)

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/pokemon/26')
    })
  })

  it('handles keyboard navigation', async () => {
    const router = createTestRouter('/pokemon/25')
    
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ...mockPokemonDetail,
        id: 25,
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

    // Press right arrow
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/pokemon/26')
    })
  })

  it('copies share link to clipboard', async () => {
    const user = userEvent.setup()
    const router = createTestRouter()
    
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockPokemonDetail,
    })

    const writeTextSpy = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue()

    render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/pikachu/i)).toBeInTheDocument()
    })

    const shareButton = screen.getByLabelText(/Share Pokemon link/i)
    await user.click(shareButton)

    await waitFor(() => {
      expect(writeTextSpy).toHaveBeenCalled()
      expect(screen.getByText(/Link copied to clipboard/i)).toBeInTheDocument()
    })
  })

  it('shows error message on fetch failure', async () => {
    const router = createTestRouter()
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Failed to fetch'))

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

  it('displays skeleton loader while loading', () => {
    const router = createTestRouter()
    global.fetch = vi.fn().mockImplementation(() => new Promise(() => {})) // Never resolves

    render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    )

    expect(screen.getByText(/Back to Home/i)).toBeInTheDocument()
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })
})
