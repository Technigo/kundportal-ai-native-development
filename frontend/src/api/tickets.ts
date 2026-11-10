import type { Category, Priority, StatusFilter, Ticket } from '../domain/ticket'
import { request } from './client'

// Nyast först enligt API-kontraktet. null = Alla.
export function listTickets(status: StatusFilter): Promise<Ticket[]> {
  const query = status ? `?status=${encodeURIComponent(status)}` : ''
  return request<Ticket[]>(`/tickets${query}`)
}

// Klienten skickar aldrig id, status eller created_at (API-kontraktet)
export type NewTicket = {
  customer_id: string
  customer_name: string
  title: string
  description: string
  category: Category
  priority: Priority
}

export function createTicket(ticket: NewTicket): Promise<Ticket> {
  return request<Ticket>('/tickets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ticket),
  })
}
