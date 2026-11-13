import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router"
import { afterEach, describe, expect, it, vi } from "vitest"

import type { components } from "@/api/schema"
import { BACKEND_UNREACHABLE } from "@/api/errors"
import { formatLocalDateTime } from "@/lib/format"
import { categoryLabels, priorityLabels, statusLabels } from "@/labels"
import { expectNoTechnicalWords } from "@/test/technical-words"

import { TicketListPage } from "./TicketListPage"

// KSP-29: ticket list. CORE-03 keeps API order, CORE-15 empty list is a message.
// KSP-77: status, priority and category filters combine with search on id and title.
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

function renderPage() {
  render(
    <MemoryRouter>
      <TicketListPage />
    </MemoryRouter>,
  )
}

describe("Ticket list", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  // HIST-14 (errors in Swedish without technical details), added by Amalia for KSP-38
  // (error messages in the UI): a network error shows the Swedish text only,
  // never the browser's own error.
  it("HIST-14: list network error shows no technical words", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")))
    render(
      <MemoryRouter>
        <TicketListPage />
      </MemoryRouter>,
    )

    expect(await screen.findByRole("alert")).toHaveTextContent(BACKEND_UNREACHABLE)
    expectNoTechnicalWords(screen.getByRole("alert"))
  })

  // KSP-38 AC2 (network errors and 500 give a Swedish message), added by Amalia: a 500 shows
  // the message from the API,
  // not the empty list.
  it("KSP-38: list server error shows the message from the API", async () => {
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
    // The list is a table since KSP-77 (search and filter in the ticket table).
    expect(screen.queryByRole("table")).not.toBeInTheDocument()
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

    renderPage()

    const rows = await screen.findAllByRole("row")
    expect(rows[1]).toHaveTextContent("Nyare ärende")
    expect(rows[2]).toHaveTextContent("Äldre ärende")
    expect(
      rows[1].compareDocumentPosition(rows[2]) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(screen.getByRole("link", { name: "Nyare ärende" })).toHaveAttribute(
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

    renderPage()

    expect(
      await screen.findByRole("cell", { name: "Faktura och betalning" }),
    ).toBeInTheDocument()
    expect(screen.getByRole("cell", { name: "Hög" })).toBeInTheDocument()
    expect(screen.getByRole("cell", { name: "Nytt" })).toBeInTheDocument()
    expect(screen.queryByText("billing")).not.toBeInTheDocument()
    expect(screen.queryByText("high")).not.toBeInTheDocument()
    expect(screen.queryByText("new")).not.toBeInTheDocument()
    expect(
      screen.queryByText("Kunden har fått dubbel debitering för oktober."),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole("cell", {
        name: formatLocalDateTime("2026-10-25T09:00:00.701559Z"),
      }),
    ).toBeInTheDocument()
  })

  // CORE-15: an empty list is a message, not an error.
  it("test_core15_empty_list_shows_a_message_not_an_error", async () => {
    mockTickets([])

    renderPage()

    expect(await screen.findByText(/Inga ärenden än/)).toBeInTheDocument()
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    expect(screen.queryByRole("link", { name: /ärende/ })).not.toBeInTheDocument()
    expect(screen.queryByRole("textbox", { name: "Sök ärenden" })).not.toBeInTheDocument()
  })

  // CORE-12: a title of exactly 100 characters is shown in full.
  it("test_core12_shows_a_title_of_100_characters", async () => {
    const title = "Å".repeat(100)
    mockTickets([ticket({ id: 1, title })])

    renderPage()

    expect(await screen.findByRole("link", { name: title })).toBeInTheDocument()
  })
})

