import type { ErrorResponse, Ticket } from "@/api/types"
import { BACKEND_UNREACHABLE } from "@/pages/HealthPage"

export type TicketResult = { state: "ok"; ticket: Ticket } | { state: "error"; message: string }

// Fetches one ticket through the Vite proxy (CORE-04). The id is sent as it is, also when it
// is not an integer: the backend answers 404 "Ärendet finns inte." for both (CORE-10, B8).
export async function fetchTicket(id: string): Promise<TicketResult> {
  try {
    const response = await fetch(`/api/tickets/${encodeURIComponent(id)}`)
    if (response.ok) {
      return { state: "ok", ticket: (await response.json()) as Ticket }
    }
    // On errors the backend always responds with {"detail": "<Swedish message>"} (KSP-31 AC7).
    const error = (await response.json()) as ErrorResponse
    return { state: "error", message: error.detail }
  } catch {
    // Same text as the ticket list until the error messages in the UI are decided (KSP-38).
    return { state: "error", message: BACKEND_UNREACHABLE }
  }
}
