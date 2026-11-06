import { render, screen } from "@testing-library/react"
import { axe } from "jest-axe"
import { MemoryRouter } from "react-router"
import { afterEach, describe, expect, it, vi } from "vitest"

import { TicketListPage } from "./pages/TicketListPage"

// Smoke test for the test setup (vitest, jsdom, Testing Library, jest-dom, jest-axe).
// KSP-73: the health page is gone. The list shows the same message when fetch fails.
describe("Ticket list when the backend cannot be reached", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("shows a Swedish message when the backend cannot be reached", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")))

    const { container } = render(
      <MemoryRouter>
        <TicketListPage />
      </MemoryRouter>,
    )

    // KSP-38 (error messages in the UI): the text is for a case worker, without technical
    // words (HIST-14, errors in Swedish without technical details).
    // Written out here on purpose: the other tests import the constant.
    expect(
      await screen.findByText("Kundserviceportalen svarar inte just nu. Försök igen om en stund."),
    ).toBeInTheDocument()
    expect(await axe(container)).toHaveNoViolations()
  })
})
