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

const EXISTING_TICKET = {
  id: 5,
  customer_id: 'K-5',
  customer_name: 'Exempelkund',
  title: 'Påhittat befintligt ärende',
  description: 'Påhittad beskrivning.',
  category: 'other',
  priority: 'normal',
  status: 'new',
  created_at: '2026-10-31T22:08:34.123456Z',
}

const NEW_TICKET = {
  ...EXISTING_TICKET,
  id: 6,
  customer_id: 'K-6',
  title: 'Påhittat nytt ärende',
}

// Listan innehåller bara det befintliga ärendet tills ett POST har lyckats
function stubTicketApi() {
  const tickets = [EXISTING_TICKET]
  const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    let body: unknown = {}
    if (init?.method === 'POST') {
      tickets.unshift(NEW_TICKET)
      body = NEW_TICKET
    } else if (url.endsWith('/api/tickets/5')) {
      body = EXISTING_TICKET
    } else if (url.includes('/api/tickets')) {
      body = [...tickets]
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(body),
    } as Response)
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

async function renderApp() {
  vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8000')
  const { default: App } = await import('./App')
  render(<App />)
  await screen.findByRole('button', { name: 'Påhittat befintligt ärende' })
}

it('opens the registration form from "Nytt ärende" and closes it with "Avbryt" (K1)', async () => {
  stubTicketApi()
  await renderApp()
  expect(
    screen.queryByRole('heading', { name: 'Registrera ärende' }),
  ).not.toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: 'Nytt ärende' }))

  expect(
    screen.getByRole('heading', { name: 'Registrera ärende' }),
  ).toBeInTheDocument()
  // Knappen göms medan formuläret är öppet
  expect(
    screen.queryByRole('button', { name: 'Nytt ärende' }),
  ).not.toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: 'Avbryt' }))

  expect(
    screen.queryByRole('heading', { name: 'Registrera ärende' }),
  ).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Nytt ärende' })).toBeInTheDocument()
})

it('replaces the ticket details with the form and the form with details', async () => {
  stubTicketApi()
  await renderApp()

  fireEvent.click(
    screen.getByRole('button', { name: 'Påhittat befintligt ärende' }),
  )
  expect(
    await screen.findByRole('region', { name: 'Ärendedetaljer' }),
  ).toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: 'Nytt ärende' }))
  expect(
    screen.queryByRole('region', { name: 'Ärendedetaljer' }),
  ).not.toBeInTheDocument()
  expect(
    screen.getByRole('heading', { name: 'Registrera ärende' }),
  ).toBeInTheDocument()

  fireEvent.click(
    screen.getByRole('button', { name: 'Påhittat befintligt ärende' }),
  )
  expect(
    screen.queryByRole('heading', { name: 'Registrera ärende' }),
  ).not.toBeInTheDocument()
  expect(
    await screen.findByRole('region', { name: 'Ärendedetaljer' }),
  ).toBeInTheDocument()
})

it('reloads the list after a ticket is saved and keeps the form open with the confirmation', async () => {
  const fetchMock = stubTicketApi()
  await renderApp()
  fireEvent.click(screen.getByRole('button', { name: 'Nytt ärende' }))

  const fill = (label: string, value: string) =>
    fireEvent.change(screen.getByLabelText(label), { target: { value } })
  fill('Kund-ID', 'K-6')
  fill('Kundnamn', 'Exempelkund')
  fill('Rubrik', 'Påhittat nytt ärende')
  fill('Beskrivning', 'Påhittad beskrivning.')
  fireEvent.click(screen.getByLabelText('Övrigt'))
  fireEvent.click(screen.getByLabelText('Normal'))
  fireEvent.click(screen.getByRole('button', { name: 'Spara ärende' }))

  // Det nya ärendet kommer från backend-svaret på den omladdade listan
  expect(
    await screen.findByRole('button', { name: 'Påhittat nytt ärende' }),
  ).toBeInTheDocument()
  expect(screen.getByText('Ärendet har sparats som #6.')).toBeInTheDocument()
  const postCalls = fetchMock.mock.calls.filter(
    ([, init]) => init?.method === 'POST',
  )
  expect(postCalls).toHaveLength(1)
})
