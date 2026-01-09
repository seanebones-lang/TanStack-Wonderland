import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { Toast, useToast } from './Toast'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

describe('Toast Component', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('renders success toast with message', () => {
    const onClose = vi.fn()
    render(<Toast message="Test success" type="success" onClose={onClose} />)

    expect(screen.getByText('Test success')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'polite')
  })

  it('renders error toast', () => {
    const onClose = vi.fn()
    render(<Toast message="Test error" type="error" onClose={onClose} />)

    expect(screen.getByText('Test error')).toBeInTheDocument()
  })

  it('renders info toast', () => {
    const onClose = vi.fn()
    render(<Toast message="Test info" type="info" onClose={onClose} />)

    expect(screen.getByText('Test info')).toBeInTheDocument()
  })

  it('calls onClose after duration', async () => {
    const onClose = vi.fn()
    render(<Toast message="Test" duration={1000} onClose={onClose} />)

    vi.advanceTimersByTime(1300) // duration + fade out

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    render(<Toast message="Test" onClose={onClose} />)

    const closeButton = screen.getByLabelText('Close notification')
    closeButton.click()

    vi.advanceTimersByTime(300) // fade out delay

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('useToast hook shows and hides toast', () => {
    const queryClient = new QueryClient()
    const TestComponent = () => {
      const { showToast, ToastComponent } = useToast()
      return (
        <div>
          <button onClick={() => showToast('Test message', 'success')}>Show Toast</button>
          {ToastComponent}
        </div>
      )
    }

    render(
      <QueryClientProvider client={queryClient}>
        <TestComponent />
      </QueryClientProvider>
    )

    const button = screen.getByText('Show Toast')
    button.click()

    expect(screen.getByText('Test message')).toBeInTheDocument()
  })
})
