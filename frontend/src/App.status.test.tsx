import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import App from './App'
import { ApiError } from './api/client'
import { getTicket, listTickets, updateTicketStatus } from './api/tickets'
import type { Ticket } from './domain/ticket'

vi.mock('./api/tickets', () => ({
  listTickets: vi.fn(),
  getTicket: vi.fn(),
  updateTicketStatus: vi.fn(),
}))

const TICKET: Ticket = {
  id: 42,
  customer_id: 'K-104',
  customer_name: 'Exempelkund',
  title: 'Påhittad fakturafråga',
  description: 'Påhittad beskrivning.',
  category: 'billing',
  priority: 'normal',
  status: 'new',
  created_at: '2026-10-31T22:08:34.123456Z',
}

const UPDATED: Ticket = { ...TICKET, status: 'in_progress' }
const list = vi.mocked(listTickets)
const get = vi.mocked(getTicket)
const patch = vi.mocked(updateTicketStatus)

beforeEach(() => {
  list.mockResolvedValue([TICKET])
  get.mockResolvedValue(TICKET)
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))
})

afterEach(() => {
  cleanup()
  vi.resetAllMocks()
  vi.unstubAllGlobals()
})

async function openTicket() {
  fireEvent.click(await screen.findByRole('button', { name: TICKET.title }))
  const panel = screen.getByRole('region', { name: 'Ärendedetaljer' })
  const button = await within(panel).findByRole('button', { name: 'Ändra status' })
  return { panel: within(panel), button }
}

function openOptions(button: HTMLElement) {
  fireEvent.click(button)
  return within(screen.getByRole('radiogroup', { name: 'Ändra status' }))
}

it('opens all four choices, focuses the current status and supports keyboard navigation', async () => {
  render(<App />)
  const { button } = await openTicket()
  const options = openOptions(button)

  expect(options.getAllByRole('radio')).toHaveLength(4)
  const current = options.getByRole('radio', { name: 'Nytt' })
  expect(current).toHaveAttribute('aria-checked', 'true')
  expect(current).toHaveFocus()
  expect(options.getByRole('radio', { name: 'Väntar på kund' })).toBeInTheDocument()
  expect(options.getByRole('radio', { name: 'Avslutat' })).toBeInTheDocument()

  fireEvent.keyDown(current, { key: 'ArrowDown' })
  const next = options.getByRole('radio', { name: 'Pågående' })
  expect(next).toHaveFocus()
  fireEvent.keyDown(next, { key: 'Escape' })
  expect(button).toHaveFocus()
  expect(button).toHaveAttribute('aria-expanded', 'false')
  expect(patch).not.toHaveBeenCalled()
})

it('waits for the save response and updates both views even while the list reloads (K6)', async () => {
  let confirmSave = (_ticket: Ticket) => {}
  patch.mockImplementationOnce(() => new Promise((resolve) => {
    confirmSave = resolve
  }))
  list.mockResolvedValueOnce([TICKET]).mockImplementationOnce(() => new Promise(() => {}))
  render(<App />)
  const { panel, button } = await openTicket()
  const row = () => within(screen.getByRole('row', { name: /Påhittad fakturafråga/ }))
  fireEvent.click(openOptions(button).getByRole('radio', { name: 'Pågående' }))

  expect(patch).toHaveBeenCalledExactlyOnceWith(TICKET.id, 'in_progress')
  expect(button).toHaveAttribute('aria-disabled', 'true')
  expect(panel.getByText('Nytt')).toBeInTheDocument()
  expect(row().getByText('Nytt')).toBeInTheDocument()
  expect(panel.getByRole('status')).toHaveTextContent('Sparar status')

  await act(async () => confirmSave(UPDATED))
  expect(panel.getByText('Pågående')).toBeInTheDocument()
  expect(row().getByText('Pågående')).toBeInTheDocument()
  expect(panel.getByRole('status')).toHaveTextContent('Statusen har sparats.')
  expect(list).toHaveBeenCalledTimes(2)
  expect(list).toHaveBeenLastCalledWith(null)
})

it('removes the saved ticket from a list filtered on its previous status (K6, K8)', async () => {
  list.mockResolvedValueOnce([TICKET]).mockResolvedValueOnce([TICKET]).mockResolvedValueOnce([])
  patch.mockResolvedValue(UPDATED)
  render(<App />)
  const filter = screen.getByRole('button', { name: 'Nytt' })
  await screen.findByRole('button', { name: TICKET.title })
  fireEvent.click(filter)
  const { panel, button } = await openTicket()

  fireEvent.click(openOptions(button).getByRole('radio', { name: 'Pågående' }))
  expect(await screen.findByText('Inga ärenden matchar vald status')).toBeInTheDocument()
  expect(panel.getByText('Pågående')).toBeInTheDocument()
  expect(list).toHaveBeenLastCalledWith('new')
  fireEvent.click(panel.getByRole('button', { name: 'Stäng' }))
  expect(filter).toHaveAttribute('aria-pressed', 'true')
  expect(filter).toHaveFocus()
})

