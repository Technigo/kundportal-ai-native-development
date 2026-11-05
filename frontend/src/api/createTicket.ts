import type { Category, Priority, Ticket } from '../domain/ticket'
import { request } from './client'

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
