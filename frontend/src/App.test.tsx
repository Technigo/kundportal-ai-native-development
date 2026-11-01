import { render, screen } from "@testing-library/react"
import { axe } from "jest-axe"
import { afterEach, describe, expect, it, vi } from "vitest"

import { HealthPage } from "./pages/HealthPage"

// Smoke test for the test setup (vitest, jsdom, Testing Library, jest-dom, jest-axe).
describe("App health check", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("shows a Swedish message when the backend cannot be reached", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")))

    const { container } = render(<HealthPage />)

    expect(
      await screen.findByText(/Kunde inte nå backenden/)
    ).toBeInTheDocument()
    expect(await axe(container)).toHaveNoViolations()
  })
})
