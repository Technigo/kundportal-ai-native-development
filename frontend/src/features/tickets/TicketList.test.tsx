import { cleanup, render, screen, within } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, expect, it, vi } from 'vitest'
import { ApiError } from '../../api/client'
import { listTickets } from '../../api/tickets'
import type { StatusFilter, Ticket } from '../../domain/ticket'
import { TicketList } from './TicketList'

vi.mock('../../api/tickets', () => ({ listTickets: vi.fn() }))
const listTicketsMock = vi.mocked(listTickets)

afterEach(cleanup)

const NEW_TICKET: Ticket = {
  id: 2,
  customer_id: 'K-208',
  customer_name: 'Exempelkund Beta',
  title: 'Problem med testinloggning',
  description: 'Påhittad beskrivning.',
  category: 'technical_support',
  priority: 'high',
  status: 'new',
  created_at: '2026-10-31T22:08:34.123456Z',
}

const IN_PROGRESS_TICKET: Ticket = {
  ...NEW_TICKET,
  id: 1,
  customer_id: 'K-104',
  customer_name: 'Exempelkund Alfa',
  title: 'Fråga om en påhittad faktura',
  category: 'billing',
  priority: 'normal',
  status: 'in_progress',
  created_at: '2026-10-30T08:00:00.000000Z',
}

// Filtret ägs av föräldern, som i App
function TicketListWithFilter() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(null)
  return (
    <TicketList
      statusFilter={statusFilter}
      onStatusFilterChange={setStatusFilter}
    />
  )
}

it('shows list fields for every ticket in the order the API returns', async () => {
  listTicketsMock.mockResolvedValue([NEW_TICKET, IN_PROGRESS_TICKET])

  render(<TicketListWithFilter />)

  const rows = await screen.findAllByRole('row')
  const firstRow = within(rows[1])
  expect(firstRow.getByText('#2')).toBeInTheDocument()
  expect(firstRow.getByText('K-208')).toBeInTheDocument()
  expect(firstRow.getByText('Exempelkund Beta')).toBeInTheDocument()
  expect(firstRow.getByText('Problem med testinloggning')).toBeInTheDocument()
  expect(firstRow.getByText('Teknisk support')).toBeInTheDocument()
  expect(firstRow.getByText('Hög')).toBeInTheDocument()
  expect(firstRow.getByText('Nytt')).toBeInTheDocument()
  expect(within(rows[2]).getByText('#1')).toBeInTheDocument()
  expect(listTicketsMock).toHaveBeenCalledWith(null)
})

it('shows an empty state when there are no tickets', async () => {
  listTicketsMock.mockResolvedValue([])

  render(<TicketListWithFilter />)

  expect(
    await screen.findByText('Det finns inga ärenden ännu'),
  ).toBeInTheDocument()
})

it('filters on one status and resets with Alla', async () => {
  listTicketsMock.mockImplementation((status) =>
    Promise.resolve(
      [NEW_TICKET, IN_PROGRESS_TICKET].filter(
        (ticket) => status === null || ticket.status === status,
      ),
    ),
  )
  render(<TicketListWithFilter />)
  const allButton = await screen.findByRole('button', { name: 'Alla' })
  expect(allButton).toHaveAttribute('aria-pressed', 'true')

  screen.getByRole('button', { name: 'Pågående' }).click()

  expect(await screen.findByText('#1')).toBeInTheDocument()
  expect(screen.queryByText('#2')).not.toBeInTheDocument()
  expect(listTicketsMock).toHaveBeenLastCalledWith('in_progress')
  expect(screen.getByRole('button', { name: 'Pågående' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )

  screen.getByRole('button', { name: 'Alla' }).click()

  expect(await screen.findByText('#2')).toBeInTheDocument()
  expect(screen.getByText('#1')).toBeInTheDocument()
  expect(listTicketsMock).toHaveBeenLastCalledWith(null)
})

it('shows a message when no tickets match the chosen status', async () => {
  listTicketsMock.mockImplementation((status) =>
    Promise.resolve(status === null ? [NEW_TICKET] : []),
  )
  render(<TicketListWithFilter />)
  await screen.findByText('#2')

  screen.getByRole('button', { name: 'Avslutat' }).click()

  expect(
    await screen.findByText('Inga ärenden matchar vald status'),
  ).toBeInTheDocument()
})

it('shows an error and fetches again when the user retries', async () => {
  listTicketsMock
    .mockRejectedValueOnce(
      new ApiError(503, 'storage_unavailable', 'Lagringen är tillfälligt otillgänglig.'),
    )
    .mockResolvedValueOnce([NEW_TICKET])
  render(<TicketListWithFilter />)

  const alert = await screen.findByRole('alert')
  expect(alert).toHaveTextContent('Ärendena kunde inte hämtas. Försök igen.')
  expect(screen.queryByText('Det finns inga ärenden ännu')).not.toBeInTheDocument()

  within(alert).getByRole('button', { name: 'Försök igen' }).click()

  expect(await screen.findByText('#2')).toBeInTheDocument()
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})
