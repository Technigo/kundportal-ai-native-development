import type { StatusFilter, Ticket } from '../domain/ticket'
import { request } from './client'

// Nyast först enligt API-kontraktet. null = Alla.
export function listTickets(status: StatusFilter): Promise<Ticket[]> {
  const query = status ? `?status=${encodeURIComponent(status)}` : ''
  return request<Ticket[]>(`/tickets${query}`)
}