it('shows the confirmed status in the matching filter even if refreshing the list fails', async () => {
  list
    .mockResolvedValueOnce([TICKET])
    .mockResolvedValueOnce([])
    .mockRejectedValueOnce(new ApiError(503, 'storage_unavailable', 'API-fel'))
  patch.mockResolvedValue(UPDATED)
  render(<App />)
  const { panel, button } = await openTicket()
  const ticketList = within(screen.getByRole('region', { name: 'Ärendelista' }))
  fireEvent.click(ticketList.getByRole('button', { name: 'Pågående' }))
  await ticketList.findByText('Inga ärenden matchar vald status')

  fireEvent.click(openOptions(button).getByRole('radio', { name: 'Pågående' }))

  expect(await ticketList.findByRole('alert')).toHaveTextContent('Ärendena kunde inte hämtas')
  const row = within(ticketList.getByRole('row', { name: /Påhittad fakturafråga/ }))
  expect(row.getByText('Pågående')).toBeInTheDocument()
  expect(panel.getByRole('status')).toHaveTextContent('Statusen har sparats.')
})

it('lets the user select the current status again (K6)', async () => {
  patch.mockResolvedValue(TICKET)
  render(<App />)
  const { panel, button } = await openTicket()
  fireEvent.click(openOptions(button).getByRole('radio', { name: 'Nytt' }))

  expect(await panel.findByText('Statusen har sparats.')).toBeInTheDocument()
  expect(patch).toHaveBeenCalledExactlyOnceWith(TICKET.id, 'new')
  expect(panel.getByText('Nytt')).toBeInTheDocument()
})

it.each([
  [404, 'not_found', 'Ärendet kunde inte hittas.'],
  [422, 'validation_error', 'Välj en giltig status.'],
  [503, 'storage_unavailable', 'Ändringen kunde inte sparas. Försök igen.'],
])('keeps the saved status and the attempted choice after a %i response (K6, K7)', async (
  httpStatus, code, expectedMessage,
) => {
  patch.mockRejectedValue(new ApiError(httpStatus, code, 'API-fel'))
  render(<App />)
  const { panel, button } = await openTicket()
  fireEvent.click(openOptions(button).getByRole('radio', { name: 'Pågående' }))

  expect(await panel.findByRole('alert')).toHaveTextContent(expectedMessage)
  expect(panel.getByText('Nytt')).toBeInTheDocument()
  expect(panel.getByText('Vald status: Pågående')).toBeInTheDocument()
  expect(panel.getByRole('status')).toBeEmptyDOMElement()
  expect(list).toHaveBeenCalledTimes(1)
})

it.each([[500, 'save_outcome_unknown'], [null, 'network_error']])(
  'lets the user verify an unknown save outcome by reading the ticket and list (K7)',
  async (httpStatus, code) => {
    patch.mockRejectedValue(new ApiError(httpStatus, code, 'API-fel'))
    render(<App />)
    const { panel, button } = await openTicket()
    fireEvent.click(openOptions(button).getByRole('radio', { name: 'Pågående' }))

    expect(await panel.findByRole('alert')).toHaveTextContent('gick inte att bekräfta')
    expect(panel.getByText('Nytt')).toBeInTheDocument()
    expect(panel.getByText('Vald status: Pågående')).toBeInTheDocument()

    get.mockResolvedValueOnce(UPDATED)
    list.mockResolvedValueOnce([UPDATED])
    fireEvent.click(panel.getByRole('button', { name: 'Uppdatera listan' }))

    expect(await panel.findByText('Aktuell status har hämtats.')).toBeInTheDocument()
    expect(panel.getByText('Pågående')).toBeInTheDocument()
    expect(get).toHaveBeenCalledTimes(2)
    expect(list).toHaveBeenCalledTimes(2)
    expect(patch).toHaveBeenCalledTimes(1)
    expect(panel.queryByText('Statusen har sparats.')).not.toBeInTheDocument()
  },
)

it('keeps a write in progress when the user closes and reopens the same ticket', async () => {
  let confirmSave = (_ticket: Ticket) => {}
  patch.mockImplementationOnce(() => new Promise((resolve) => {
    confirmSave = resolve
  }))
  render(<App />)
  const { panel, button } = await openTicket()
  fireEvent.click(openOptions(button).getByRole('radio', { name: 'Pågående' }))
  fireEvent.click(panel.getByRole('button', { name: 'Stäng' }))

  const reopened = await openTicket()
  expect(reopened.button).toHaveAttribute('aria-disabled', 'true')
  fireEvent.click(reopened.button)
  expect(reopened.button).toHaveAttribute('aria-expanded', 'false')

  list.mockResolvedValueOnce([UPDATED])
  await act(async () => confirmSave(UPDATED))
  expect(reopened.panel.getByText('Pågående')).toBeInTheDocument()
  expect(patch).toHaveBeenCalledTimes(1)
})
