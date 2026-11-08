import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { axe } from "jest-axe"
import { createMemoryRouter, RouterProvider } from "react-router"
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest"

import { BACKEND_UNREACHABLE } from "@/api/errors"
import type { HistoryEntry, Ticket, TicketStatus } from "@/api/types"
import { TicketDetailPage } from "./ticket-detail-page"

// KSP-37 (the timeline in the detail view) against the whole detail view: where the timeline
// sits, how the history is fetched, fetched again after a status change, and what is shown
// on errors. HIST-05 (the timeline), HIST-08 (unknown ticket gives 404) and HIST-14 (errors in
// Swedish). How one entry looks is tested in components/ticket-timeline.test.tsx.

const HISTORY_ERROR = "Historiken kunde inte hämtas."
const LOADING_HISTORY = "Laddar historiken …"

// Made-up ticket and history, never real customer data.
const ticket5: Ticket = {
  id: 5,
  title: "Paketet kom aldrig fram",
  description: "Kunden väntar på en beställning från 12 oktober.",
  category: "delivery",
  priority: "high",
  status: "new",
  created_at: "2026-10-25T09:00:00.000000Z",
}

const created5: HistoryEntry = {
  id: 1,
  event_type: "created",
  from_status: null,
  to_status: "new",
  occurred_at: "2026-10-25T09:00:00.000000Z",
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

type Store = { tickets: Record<string, Ticket>; history: Record<string, HistoryEntry[]> }
type Answer = (store: Store) => Promise<Response>

// Answers like the backend. GET /tickets/{id} gives the ticket or 404. GET .../history gives
// the stored entries, oldest first. PATCH changes the status and adds an entry, as the
// backend does in one transaction (HIST-02). A test can replace the answer for the history
// or for PATCH, one call at a time.
function fakeBackend(overrides: { history: Answer[]; patch: Answer | null }): {
  fetchMock: Mock
  store: Store
} {
  const store: Store = { tickets: { "5": { ...ticket5 } }, history: { "5": [created5] } }
  const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
    const [, id, rest] = url.match(/^\/api\/tickets\/([^/]+)(\/.*)?$/) ?? []
    const ticket = store.tickets[id]
    if (ticket === undefined) return jsonResponse({ detail: "Ärendet finns inte." }, 404)
    if (rest === "/history") {
      const answer = overrides.history.shift()
      return answer ? answer(store) : jsonResponse(store.history[id])
    }
    if (init?.method === "PATCH") {
      if (overrides.patch) return overrides.patch(store)
      const { status } = JSON.parse(String(init.body)) as { status: TicketStatus }
      const entries = store.history[id]
      entries.push({
        id: entries.length + 1,
        event_type: "status_changed",
        from_status: ticket.status,
        to_status: status,
        occurred_at: "2026-10-25T10:00:00.000000Z",
      })
      store.tickets[id] = { ...ticket, status }
      return jsonResponse(store.tickets[id])
    }
    return jsonResponse(ticket)
  })
  return { fetchMock, store }
}

const neverAnswers: Answer = () => new Promise(() => {})
const answers500: Answer = async () => jsonResponse({ detail: "Något gick fel. Försök igen." }, 500)

function calls(fetchMock: Mock, path: string): number {
  return fetchMock.mock.calls.filter(
    (call) => call[0] === path && (call[1] as RequestInit | undefined)?.method === undefined,
  ).length
}

function renderAt(path: string) {
  const router = createMemoryRouter([{ path: "/tickets/:id", element: <TicketDetailPage /> }], {
    initialEntries: [path],
  })
  return render(<RouterProvider router={router} />)
}

function historyRegion(): HTMLElement {
  return screen.getByRole("region", { name: "Historik" })
}

// Waits for the region, since the ticket is fetched first and the history after it.
async function entryTexts(): Promise<string[]> {
  const region = await screen.findByRole("region", { name: "Historik" })
  const list = await within(region).findByRole("list")
  return within(list)
    .getAllByRole("listitem")
    .map((item) => item.textContent ?? "")
}

// Changes the status in the detail view, as a user would (KSP-32, status change).
async function saveStatus(user: ReturnType<typeof userEvent.setup>, label: string) {
  await user.click(await screen.findByRole("button", { name: "Ändra status" }))
  await user.selectOptions(screen.getByRole("combobox", { name: "Status" }), label)
  await user.click(screen.getByRole("button", { name: "Spara" }))
}

