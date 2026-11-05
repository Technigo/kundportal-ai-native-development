import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import { afterEach, describe, expect, it, vi } from "vitest"

import type { components } from "@/api/schema"
import { BACKEND_UNREACHABLE } from "@/api/errors"
import { formatLocalDateTime } from "@/lib/format"
import { expectNoTechnicalWords } from "@/test/technical-words"

import { TicketListPage } from "./TicketListPage"

// KSP-29: ticket list. CORE-03 keeps API order, CORE-15 empty list is a message.
type Ticket = components["schemas"]["Ticket"]

function ticket(overrides: Partial<Ticket> & Pick<Ticket, "id" | "title">): Ticket {
  return {
    description: "Den här texten ska inte synas i listan.",
    category: "billing",
    priority: "high",
    status: "new",
    created_at: "2026-10-25T09:00:00.701559Z",
    ...overrides,
  }
}

function mockTickets(tickets: Ticket[]) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => tickets,
    }),
  )
}

describe("Ticket list", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  // K1 point 1 (KSP-38, added by Amalia): a network error shows the Swedish text only,
  // never the browser's own error.
  it("K1: list network error shows no technical words", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")))
    render(
      <MemoryRouter>
        <TicketListPage />
      </MemoryRouter>,
    )

    expect(await screen.findByRole("alert")).toHaveTextContent(BACKEND_UNREACHABLE)
    expectNoTechnicalWords(document.body)
  })

  // TC7 in KSP-45 (KSP-38 AC2, added by Amalia): a 500 shows the message from the API,
  // not the empty list.
  it("TC7: list server error shows the message from the API", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ detail: "Något gick fel. Försök igen." }),
      }),
    )
    render(
      <MemoryRouter>
        <TicketListPage />
      </MemoryRouter>,
    )

    const alert = await screen.findByRole("alert")
    expect(alert).toHaveTextContent("Något gick fel. Försök igen.")
    expectNoTechnicalWords(alert)
    expect(screen.queryByText("Inga ärenden än")).not.toBeInTheDocument()
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument()
  })

  // CORE-03: the list shows tickets in the order the API returns.
  it("test_core03_keeps_the_order_from_the_api", async () => {
    const newer = ticket({
      id: 1,
      title: "Nyare ärende",
      created_at: "2026-10-25T09:00:00.000000Z",
    })
    const older = ticket({
      id: 5,
      title: "Äldre ärende",
      created_at: "2026-10-24T09:00:00.000000Z",
    })
    // Newest first, even though its id is lower. A sort by id would flip them.
    mockTickets([newer, older])

    render(
      <MemoryRouter>
        <TicketListPage />
      </MemoryRouter>,
    )

    const first = await screen.findByRole("heading", { name: "Nyare ärende" })
    const second = screen.getByRole("heading", { name: "Äldre ärende" })
    expect(
      first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(screen.getByRole("link", { name: /Nyare ärende/ })).toHaveAttribute(
      "href",
      "/tickets/1",
    )
  })

  // CORE-03: codes from the API are shown as the Swedish labels, never as codes.
  it("test_core03_shows_swedish_labels_not_codes", async () => {
    mockTickets([
      ticket({
        id: 1,
        title: "Fakturan har fel belopp",
        description: "Kunden har fått dubbel debitering för oktober.",
      }),
    ])

    render(
      <MemoryRouter>
        <TicketListPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText("Faktura och betalning")).toBeInTheDocument()
    expect(screen.getByText("Hög")).toBeInTheDocument()
    expect(screen.getByText("Nytt")).toBeInTheDocument()
    expect(screen.queryByText("billing")).not.toBeInTheDocument()
    expect(screen.queryByText("high")).not.toBeInTheDocument()
    expect(screen.queryByText("new")).not.toBeInTheDocument()
    expect(
      screen.queryByText("Kunden har fått dubbel debitering för oktober."),
    ).not.toBeInTheDocument()
    expect(
      screen.getByText(formatLocalDateTime("2026-10-25T09:00:00.701559Z")),
    ).toBeInTheDocument()
  })

  // CORE-15: an empty list is a message, not an error.
  it("test_core15_empty_list_shows_a_message_not_an_error", async () => {
    mockTickets([])

    render(
      <MemoryRouter>
        <TicketListPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText(/Inga ärenden/)).toBeInTheDocument()
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    expect(screen.queryByRole("link", { name: /ärende/ })).not.toBeInTheDocument()
  })

  // CORE-12: a title of exactly 100 characters is shown in full.
  it("test_core12_shows_a_title_of_100_characters", async () => {
    const title = "Å".repeat(100)
    mockTickets([ticket({ id: 1, title })])

    render(
      <MemoryRouter>
        <TicketListPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText(title)).toBeInTheDocument()
  })
})
