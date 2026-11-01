import type { ErrorResponse, Ticket, TicketStatus } from "@/api/types"
import { BACKEND_UNREACHABLE } from "@/pages/HealthPage"

// httpStatus is missing when the backend could not be reached.
export type TicketResult =
  | { state: "ok"; ticket: Ticket }
  | { state: "error"; message: string; httpStatus?: number }

// Both endpoints answer with the ticket, or with {"detail": "<Swedish message>"} on errors
// (KSP-31 AC7). The detail is shown as it is.
async function toTicketResult(request: Promise<Response>): Promise<TicketResult> {
  try {
    const response = await request
    if (response.ok) {
      return { state: "ok", ticket: (await response.json()) as Ticket }
    }
    const error = (await response.json()) as ErrorResponse
    return { state: "error", message: error.detail, httpStatus: response.status }
  } catch {
    // Same text as the ticket list until the error messages in the UI are decided (KSP-38).
    return { state: "error", message: BACKEND_UNREACHABLE }
  }
}

// Fetches one ticket through the Vite proxy (CORE-04). The id is sent as it is, also when it
// is not an integer: the backend answers 404 "Ärendet finns inte." for both (CORE-10, B8).
export function fetchTicket(id: string): Promise<TicketResult> {
  return toTicketResult(fetch(`/api/tickets/${encodeURIComponent(id)}`))
}

// Changes the status (KSP-32). The code is sent, never the label, and the answer is the
// ticket with its new status (HIST-02). The rules are checked by the API (HIST-06, 07, 13).
export function changeTicketStatus(id: number, status: TicketStatus): Promise<TicketResult> {
  return toTicketResult(
    fetch(`/api/tickets/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
  )
}
