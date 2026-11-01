import { act, render, screen } from "@testing-library/react"
import { createMemoryRouter, RouterProvider } from "react-router"
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest"

import type { Ticket } from "@/api/types"
import { BACKEND_UNREACHABLE } from "@/pages/HealthPage"
import { TicketDetailPage } from "./ticket-detail-page"

// Made-up tickets, never real customer data.
const ticket5: Ticket = {
  id: 5,
  title: "Paketet kom aldrig fram",
  description: "Kunden väntar på en beställning från 12 oktober.\nSpårningen har inte uppdaterats.",
  category: "delivery",
  priority: "high",
  status: "in_progress",
  created_at: "2026-10-25T09:00:00.000000Z",
}

const ticket6: Ticket = {
  id: 6,
  title: "Fel belopp på fakturan",
  description: "Kunden har debiterats två gånger för oktober.",
  category: "billing",
  priority: "medium",
  status: "new",
  created_at: "2026-10-26T14:30:00.000000Z",
}

const LOADING = "Laddar ärendet …"

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

// Answers like the backend: 200 with the ticket, or 404 with the Swedish detail (CORE-10).
function fakeBackend(): Mock {
  const tickets: Record<string, Ticket> = { "5": ticket5, "6": ticket6 }
  return vi.fn(async (url: string) => {
    const id = url.replace("/api/tickets/", "")
    const found = tickets[id]
    return found ? jsonResponse(found) : jsonResponse({ detail: "Ärendet finns inte." }, 404)
  })
}

// Renders the page on its route, as in App.tsx (KSP-31 AC5: /tickets/{id} with react-router).
function renderAt(path: string) {
  const router = createMemoryRouter([{ path: "/tickets/:id", element: <TicketDetailPage /> }], {
    initialEntries: [path],
  })
  render(<RouterProvider router={router} />)
  return router
}

function requestedUrls(fetchMock: Mock): string[] {
  return fetchMock.mock.calls.map((call) => call[0] as string)
}

describe("TicketDetailPage", () => {
  let fetchMock: Mock

  beforeEach(() => {
    fetchMock = fakeBackend()
    vi.stubGlobal("fetch", fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  // The two loading tests have no CORE or HIST id: they test AC4 in KSP-31 (a skeleton
  // while the ticket loads), a decision made without a frontend spec.
  it("KSP-31: shows a loading skeleton while the ticket loads", () => {
    fetchMock.mockReturnValue(new Promise(() => {}))
    renderAt("/tickets/5")

    const loading = screen.getByRole("status", { name: LOADING })
    expect(loading).toHaveAttribute("aria-busy", "true")
    expect(loading.querySelector('[aria-hidden="true"]')).not.toBeNull()
    expect(screen.queryByText(ticket5.title)).not.toBeInTheDocument()
  })

  it("KSP-31: loading skeleton disappears when the ticket has loaded", async () => {
    renderAt("/tickets/5")

    expect(await screen.findByText(ticket5.title)).toBeInTheDocument()
    expect(screen.queryByRole("status", { name: LOADING })).not.toBeInTheDocument()
  })

  it("CORE-04: requests the ticket with the id from the URL", async () => {
    renderAt("/tickets/5")

    await screen.findByText(ticket5.title)
    expect(requestedUrls(fetchMock)).toEqual(["/api/tickets/5"])
  })

  it("CORE-04: loads the new ticket when the URL changes", async () => {
    const router = renderAt("/tickets/5")
    await screen.findByText(ticket5.title)

    // Same as following a link or pressing the back button.
    await act(() => router.navigate("/tickets/6"))

    expect(await screen.findByText(ticket6.title)).toBeInTheDocument()
    expect(requestedUrls(fetchMock)).toContain("/api/tickets/6")
    expect(screen.queryByText(ticket5.title)).not.toBeInTheDocument()
  })

  it("CORE-04: shows title, description and id", async () => {
    renderAt("/tickets/5")

    expect(await screen.findByText(ticket5.title)).toBeInTheDocument()
    expect(screen.getByText(/Kunden väntar på en beställning/)).toBeInTheDocument()
    expect(screen.getByText(/#5\b/)).toBeInTheDocument()
  })

  it("CORE-04: shows Swedish labels, never codes", async () => {
    renderAt("/tickets/5")

    await screen.findByText(ticket5.title)
    expect(screen.getByText("Leverans")).toBeInTheDocument()
    expect(screen.getByText("Hög")).toBeInTheDocument()
    expect(screen.getByText("Pågående")).toBeInTheDocument()
    expect(document.body).not.toHaveTextContent(/delivery|in_progress|\bhigh\b/)
  })

  it("CORE-04: shows created_at in local time", async () => {
    // The test setup fixes the time zone to Europe/Stockholm. Daylight saving time ended
    // the night before, so 09:00 UTC is 10:00 local time. Format YYYY-MM-DD HH:MM (KSP-31 AC6).
    renderAt("/tickets/5")

    await screen.findByText(ticket5.title)
    expect(screen.getByText("2026-10-25 10:00")).toBeInTheDocument()
    expect(document.body).not.toHaveTextContent(/09:00/)
    expect(document.body).not.toHaveTextContent(ticket5.created_at)
  })

  it("CORE-04: shows the description exactly as saved", async () => {
    renderAt("/tickets/5")

    await screen.findByText(ticket5.title)
    // getByText collapses whitespace, so the line break is checked on textContent.
    const description = screen.getByText(/Kunden väntar på en beställning/)
    expect(description.textContent).toBe(ticket5.description)
  })

  it("CORE-10: unknown ticket shows the message from the API", async () => {
    renderAt("/tickets/999")

    expect(await screen.findByText("Ärendet finns inte.")).toBeInTheDocument()
    expect(screen.queryByText("Kategori")).not.toBeInTheDocument()
    expect(screen.queryByRole("status", { name: LOADING })).not.toBeInTheDocument()
  })

  it("CORE-10: non-integer id is sent to the API and shows the message", async () => {
    renderAt("/tickets/abc")

    expect(await screen.findByText("Ärendet finns inte.")).toBeInTheDocument()
    expect(requestedUrls(fetchMock)).toEqual(["/api/tickets/abc"])
  })

  it("HIST-14: network error shows the shared message in an alert", async () => {
    // Same text as the ticket list until KSP-38 (error messages in the UI) decides.
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"))
    renderAt("/tickets/5")

    expect(await screen.findByRole("alert")).toHaveTextContent(BACKEND_UNREACHABLE)
    expect(document.body).not.toHaveTextContent(/Failed to fetch/)
  })

  it("HIST-14: server error shows the detail from the API in an alert", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ detail: "Något gick fel. Försök igen." }, 500))
    renderAt("/tickets/5")

    expect(await screen.findByRole("alert")).toHaveTextContent("Något gick fel. Försök igen.")
    expect(screen.queryByText("Kategori")).not.toBeInTheDocument()
  })
})
