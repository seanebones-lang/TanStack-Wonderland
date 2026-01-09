import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter, createMemoryHistory } from '@tanstack/react-router'
import { routeTree } from '../routeTree.gen'

/**
 * Creates a test query client with default options
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

/**
 * Creates a test router with optional initial path
 */
export function createTestRouter(initialPath = '/') {
  const history = createMemoryHistory({ initialEntries: [initialPath] })
  return createRouter({
    routeTree,
    history,
  })
}

/**
 * Custom render function that includes providers
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialPath?: string
  queryClient?: QueryClient
}

export function renderWithProviders(
  ui: ReactElement,
  { initialPath = '/', queryClient = createTestQueryClient(), ...renderOptions }: CustomRenderOptions = {}
) {
  const router = createTestRouter(initialPath)

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router}>{children}</RouterProvider>
      </QueryClientProvider>
    )
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    router,
    queryClient,
  }
}

/**
 * Mock Pokemon data for testing
 */
export const mockPokemon = {
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

export const mockPokemonList = [
  { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' },
  { name: 'charizard', url: 'https://pokeapi.co/api/v2/pokemon/6/' },
  { name: 'blastoise', url: 'https://pokeapi.co/api/v2/pokemon/9/' },
]

/**
 * Mock fetch responses
 */
export function mockFetchPokemonList(results = mockPokemonList, next: string | null = null) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      results,
      next,
      count: results.length,
    }),
  })
}

export function mockFetchPokemonDetail(pokemon = mockPokemon) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: async () => pokemon,
  })
}

export function mockFetchError(message = 'Network error') {
  return vi.fn().mockRejectedValue(new Error(message))
}