describe("Ticket list filters", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  const tickets = [
    ticket({
      id: 12,
      title: "Fakturan stämmer inte",
      category: "billing",
      priority: "high",
      status: "new",
    }),
    ticket({
      id: 2,
      title: "Sen leverans",
      category: "delivery",
      priority: "high",
      status: "in_progress",
    }),
    ticket({
      id: 8,
      title: "Fakturan är dubbel",
      description: "unikhemlighet som inte ska gå att söka",
      category: "billing",
      priority: "low",
      status: "new",
    }),
  ]

  async function openAdvancedFilters(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole("button", { name: "Filtrera" }))
  }

  // KSP-77: search is the main filter. Status, priority and category stay behind Filtrera.
  it("test_ksp77_filter_options_use_swedish_labels", async () => {
    const user = userEvent.setup()
    mockTickets(tickets)
    renderPage()

    expect(await screen.findByRole("table")).toBeInTheDocument()
    expect(screen.getByRole("textbox", { name: "Sök ärenden" })).toBeInTheDocument()
    expect(screen.queryByLabelText("Status")).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Filtrera" })).toHaveAttribute(
      "aria-expanded",
      "false",
    )

    await openAdvancedFilters(user)

    expect(screen.getByRole("button", { name: "Filtrera" })).toHaveAttribute(
      "aria-expanded",
      "true",
    )
    expect(screen.getByRole("group", { name: "Avancerade filter" })).toBeInTheDocument()
    expect(screen.getAllByRole("option", { name: "Alla" })).toHaveLength(3)
    for (const label of Object.values(statusLabels)) {
      expect(screen.getByRole("option", { name: label })).toBeInTheDocument()
    }
    for (const label of Object.values(priorityLabels)) {
      expect(screen.getByRole("option", { name: label })).toBeInTheDocument()
    }
    for (const label of Object.values(categoryLabels)) {
      expect(screen.getByRole("option", { name: label })).toBeInTheDocument()
    }
    expect(screen.getByRole("button", { name: "Återställ filter" })).toBeDisabled()
    expect(screen.getByText("Visar 3 ärenden")).toBeInTheDocument()
  })

  // KSP-77: status, priority and category combine, and reset clears only those.
  it("test_ksp77_filters_combine_and_reset", async () => {
    const user = userEvent.setup()
    mockTickets(tickets)
    renderPage()

    await screen.findByRole("table")
    await openAdvancedFilters(user)
    await user.selectOptions(screen.getByLabelText("Status"), "new")
    await user.selectOptions(screen.getByLabelText("Kategori"), "billing")

    expect(screen.getByRole("link", { name: "Fakturan stämmer inte" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Fakturan är dubbel" })).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: "Sen leverans" })).not.toBeInTheDocument()
    expect(screen.getByText("Visar 2 ärenden")).toBeInTheDocument()
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1)

    await user.selectOptions(screen.getByLabelText("Prioritet"), "high")

    expect(screen.getByRole("link", { name: "Fakturan stämmer inte" })).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: "Fakturan är dubbel" })).not.toBeInTheDocument()
    expect(screen.getByText("Visar 1 ärende")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Återställ filter" }))

    expect(screen.getByLabelText("Status")).toHaveValue("")
    expect(screen.getByLabelText("Prioritet")).toHaveValue("")
    expect(screen.getByLabelText("Kategori")).toHaveValue("")
    expect(screen.getByText("Visar 3 ärenden")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Sen leverans" })).toBeInTheDocument()
  })

  // KSP-77: search is case-insensitive on id and title, and combines with filters.
  it("test_ksp77_search_combines_with_filters", async () => {
    const user = userEvent.setup()
    mockTickets(tickets)
    renderPage()

    const search = await screen.findByRole("textbox", { name: "Sök ärenden" })
    expect(search).toHaveAttribute("placeholder", "Sök ärenden...")

    await user.type(search, "FAKTURAN")
    expect(screen.queryByLabelText("Prioritet")).not.toBeInTheDocument()
    expect(screen.queryByRole("link", { name: "Sen leverans" })).not.toBeInTheDocument()
    expect(screen.getByText("Visar 2 ärenden")).toBeInTheDocument()

    await openAdvancedFilters(user)
    await user.selectOptions(screen.getByLabelText("Prioritet"), "low")
    expect(screen.getByRole("link", { name: "Fakturan är dubbel" })).toBeInTheDocument()
    expect(
      screen.queryByRole("link", { name: "Fakturan stämmer inte" }),
    ).not.toBeInTheDocument()
    expect(screen.getByText("Visar 1 ärende")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Återställ filter" }))
    expect(search).toHaveValue("FAKTURAN")
    expect(screen.getByText("Visar 2 ärenden")).toBeInTheDocument()

    await user.clear(search)
    await user.type(search, "12")
    expect(screen.getByRole("link", { name: "Fakturan stämmer inte" })).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: "Sen leverans" })).not.toBeInTheDocument()

    await user.clear(search)
    await user.type(search, "unikhemlighet")
    expect(screen.getByText("Inga ärenden matchar")).toBeInTheDocument()
    expect(screen.getByText("Visar 0 ärenden")).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: /Fakturan|Sen leverans/ })).not.toBeInTheDocument()
  })
})
