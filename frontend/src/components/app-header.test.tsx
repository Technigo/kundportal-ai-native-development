import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router"
import { describe, expect, it } from "vitest"

import { AppHeader } from "@/components/app-header"

// KSP-75: app header with the portal name and navigation. No new CORE or HIST id.

function renderHeader(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <AppHeader />
    </MemoryRouter>,
  )
}

describe("App header", () => {
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
    expect(screen.getByRole("navigation")).toContainElement(listLink)

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
})
