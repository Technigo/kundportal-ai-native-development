import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { ApiError } from '../../api/client'
import { getTicket } from '../../api/tickets'
import type { Ticket } from '../../domain/ticket'
import { TicketDetail } from './TicketDetail'

vi.mock('../../api/tickets', () => ({ getTicket: vi.fn() }))
const getTicketMock = vi.mocked(getTicket)

afterEach(cleanup)

const TICKET: Ticket = {
  id: 42,
  customer_id: 'K-104',
  customer_name: 'Exempelkund',
  title: 'Fråga om faktura',
  description: 'Jag behöver hjälp med en påhittad faktura.\nRad två.',
  category: 'billing',
  priority: 'high',
  status: 'waiting_for_customer',
  created_at: '2026-10-31T22:08:34.123456Z',
}

it('shows every field of the chosen ticket', async () => {
  getTicketMock.mockResolvedValue(TICKET)

  render(<TicketDetail ticketId={42} onClose={() => {}} />)

  expect(
    await screen.findByRole('heading', { name: 'Fråga om faktura' }),
  ).toBeInTheDocument()
  expect(screen.getByText('#42 · Faktura')).toBeInTheDocument()
  expect(screen.getByText('K-104')).toBeInTheDocument()
  expect(screen.getByText('Exempelkund')).toBeInTheDocument()
  expect(screen.getByText('Hög')).toBeInTheDocument()
  expect(screen.getByText('Väntar på kund')).toBeInTheDocument()
  expect(screen.getByText(/2026/)).toHaveAttribute(
    'dateTime',
    '2026-10-31T22:08:34.123456Z',
  )
  // Radbrytningar i beskrivningen bevaras
  expect(
    screen.getByText((_, element) =>
      element?.textContent ===
        'Jag behöver hjälp med en påhittad faktura.\nRad två.' &&
      element.tagName === 'P',
    ),
  ).toBeInTheDocument()
  expect(getTicketMock).toHaveBeenCalledWith(42)
})

it('shows a clear message when the ticket does not exist', async () => {
  getTicketMock.mockRejectedValue(
    new ApiError(404, 'not_found', 'Ärendet kunde inte hittas.'),
  )

  render(<TicketDetail ticketId={999} onClose={() => {}} />)

  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Ärendet kunde inte hittas',
  )
  expect(
    screen.queryByRole('button', { name: 'Försök igen' }),
  ).not.toBeInTheDocument()
})

it('shows an error and fetches again when the user retries', async () => {
  getTicketMock
    .mockRejectedValueOnce(
      new ApiError(503, 'storage_unavailable', 'Lagringen är tillfälligt otillgänglig.'),
    )
    .mockResolvedValueOnce(TICKET)
  render(<TicketDetail ticketId={42} onClose={() => {}} />)

  const alert = await screen.findByRole('alert')
  expect(alert).toHaveTextContent('Ärendet kunde inte hämtas. Försök igen.')

  within(alert).getByRole('button', { name: 'Försök igen' }).click()

  expect(
    await screen.findByRole('heading', { name: 'Fråga om faktura' }),
  ).toBeInTheDocument()
})

it('lets the user go back to the list', async () => {
  getTicketMock.mockResolvedValue(TICKET)
  const onClose = vi.fn()
  render(<TicketDetail ticketId={42} onClose={onClose} />)
  await screen.findByRole('heading', { name: 'Fråga om faktura' })

  screen.getByRole('button', { name: 'Stäng' }).click()

  expect(onClose).toHaveBeenCalledOnce()
})
