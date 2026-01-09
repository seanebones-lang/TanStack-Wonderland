import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter, createMemoryHistory } from '@tanstack/react-router'
import { routeTree } from '../routeTree.gen'

const createTestRouter = (path = '/form') => {
  const history = createMemoryHistory({ initialEntries: [path] })
  return createRouter({
    routeTree,
    history,
  })
}

describe('Team Builder Form', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('renders form with 6 Pokemon slots', () => {
    const router = createTestRouter()
    render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    )

    expect(screen.getByText(/Pokemon Team Builder/i)).toBeInTheDocument()
    
    for (let i = 1; i <= 6; i++) {
      expect(screen.getByLabelText(`Pokemon ${i}`)).toBeInTheDocument()
    }
  })

  it('shows autocomplete suggestions', async () => {
    const user = userEvent.setup()
    const router = createTestRouter()

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [
          { name: 'pikachu' },
          { name: 'charizard' },
          { name: 'blastoise' },
        ],
      }),
    })

    render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    )

    const firstInput = screen.getByLabelText('Pokemon 1')
    await user.type(firstInput, 'pik')

    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })

    expect(screen.getByRole('option', { name: /pikachu/i })).toBeInTheDocument()
  })

  it('prevents duplicate Pokemon', async () => {
    const user = userEvent.setup()
    const router = createTestRouter()

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [{ name: 'pikachu' }],
      }),
    })

    render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    )

    const firstInput = screen.getByLabelText('Pokemon 1')
    await user.type(firstInput, 'pikachu')
    
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })
    
    await user.click(screen.getByRole('option', { name: /pikachu/i }))

    const secondInput = screen.getByLabelText('Pokemon 2')
    await user.type(secondInput, 'pikachu')
    
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })
    
    await user.click(screen.getByRole('option', { name: /pikachu/i }))

    await waitFor(() => {
      expect(screen.getByText(/Duplicate/i)).toBeInTheDocument()
    })
  })

  it('validates minimum 6 Pokemon', async () => {
    const user = userEvent.setup()
    const router = createTestRouter()

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          { name: 'pikachu' },
          { name: 'charizard' },
          { name: 'blastoise' },
          { name: 'venusaur' },
          { name: 'snorlax' },
          { name: 'dragonite' },
        ],
      }),
    })

    render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    )

    // Fill only 5 slots
    for (let i = 1; i <= 5; i++) {
      const input = screen.getByLabelText(`Pokemon ${i}`)
      await user.type(input, `pokemon${i}`)
      
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument()
      })
      
      const option = screen.getByRole('option').first()
      if (option) {
        await user.click(option)
      }
    }

    const submitButton = screen.getByRole('button', { name: /Submit Team/i })
    expect(submitButton).toBeDisabled()
  })

  it('submits valid team', async () => {
    const user = userEvent.setup()
    const router = createTestRouter()

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        results: Array.from({ length: 10 }, (_, i) => ({
          name: `pokemon${i + 1}`,
        })),
      }),
    })

    render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    )

    // Fill all 6 slots
    for (let i = 1; i <= 6; i++) {
      const input = screen.getByLabelText(`Pokemon ${i}`)
      await user.type(input, `pokemon${i}`)
      
      await waitFor(() => {
        const listbox = screen.queryByRole('listbox')
        if (listbox) {
          const option = within(listbox).getByRole('option').first()
          if (option) {
            user.click(option)
          }
        }
      }, { timeout: 2000 })
    }

    const submitButton = screen.getByRole('button', { name: /Submit Team/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/Team submitted successfully/i)).toBeInTheDocument()
    })
  })

  it('saves team to localStorage', async () => {
    const user = userEvent.setup()
    const router = createTestRouter()

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [{ name: 'pikachu' }],
      }),
    })

    render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    )

    const firstInput = screen.getByLabelText('Pokemon 1')
    await user.type(firstInput, 'pikachu')
    
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })
    
    await user.click(screen.getByRole('option', { name: /pikachu/i }))

    const saveButton = screen.getByLabelText(/Save team to local storage/i)
    await user.click(saveButton)

    await waitFor(() => {
      expect(screen.getByText(/Team saved locally/i)).toBeInTheDocument()
    })

    const saved = localStorage.getItem('savedTeam')
    expect(saved).toBeTruthy()
    expect(JSON.parse(saved!)).toContain('pikachu')
  })

  it('loads saved team from localStorage', () => {
    localStorage.setItem('savedTeam', JSON.stringify(['pikachu', 'charizard']))
    
    const router = createTestRouter()
    render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    )

    const firstInput = screen.getByLabelText('Pokemon 1') as HTMLInputElement
    expect(firstInput.value).toBe('pikachu')
  })

  it('pre-fills Pokemon from URL search params', () => {
    const router = createTestRouter('/form?pokemon=pikachu')
    render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    )

    const firstInput = screen.getByLabelText('Pokemon 1') as HTMLInputElement
    expect(firstInput.value).toBe('pikachu')
  })

  it('displays team preview', async () => {
    const user = userEvent.setup()
    const router = createTestRouter()

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [{ name: 'pikachu' }],
      }),
    })

    render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    )

    const firstInput = screen.getByLabelText('Pokemon 1')
    await user.type(firstInput, 'pikachu')
    
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })
    
    await user.click(screen.getByRole('option', { name: /pikachu/i }))

    await waitFor(() => {
      expect(screen.getByText(/Team Preview/i)).toBeInTheDocument()
      expect(screen.getByText(/pikachu/i)).toBeInTheDocument()
    })
  })
})