describe("Timeline in the detail view", () => {
  let backend: ReturnType<typeof fakeBackend>
  let overrides: { history: Answer[]; patch: Answer | null }

  beforeEach(() => {
    overrides = { history: [], patch: null }
    backend = fakeBackend(overrides)
    vi.stubGlobal("fetch", backend.fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  // KSP-37 AC5 (a place for the timeline under the ticket): a region with the heading
  // Historik (h2), after the ticket's card.
  it("KSP-37: the timeline is under the ticket with the heading Historik", async () => {
    renderAt("/tickets/5")

    const heading = await screen.findByRole("heading", { name: "Historik", level: 2 })
    const title = await screen.findByRole("heading", { name: /Paketet kom aldrig fram/, level: 1 })
    expect(title.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(await entryTexts()).toHaveLength(1)
  })

  // KSP-37 AC4 (a new entry shows without reloading the page).
  it("KSP-37: a saved status shows the new entry without reload", async () => {
    const user = userEvent.setup()
    renderAt("/tickets/5")
    await entryTexts()

    await saveStatus(user, "Pågående")

    await vi.waitFor(async () => expect(await entryTexts()).toHaveLength(2))
    expect((await entryTexts())[1]).toMatch(/Nytt.*Pågående/)
    expect(calls(backend.fetchMock, "/api/tickets/5/history")).toBe(2)
  })

  // KSP-37 AC4 and HIST-07 (the same status gives 409): someone else changed the status
  // first. The status form fetches the ticket again, and the timeline shows their entry.
  it("KSP-37: after a 409 the timeline shows the other change", async () => {
    const user = userEvent.setup()
    overrides.patch = async (store) => {
      store.history["5"].push({
        id: 2,
        event_type: "status_changed",
        from_status: "new",
        to_status: "closed",
        occurred_at: "2026-10-25T09:30:00.000000Z",
      })
      store.tickets["5"] = { ...store.tickets["5"], status: "closed" }
      return jsonResponse({ detail: "Ärendet har redan den statusen." }, 409)
    }
    renderAt("/tickets/5")
    await entryTexts()

    await saveStatus(user, "Avslutat")

    await vi.waitFor(async () => expect(await entryTexts()).toHaveLength(2))
    expect((await entryTexts())[1]).toMatch(/Nytt.*Avslutat/)
  })

  // KSP-37 AC4: when the change is rejected nothing has changed, so the history is not
  // fetched again (T7 in the timeline spec).
  it("KSP-37: a rejected change does not fetch the history again", async () => {
    const user = userEvent.setup()
    overrides.patch = async () => jsonResponse({ detail: "Statusen kunde inte ändras. Försök igen." }, 503)
    renderAt("/tickets/5")
    await entryTexts()

    await saveStatus(user, "Pågående")

    expect(await screen.findByText("Statusen kunde inte ändras. Försök igen.")).toBeInTheDocument()
    expect(calls(backend.fetchMock, "/api/tickets/5/history")).toBe(1)
  })

  // HIST-05: a skeleton while the history loads, read as "Laddar historiken …".
  it("HIST-05: a skeleton is shown while the history loads", async () => {
    overrides.history.push(neverAnswers)
    renderAt("/tickets/5")

    const loading = await screen.findByRole("status", { name: LOADING_HISTORY })
    expect(loading).toHaveAttribute("aria-busy", "true")
    expect(within(historyRegion()).queryByRole("list")).not.toBeInTheDocument()
  })

  // KSP-37 AC4: while the history is fetched again the old list stays, so nothing blinks
  // (M1 in the timeline spec: the short moment where it is behind the ticket is accepted).
  it("KSP-37: the old list stays while the history is fetched again", async () => {
    const user = userEvent.setup()
    renderAt("/tickets/5")
    await entryTexts()
    overrides.history.push(neverAnswers)

    await saveStatus(user, "Pågående")

    await vi.waitFor(() => expect(calls(backend.fetchMock, "/api/tickets/5/history")).toBe(2))
    expect(await entryTexts()).toHaveLength(1)
    expect(screen.queryByRole("status", { name: LOADING_HISTORY })).not.toBeInTheDocument()
  })

  // HIST-14 (errors in Swedish) and TC4 in KSP-45: the ticket is still shown, and the
  // timeline has its own message with a retry button instead of the detail from the API.
  it("HIST-14: a failed history shows the ticket and a retry button", async () => {
    overrides.history.push(answers500)
    renderAt("/tickets/5")

    expect(await screen.findByRole("heading", { name: /Paketet kom aldrig fram/ })).toBeInTheDocument()
    const alert = await within(historyRegion()).findByRole("alert")
    expect(alert).toHaveTextContent(HISTORY_ERROR)
    expect(within(alert).getByRole("button", { name: "Försök igen" })).toBeInTheDocument()
    expect(alert).not.toHaveTextContent("Något gick fel")
  })

  // HIST-14: no answer at all gives the same message, not the shared network text.
  it("HIST-14: no answer for the history shows the same message", async () => {
    overrides.history.push(async () => {
      throw new TypeError("Failed to fetch")
    })
    renderAt("/tickets/5")

    const alert = await within(await screen.findByRole("region", { name: "Historik" })).findByRole("alert")
    expect(alert).toHaveTextContent(HISTORY_ERROR)
    expect(alert).not.toHaveTextContent(BACKEND_UNREACHABLE)
    expect(alert).not.toHaveTextContent(/Failed to fetch/)
  })

  // HIST-14: an answer that is not a list is not a readable history either. The view must not
  // crash: the ticket is shown and the timeline has its message (found when an old test fake
  // answered the history with the ticket).
  it("HIST-14: a history answer that is not a list shows the message", async () => {
    overrides.history.push(async (store) => jsonResponse(store.tickets["5"]))
    renderAt("/tickets/5")

    expect(await screen.findByRole("heading", { name: /Paketet kom aldrig fram/ })).toBeInTheDocument()
    const alert = await within(await screen.findByRole("region", { name: "Historik" })).findByRole("alert")
    expect(alert).toHaveTextContent(HISTORY_ERROR)
  })

  // HIST-14: the retry button fetches only the history, not the ticket.
  it("HIST-14: retry fetches only the history", async () => {
    const user = userEvent.setup()
    overrides.history.push(answers500)
    renderAt("/tickets/5")
    const alert = await within(await screen.findByRole("region", { name: "Historik" })).findByRole("alert")

    await user.click(within(alert).getByRole("button", { name: "Försök igen" }))

    expect(await entryTexts()).toHaveLength(1)
    expect(within(historyRegion()).queryByRole("alert")).not.toBeInTheDocument()
    expect(calls(backend.fetchMock, "/api/tickets/5")).toBe(1)
    expect(calls(backend.fetchMock, "/api/tickets/5/history")).toBe(2)
  })

  // HIST-14: after a click on "Försök igen" the skeleton shows until the answer comes, so the
  // case worker sees that something happens, and the button cannot be clicked again meanwhile
  // (Mustafa's review of PR #109).
  it("HIST-14: retry shows the skeleton while the history is fetched again", async () => {
    const user = userEvent.setup()
    overrides.history.push(answers500, neverAnswers)
    renderAt("/tickets/5")
    const alert = await within(await screen.findByRole("region", { name: "Historik" })).findByRole("alert")

    await user.click(within(alert).getByRole("button", { name: "Försök igen" }))

    expect(await screen.findByRole("status", { name: LOADING_HISTORY })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Försök igen" })).not.toBeInTheDocument()
  })

  // HIST-14: when the history fails after a status change, the error replaces the old list,
  // so a list that is behind the ticket is never shown (M2 in the timeline spec).
  it("HIST-14: a failed refetch replaces the old list with the error", async () => {
    const user = userEvent.setup()
    renderAt("/tickets/5")
    await entryTexts()
    overrides.history.push(answers500)

    await saveStatus(user, "Pågående")

    const alert = await within(historyRegion()).findByRole("alert")
    expect(alert).toHaveTextContent(HISTORY_ERROR)
    expect(within(historyRegion()).queryByRole("list")).not.toBeInTheDocument()
  })

  // HIST-08 (unknown ticket gives 404): the detail view shows its message once, with the
  // link back (KSP-38 AC4), and no timeline.
  it("HIST-08: an unknown ticket shows one message and no timeline", async () => {
    renderAt("/tickets/999")

    expect(await screen.findAllByText("Ärendet finns inte.")).toHaveLength(1)
    expect(screen.getByRole("link", { name: "Tillbaka till ärendelistan" })).toBeInTheDocument()
    expect(screen.queryByRole("heading", { name: "Historik" })).not.toBeInTheDocument()
  })

  // HIST-08: the history is fetched only after the ticket has come with 200 (T12 in the
  // timeline spec), so an unknown ticket never asks for its history.
  it("HIST-08: the history is not fetched for an unknown ticket", async () => {
    renderAt("/tickets/999")

    await screen.findByText("Ärendet finns inte.")
    expect(calls(backend.fetchMock, "/api/tickets/999/history")).toBe(0)
  })

  // KSP-38 AC3 (accessible error messages) and TC5 in KSP-45: no accessibility errors with
  // three entries and with the error. The list is a list for screen readers (role list), as
  // BOLDkit's timeline is only div elements.
  it("KSP-38: the timeline and its error have no accessibility errors", async () => {
    backend.store.history["5"].push(
      {
        id: 2,
        event_type: "status_changed",
        from_status: "new",
        to_status: "in_progress",
        occurred_at: "2026-10-25T09:05:00.000000Z",
      },
      {
        id: 3,
        event_type: "status_changed",
        from_status: "in_progress",
        to_status: "waiting_on_customer",
        occurred_at: "2026-10-25T09:10:00.000000Z",
      },
    )
    backend.store.tickets["5"] = { ...ticket5, status: "waiting_on_customer" }
    const first = renderAt("/tickets/5")
    expect(await entryTexts()).toHaveLength(3)
    expect(await axe(first.container)).toHaveNoViolations()
    first.unmount()

    overrides.history.push(answers500)
    const second = renderAt("/tickets/5")
    await within(await screen.findByRole("region", { name: "Historik" })).findByRole("alert")
    expect(await axe(second.container)).toHaveNoViolations()
  })
})
