import type { components } from "@/api/schema"

// KSP-77: client-side filters on the list from GET /tickets. No new request.

type Ticket = components["schemas"]["Ticket"]
type Category = components["schemas"]["Category"]
type Priority = components["schemas"]["Priority"]
type Status = components["schemas"]["Status"]

export type TicketListFilters = {
  query: string
  status: Status | ""
  priority: Priority | ""
  category: Category | ""
}

// Search matches ticket id and title only. Comparison ignores case.
// Status, priority and category all have to match when they are set.
export function filterTickets(
  tickets: Ticket[],
  filters: TicketListFilters,
): Ticket[] {
  const query = filters.query.trim().toLocaleLowerCase("sv")

  return tickets.filter((ticket) => {
    if (filters.status !== "" && ticket.status !== filters.status) return false
    if (filters.priority !== "" && ticket.priority !== filters.priority) {
      return false
    }
    if (filters.category !== "" && ticket.category !== filters.category) {
      return false
    }
    if (query === "") return true

    const title = ticket.title.toLocaleLowerCase("sv")
    return String(ticket.id).includes(query) || title.includes(query)
  })
}

export function matchCountLabel(count: number): string {
  return count === 1 ? "Visar 1 ärende" : `Visar ${count} ärenden`
}
