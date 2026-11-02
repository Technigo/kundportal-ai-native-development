import type {
  ErrorResponse,
  Ticket,
  TicketCategory,
  TicketCreate,
  TicketPriority,
} from "@/api/types"
import { BACKEND_UNREACHABLE } from "@/pages/HealthPage"

export type TicketResult = { state: "ok"; ticket: Ticket } | { state: "error"; message: string }

// Same fields as TicketCreate. Empty strings are an unselected category or priority
// (CORE-08). The API answers "Välj en giltig kategori." or "Välj en giltig prioritet."
// Status is not a field on TicketCreate, so it is never sent (CORE-09).
export type TicketDraft = Omit<TicketCreate, "category" | "priority"> & {
  category: TicketCategory | ""
  priority: TicketPriority | ""
}

// The return type is exactly the keys of TicketCreate, so a new schema field must be
// added here and status cannot be included (CORE-09).
function requestBody(draft: TicketDraft): { [K in keyof TicketCreate]: TicketDraft[K] } {
  return {
    title: draft.title,
    description: draft.description,
    category: draft.category,
    priority: draft.priority,
  }
}

export async function createTicket(draft: TicketDraft): Promise<TicketResult> {
  try {
    const response = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody(draft)),
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
