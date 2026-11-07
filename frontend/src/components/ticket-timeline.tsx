import type { HistoryEntry } from "@/api/types"

// KSP-37 (the timeline in the detail view, HIST-05): the ticket's history as a list.
// Not built yet. The tests in ticket-timeline.test.tsx are written first.
export function TicketTimeline({ entries }: { entries: HistoryEntry[] }) {
  void entries
  return null
}
