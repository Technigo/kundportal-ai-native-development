import type {
  ErrorResponse,
  Ticket,
  TicketCategory,
  TicketPriority,
} from "@/api/types"
import { BACKEND_UNREACHABLE } from "@/pages/HealthPage"

export type TicketResult = { state: "ok"; ticket: Ticket } | { state: "error"; message: string }

// Empty strings are an unselected category or priority (CORE-08). The API answers
// "Välj en giltig kategori." or "Välj en giltig prioritet." Status is never sent (CORE-09).
export type TicketDraft = {
  title: string
  description: string
  category: TicketCategory | ""
  priority: TicketPriority | ""
}

export async function createTicket(draft: TicketDraft): Promise<TicketResult> {
  try {
    const response = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: draft.title,
        description: draft.description,
        category: draft.category,
        priority: draft.priority,
      }),
    })
    if (response.ok) {
      return { state: "ok", ticket: (await response.json()) as Ticket }
    }
    const error = (await response.json()) as ErrorResponse
    return { state: "error", message: error.detail }
  } catch {
    return { state: "error", message: BACKEND_UNREACHABLE }
  }
}

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
