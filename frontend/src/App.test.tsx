import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'

afterEach(() => {
  cleanup()
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

it('shows API availability separately from MySQL availability', async () => {
  vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8000')
  const { default: App } = await import('./App')
  const fetchMock = vi.fn((input: RequestInfo | URL) =>
    Promise.resolve({
      ok: !String(input).endsWith('/health/db'),
      json: () => Promise.resolve([]),
    } as Response),
  )
  vi.stubGlobal('fetch', fetchMock)

  render(<App />)

  expect(await screen.findByText('API: Tillgänglig')).toBeInTheDocument()
  expect(await screen.findByText('MySQL: Inte tillgänglig')).toBeInTheDocument()
  expect(fetchMock).toHaveBeenCalledWith('http://localhost:8000/health')
  expect(fetchMock).toHaveBeenCalledWith('http://localhost:8000/health/db')
})

it('keeps the status filter after opening a ticket and going back (K8)', async () => {
  vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8000')
  const { default: App } = await import('./App')
  const ticket = {
    id: 7,
    customer_id: 'K-7',
    customer_name: 'Exempelkund',
    title: 'Påhittat pågående ärende',
    description: 'Påhittad beskrivning.',
    category: 'other',
    priority: 'normal',
    status: 'in_progress',
    created_at: '2026-10-31T22:08:34.123456Z',
  }
  const fetchMock = vi.fn((input: RequestInfo | URL) => {
    const url = String(input)
    const body = url.endsWith('/api/tickets/7')
      ? ticket
      : url.includes('/api/tickets')
        ? [ticket]
        : {}
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(body),
    } as Response)
  })
  vi.stubGlobal('fetch', fetchMock)
  render(<App />)

  fireEvent.click(await screen.findByRole('button', { name: 'Pågående' }))
  fireEvent.click(
    await screen.findByRole('button', { name: 'Påhittat pågående ärende' }),
  )
  fireEvent.click(
    await screen.findByRole('button', { name: 'Stäng' }),
  )

  expect(
    screen.queryByRole('region', { name: 'Ärendedetaljer' }),
  ).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Pågående' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  expect(fetchMock).toHaveBeenCalledWith(
    'http://localhost:8000/api/tickets?status=in_progress',
    undefined,
  )
})

it('returns focus to the ticket the user came from when the panel closes', async () => {
  vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8000')
  const { default: App } = await import('./App')
  const ticket = {
    id: 3,
    customer_id: 'K-3',
    customer_name: 'Exempelkund',
    title: 'Påhittat ärende',
    description: 'Påhittad beskrivning.',
    category: 'technical',
    priority: 'low',
    status: 'new',
    created_at: '2026-10-31T22:08:34.123456Z',
  }
  vi.stubGlobal(
    'fetch',
    vi.fn((input: RequestInfo | URL) => {
      const url = String(input)
      const body = url.endsWith('/api/tickets/3')
        ? ticket
        : url.includes('/api/tickets')
          ? [ticket]
          : {}
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(body),
      } as Response)
    }),
  )
  render(<App />)

  const openButton = await screen.findByRole('button', {
    name: 'Påhittat ärende',
  })
  fireEvent.click(openButton)
  expect(
    await screen.findByRole('region', { name: 'Ärendedetaljer' }),
  ).toHaveFocus()

  fireEvent.click(screen.getByRole('button', { name: 'Stäng' }))

  expect(openButton).toHaveFocus()
})
