import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { ApiError } from '../../api/client'
import { createTicket } from '../../api/tickets'
import type { Ticket } from '../../domain/ticket'
import { TicketForm } from './TicketForm'

vi.mock('../../api/tickets', () => ({ createTicket: vi.fn() }))
const createTicketMock = vi.mocked(createTicket)

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

const CREATED: Ticket = {
  id: 42,
  customer_id: 'K-104',
  customer_name: 'Exempelkund',
  title: 'Fråga om faktura',
  description: 'Jag behöver hjälp med en påhittad faktura.',
  category: 'billing',
  priority: 'normal',
  status: 'new',
  created_at: '2026-10-31T22:08:34.123456Z',
}

function type(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } })
}

function fillValid() {
  type('Kund-ID', '  K-104  ')
  type('Kundnamn', 'Exempelkund')
  type('Rubrik', 'Fråga om faktura')
  type('Beskrivning', 'Jag behöver hjälp med en påhittad faktura.')
  type('Kategori', 'billing')
  type('Prioritet', 'normal')
}

function submit() {
  fireEvent.click(screen.getByRole('button', { name: 'Spara ärende' }))
}

function apiError(status: number, code: string, fields?: Record<string, string[]>) {
  return new ApiError(status, code, 'Teknisk text från servern', fields)
}

it('sends the trimmed payload without id, status or created_at and clears the form', async () => {
  createTicketMock.mockResolvedValue(CREATED)
  const onCreated = vi.fn()
  render(<TicketForm onCreated={onCreated} />)

  fillValid()
  submit()

  expect(await screen.findByRole('status')).toHaveTextContent('Ärendet har sparats som #42')
  expect(createTicketMock).toHaveBeenCalledTimes(1)
  expect(createTicketMock).toHaveBeenCalledWith({
    customer_id: 'K-104',
    customer_name: 'Exempelkund',
    title: 'Fråga om faktura',
    description: 'Jag behöver hjälp med en påhittad faktura.',
    category: 'billing',
    priority: 'normal',
  })
  expect(onCreated).toHaveBeenCalledWith(CREATED)
  expect(screen.getByLabelText('Rubrik')).toHaveValue('')
})

it('shows a field error at each empty required field and sends nothing', () => {
  render(<TicketForm onCreated={vi.fn()} />)

  type('Rubrik', '   ')
  submit()

  expect(createTicketMock).not.toHaveBeenCalled()
  const title = screen.getByLabelText('Rubrik')
  expect(title).toHaveAttribute('aria-invalid', 'true')
  expect(title).toHaveAccessibleDescription(/Ange en rubrik/)
  expect(screen.getByText('Ange kund-ID')).toBeInTheDocument()
  expect(screen.getByText('Ange en beskrivning')).toBeInTheDocument()
  expect(screen.getByText('Välj en kategori')).toBeInTheDocument()
  expect(screen.getByText('Välj en prioritet')).toBeInTheDocument()
})

it('moves focus to the first field with an error when client validation fails', () => {
  render(<TicketForm onCreated={vi.fn()} />)

  type('Kund-ID', 'K-104')
  submit()

  expect(screen.getByLabelText('Kundnamn')).toHaveFocus()
})

it('moves focus to the field with the backend error on 422', async () => {
  createTicketMock.mockRejectedValue(
    apiError(422, 'validation_error', { title: ['Ogiltig rubrik.'] }),
  )
  render(<TicketForm onCreated={vi.fn()} />)
  fillValid()
  submit()

  await screen.findByText('Ogiltig rubrik.')
  await waitFor(() => expect(screen.getByLabelText('Rubrik')).toHaveFocus())
})

it('rejects a title of 101 characters but keeps what the user typed', () => {
  render(<TicketForm onCreated={vi.fn()} />)
  fillValid()
  type('Rubrik', 'a'.repeat(101))
  submit()

  expect(createTicketMock).not.toHaveBeenCalled()
  expect(screen.getByText('Rubriken får innehålla högst 100 tecken')).toBeInTheDocument()
  expect(screen.getByLabelText('Rubrik')).toHaveValue('a'.repeat(101))
  expect(screen.getByLabelText('Kundnamn')).toHaveValue('Exempelkund')
})

it('accepts a title of exactly 100 characters', async () => {
  createTicketMock.mockResolvedValue(CREATED)
  render(<TicketForm onCreated={vi.fn()} />)
  fillValid()
  type('Rubrik', 'a'.repeat(100))
  submit()

  await waitFor(() => expect(createTicketMock).toHaveBeenCalledTimes(1))
})

it('shows a character counter that counts code points after trimming', () => {
  render(<TicketForm onCreated={vi.fn()} />)
  type('Rubrik', ' 😀😀 ')

  expect(screen.getByText('2 / 100 tecken')).toBeInTheDocument()
})

it('shows the backend field error at the right field and keeps the input on 422', async () => {
  createTicketMock.mockRejectedValue(
    apiError(422, 'validation_error', { customer_id: ['Ogiltigt kund-ID.'] }),
  )
  render(<TicketForm onCreated={vi.fn()} />)
  fillValid()
  submit()

  expect(await screen.findByText('Ogiltigt kund-ID.')).toBeInTheDocument()
  expect(screen.getByLabelText('Kund-ID')).toHaveAttribute('aria-invalid', 'true')
  expect(screen.getByLabelText('Kund-ID')).toHaveValue('  K-104  ')
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
})

it('does not show "saved" on storage_unavailable and keeps the input', async () => {
  createTicketMock.mockRejectedValue(apiError(503, 'storage_unavailable'))
  const onCreated = vi.fn()
  render(<TicketForm onCreated={onCreated} />)
  fillValid()
  submit()

  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Ändringen kunde inte sparas. Försök igen.',
  )
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
  expect(onCreated).not.toHaveBeenCalled()
  expect(screen.getByLabelText('Rubrik')).toHaveValue('Fråga om faktura')
})

it.each([
  ['save_outcome_unknown', apiError(500, 'save_outcome_unknown')],
  ['network_error', new ApiError(null, 'network_error', 'Servern kunde inte nås.')],
])('says it could not be confirmed on %s and does not resend', async (_code, error) => {
  createTicketMock.mockRejectedValue(error)
  render(<TicketForm onCreated={vi.fn()} />)
  fillValid()
  submit()

  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Det gick inte att bekräfta att ändringen sparades',
  )
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
  expect(screen.getByLabelText('Rubrik')).toHaveValue('Fråga om faktura')
  // Ingen automatisk omsändning
  expect(createTicketMock).toHaveBeenCalledTimes(1)
})

it('disables the submit button while saving so a double click creates one ticket', async () => {
  let resolve: (ticket: Ticket) => void = () => {}
  createTicketMock.mockReturnValue(new Promise((r) => (resolve = r)))
  render(<TicketForm onCreated={vi.fn()} />)
  fillValid()

  submit()
  const button = await screen.findByRole('button', { name: 'Sparar …' })
  expect(button).toBeDisabled()
  fireEvent.click(button)
  expect(createTicketMock).toHaveBeenCalledTimes(1)

  resolve(CREATED)
  expect(await screen.findByRole('status')).toBeInTheDocument()
})

it('calls onCancel from the cancel button', () => {
  const onCancel = vi.fn()
  render(<TicketForm onCreated={vi.fn()} onCancel={onCancel} />)

  fireEvent.click(screen.getByRole('button', { name: 'Avbryt' }))

  expect(onCancel).toHaveBeenCalledTimes(1)
})
