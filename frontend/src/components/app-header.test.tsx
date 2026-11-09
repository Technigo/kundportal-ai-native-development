import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, useLocation } from "react-router"
import { afterEach, describe, expect, it, vi } from "vitest"

import { AppHeader } from "@/components/app-header"

// KSP-75: app header with the portal name and navigation. No new CORE or HIST id.

function CurrentPath() {
  return <p data-testid="current-path">{useLocation().pathname}</p>
}

function renderHeader(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <AppHeader />
      <CurrentPath />
    </MemoryRouter>,
  )
}

// POST answers 201 with a new ticket that has id 12.
function mockCreate() {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body)) as Record<string, string>
      return {
        ok: true,
        status: 201,
        json: async () => ({
          ...body,
          id: 12,
          status: "new",
          created_at: "2026-11-06T09:00:00.000000Z",
        }),
      } as Response
    }),
  )
}

describe("App header", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  // KSP-75 AC2 and AC3: name, link to the list, and the primary create button.
  it("test_ksp75_shows_name_list_link_and_create_button", async () => {
    const user = userEvent.setup()
    renderHeader("/")

    const banner = screen.getByRole("banner")
    expect(banner).toHaveTextContent("Kundserviceportalen")
    expect(banner.querySelector("svg")).toHaveAttribute("aria-hidden", "true")

    const listLink = screen.getByRole("link", { name: "Ärenden" })
    expect(listLink.tagName).toBe("A")
    expect(listLink).toHaveAttribute("href", "/")
    expect(listLink).toHaveAttribute("aria-current", "page")
    expect(screen.getByRole("navigation", { name: "Huvudmeny" })).toContainElement(listLink)

    await user.click(screen.getByRole("button", { name: "Nytt ärende" }))
    expect(await screen.findByRole("dialog", { name: "Nytt ärende" })).toBeInTheDocument()
  })

  // KSP-75: the list link is current only on the list.
  it("test_ksp75_list_link_is_not_current_on_a_ticket", () => {
    renderHeader("/tickets/4")

    expect(screen.getByRole("link", { name: "Ärenden" })).not.toHaveAttribute("aria-current")
    expect(screen.getByText("Kundserviceportalen")).toHaveAttribute(
      "title",
      "Kundserviceportalen",
    )
  })

  // KSP-75: creating a ticket from the detail view opens the new ticket, so the
  // handler sees that it worked (review of PR #103).
  it("test_ksp75_create_on_detail_view_opens_new_ticket", async () => {
    const user = userEvent.setup()
    mockCreate()
    renderHeader("/tickets/4")

    await user.click(screen.getByRole("button", { name: "Nytt ärende" }))
    await user.type(await screen.findByLabelText("Rubrik"), "Leveransen är försenad")
    await user.type(screen.getByLabelText("Beskrivning"), "Paketet har inte kommit fram.")
    await user.selectOptions(screen.getByLabelText("Kategori"), "billing")
    await user.selectOptions(screen.getByLabelText("Prioritet"), "high")
    await user.click(screen.getByRole("button", { name: "Registrera ärende" }))

    expect(await screen.findByTestId("current-path")).toHaveTextContent("/tickets/12")
    expect(screen.queryByRole("dialog", { name: "Nytt ärende" })).not.toBeInTheDocument()
  })
})
