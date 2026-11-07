import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import type { HistoryEntry } from "@/api/types"
import { TicketTimeline } from "./ticket-timeline"

// KSP-37 (the timeline in the detail view): how a list of history entries is shown.
// HIST-05 (each entry shows the status change with Swedish labels and the local time, and the
// latest entry matches the ticket's status). Fetching, errors and the place in the detail
// view are tested against the whole page in pages/ticket-timeline.test.tsx.
// The test setup fixes the time zone to Europe/Stockholm (vite.config.ts).

// Made-up history, never real customer data.
const created: HistoryEntry = {
  id: 1,
  event_type: "created",
  from_status: null,
  to_status: "new",
  occurred_at: "2026-10-25T09:00:00.000000Z",
}

function changed(id: number, from: HistoryEntry["to_status"], to: HistoryEntry["to_status"], at: string): HistoryEntry {
  return { id, event_type: "status_changed", from_status: from, to_status: to, occurred_at: at }
}

const threeEntries: HistoryEntry[] = [
  created,
  changed(2, "new", "in_progress", "2026-10-25T09:05:00.000000Z"),
  changed(3, "in_progress", "waiting_on_customer", "2026-10-25T09:10:00.000000Z"),
]

function entries(): HTMLElement[] {
  return within(screen.getByRole("list")).getAllByRole("listitem")
}

describe("TicketTimeline", () => {
  // HIST-12 (a ticket without status changes has exactly one entry, created) and TC3 in
  // KSP-45 (component tests for the timeline): created is shown as an event, not a change.
  it("HIST-05: a new ticket shows one entry, created", () => {
    render(<TicketTimeline entries={[created]} />)

    const [entry, ...rest] = entries()
    expect(rest).toHaveLength(0)
    expect(entry).toHaveTextContent("Ärendet skapades")
    expect(entry).toHaveTextContent("Status: Nytt")
    // 09:00 UTC is 10:00 in Stockholm on 2026-10-25 (winter time from that night).
    expect(within(entry).getByText("2026-10-25 10:00").tagName).toBe("TIME")
    expect(within(entry).getByText("2026-10-25 10:00")).toHaveAttribute("datetime", created.occurred_at)
    expect(entry).not.toHaveTextContent("→")
  })

  // HIST-03 (oldest first) and TC1 in KSP-45: Swedish labels, never the codes.
  it("HIST-05: entries are shown oldest first with Swedish labels", () => {
    render(<TicketTimeline entries={threeEntries} />)

    const [first, second, third] = entries()
    expect(entries()).toHaveLength(3)
    expect(first).toHaveTextContent("Ärendet skapades")
    expect(second.textContent).toMatch(/Nytt.*→.*Pågående/)
    expect(third.textContent).toMatch(/Pågående.*→.*Väntar på kund/)
    expect(screen.getByRole("list")).not.toHaveTextContent(/\b(new|in_progress|waiting_on_customer)\b/)
  })

  // TC2 in KSP-45: only the latest entry is marked, also for screen readers (WCAG 1.4.1, the
  // mark is not only a colour).
  it("HIST-05: the latest entry is marked as the current status", () => {
    render(<TicketTimeline entries={threeEntries} />)

    const [first, second, third] = entries()
    expect(third).toHaveAttribute("data-status", "current")
    expect(third).toHaveTextContent("(aktuell status)")
    for (const earlier of [first, second]) {
      expect(earlier).toHaveAttribute("data-status", "completed")
      expect(earlier).not.toHaveTextContent("(aktuell status)")
    }
  })

  // The arrow is hidden from screen readers, which read "Nytt till Pågående" instead.
  it("HIST-05: the arrow is hidden and \"till\" is read instead", () => {
    render(<TicketTimeline entries={threeEntries} />)

    const second = entries()[1]
    expect(within(second).getByText("→")).toHaveAttribute("aria-hidden", "true")
    const till = within(second).getByText("till")
    expect(till).toHaveClass("sr-only")
    expect(second.textContent).toMatch(/Nytt.*till.*Pågående/)
  })

  // T2 in the timeline spec: the UI keeps the order from the API (HIST-03, HIST-11) and does
  // not sort. The data has a later time before an earlier one, which the backend never sends,
  // so that any sort would change the order.
  it("HIST-03: entries keep the API order, also when a sort would change it", () => {
    render(
      <TicketTimeline
        entries={[
          created,
          changed(3, "new", "in_progress", "2026-10-25T09:10:00.000000Z"),
          changed(2, "in_progress", "waiting_on_customer", "2026-10-25T09:05:00.000000Z"),
        ]}
      />,
    )

    const [first, second, third] = entries()
    expect(first).toHaveTextContent("Ärendet skapades")
    expect(second.textContent).toMatch(/Nytt.*Pågående/)
    expect(third.textContent).toMatch(/Pågående.*Väntar på kund/)
  })
})
