import type {
  HistoryEntry,
  Ticket,
  TicketCategory,
  TicketCreate,
  TicketPriority,
  TicketStatus,
} from "@/api/types"
import { toResult } from "@/api/result"

// httpStatus is missing only when no answer came at all (fetch failed). An answer without a
// readable detail, such as a 502 from the dev proxy when the backend is down, has httpStatus.
export type TicketResult =
  | { state: "ok"; ticket: Ticket }
  | { state: "error"; message: string; httpStatus?: number }

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

// Ticket endpoints answer with the ticket, or with {"detail": "<Swedish message>"} on
// errors (KSP-31 AC7). toResult owns the error rules (KSP-79), so this only names the data.
async function toTicketResult(request: Promise<Response>): Promise<TicketResult> {
  const result = await toResult<Ticket>(request)
  return result.state === "ok" ? { state: "ok", ticket: result.data } : result
}

// The list keeps the API order (CORE-03). Errors follow the same rules as the ticket
// client, through toResult (KSP-79).
export type TicketListResult =
  | { state: "ok"; tickets: Ticket[] }
  | { state: "error"; message: string; httpStatus?: number }

export async function fetchTickets(): Promise<TicketListResult> {
  const result = await toResult<Ticket[]>(fetch("/api/tickets"))
  return result.state === "ok" ? { state: "ok", tickets: result.data } : result
}

export function createTicket(draft: TicketDraft): Promise<TicketResult> {
  return toTicketResult(
    fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody(draft)),
    })
  )
}

// Fetches one ticket through the Vite proxy (CORE-04). The id is sent as it is, also when it
// is not an integer: the backend answers 404 "Ärendet finns inte." for both (CORE-10, B8).
export function fetchTicket(id: string): Promise<TicketResult> {
  return toTicketResult(fetch(`/api/tickets/${encodeURIComponent(id)}`))
}

// The history of a ticket, oldest first (HIST-03), for the timeline in KSP-37. Any error,
// with or without an answer, is just "error": the timeline shows its own message and not
// the detail from the API (an exception decided in KSP-38, error messages in the UI).
// An answer that is not a list is an error too, so the timeline never crashes the view.
export type HistoryResult = { state: "ok"; entries: HistoryEntry[] } | { state: "error" }

export async function fetchHistory(id: string): Promise<HistoryResult> {
  try {
    const response = await fetch(`/api/tickets/${encodeURIComponent(id)}/history`)
    if (!response.ok) return { state: "error" }
    const body: unknown = await response.json()
    return Array.isArray(body) ? { state: "ok", entries: body as HistoryEntry[] } : { state: "error" }
  } catch {
    return { state: "error" }
  }
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
