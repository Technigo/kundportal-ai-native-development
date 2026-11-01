import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createMemoryRouter, RouterProvider } from "react-router"
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest"

import type { Ticket, TicketStatus } from "@/api/types"
import { BACKEND_UNREACHABLE } from "@/pages/HealthPage"
import { TicketDetailPage } from "./ticket-detail-page"

// Status change in the detail view (KSP-32). HIST-02, 06, 07 and 13 are the rules in the API;
// these tests show that the UI sends the right code, shows the new status and keeps the
// saved status on errors. Tests named KSP-32 test AC4-AC6, decided without a frontend spec:
// a badge with a pencil button, which opens a select with save and cancel.

// Made-up tickets, never real customer data.
const ticket5: Ticket = {
  id: 5,
  title: "Paketet kom aldrig fram",
  description: "Kunden väntar på en beställning från 12 oktober.",
  category: "delivery",
  priority: "high",
  status: "in_progress",
  created_at: "2026-10-25T09:00:00.000000Z",
}

const ticket7: Ticket = {
  id: 7,
  title: "Kan inte logga in",
  description: "Kunden har bytt telefon och får ingen kod.",
  category: "account",
  priority: "medium",
  status: "closed",
  created_at: "2026-10-20T08:15:00.000000Z",
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

type PatchAnswer = (ticket: Ticket, status: TicketStatus) => Promise<Response>

// GET answers with the ticket. PATCH answers like the backend on success (200 with the
// ticket in its new status), unless a test replaces the answer.
function fakeBackend(patchAnswer: { current: PatchAnswer }): Mock {
  const tickets: Record<string, Ticket> = { "5": ticket5, "7": ticket7 }
  return vi.fn(async (url: string, init?: RequestInit) => {
    const id = url.match(/^\/api\/tickets\/([^/]+)/)?.[1] ?? ""
    const ticket = tickets[id]
    if (init?.method === "PATCH") {
      const { status } = JSON.parse(String(init.body)) as { status: TicketStatus }
      return patchAnswer.current(ticket, status)
    }
    return jsonResponse(ticket)
  })
}

const succeed: PatchAnswer = async (ticket, status) => jsonResponse({ ...ticket, status })

function renderAt(path: string) {
  const router = createMemoryRouter([{ path: "/tickets/:id", element: <TicketDetailPage /> }], {
    initialEntries: [path],
  })
  render(<RouterProvider router={router} />)
}

function patchCalls(fetchMock: Mock): { url: string; body: unknown }[] {
  return fetchMock.mock.calls
    .filter((call) => (call[1] as RequestInit | undefined)?.method === "PATCH")
    .map((call) => ({ url: call[0] as string, body: JSON.parse(String(call[1].body)) }))
}

// Opens the editor with the pencil button, as a user would (KSP-32 AC4).
async function openEditor(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole("button", { name: "Ändra status" }))
  return screen.getByRole("combobox", { name: "Status" })
}

function saveButton() {
  return screen.getByRole("button", { name: "Spara" })
}

describe("Status change in the detail view", () => {
  let fetchMock: Mock
  const patchAnswer = { current: succeed }

  beforeEach(() => {
    patchAnswer.current = succeed
    fetchMock = fakeBackend(patchAnswer)
    vi.stubGlobal("fetch", fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("KSP-32: shows the status as a badge with an edit button", async () => {
    renderAt("/tickets/5")

    expect(await screen.findByRole("button", { name: "Ändra status" })).toBeInTheDocument()
    expect(screen.getByText("Pågående")).toBeInTheDocument()
    expect(screen.queryByRole("combobox", { name: "Status" })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Spara" })).not.toBeInTheDocument()
  })

  it("KSP-32: the edit button shows the select with focus, save and cancel", async () => {
    const user = userEvent.setup()
    renderAt("/tickets/5")

    const select = await openEditor(user)

    expect(select).toHaveFocus()
    expect(saveButton()).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Avbryt" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Ändra status" })).not.toBeInTheDocument()
  })

  it("KSP-32: all four statuses can be chosen with Swedish labels", async () => {
    const user = userEvent.setup()
    renderAt("/tickets/5")

    const select = await openEditor(user)
    const options = Array.from((select as HTMLSelectElement).options).map((option) => option.text)
    expect(options).toEqual(["Nytt", "Pågående", "Väntar på kund", "Avslutat"])
    expect(select).toHaveDisplayValue("Pågående")
    expect(document.body).not.toHaveTextContent(/\bnew\b|in_progress|waiting_on_customer|\bclosed\b/)
  })

  it("KSP-32: save is disabled when the current status is chosen", async () => {
    const user = userEvent.setup()
    renderAt("/tickets/5")
    const select = await openEditor(user)

    expect(saveButton()).toBeDisabled()
    await user.selectOptions(select, "Avslutat")
    expect(saveButton()).toBeEnabled()
    await user.selectOptions(select, "Pågående")
    expect(saveButton()).toBeDisabled()
  })

  it("KSP-32: cancel goes back to the badge without saving", async () => {
    const user = userEvent.setup()
    renderAt("/tickets/5")

    await user.selectOptions(await openEditor(user), "Avslutat")
    await user.click(screen.getByRole("button", { name: "Avbryt" }))

    expect(screen.queryByRole("combobox", { name: "Status" })).not.toBeInTheDocument()
    expect(screen.getByText("Pågående")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Ändra status" })).toHaveFocus()
    expect(patchCalls(fetchMock)).toEqual([])
  })

  it("HIST-02: sends the status code, not the label", async () => {
    const user = userEvent.setup()
    renderAt("/tickets/5")

    await user.selectOptions(await openEditor(user), "Avslutat")
    await user.click(saveButton())

    expect(patchCalls(fetchMock)).toEqual([{ url: "/api/tickets/5/status", body: { status: "closed" } }])
  })

  it("HIST-02: shows the new status as a badge after saving", async () => {
    const user = userEvent.setup()
    renderAt("/tickets/5")

    await user.selectOptions(await openEditor(user), "Avslutat")
    await user.click(saveButton())

    expect(await screen.findByRole("button", { name: "Ändra status" })).toHaveFocus()
    expect(screen.queryByRole("combobox", { name: "Status" })).not.toBeInTheDocument()
    expect(screen.getByText("Avslutat")).toBeInTheDocument()
    expect(screen.queryByText("Pågående")).not.toBeInTheDocument()
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("KSP-32: save button shows that it is saving and is disabled meanwhile", async () => {
    const user = userEvent.setup()
    patchAnswer.current = () => new Promise(() => {})
    renderAt("/tickets/5")

    await user.selectOptions(await openEditor(user), "Avslutat")
    await user.click(saveButton())

    expect(saveButton()).toBeDisabled()
    expect(saveButton()).toHaveAttribute("aria-busy", "true")
    await user.click(saveButton())
    expect(patchCalls(fetchMock)).toHaveLength(1)
  })

  it("HIST-07: same status shows the message and keeps the saved status", async () => {
    // The status can have been changed by someone else after the page was loaded.
    const user = userEvent.setup()
    patchAnswer.current = async () => jsonResponse({ detail: "Ärendet har redan den statusen." }, 409)
    renderAt("/tickets/5")
    const select = await openEditor(user)

    await user.selectOptions(select, "Avslutat")
    await user.click(saveButton())

    expect(await screen.findByRole("alert")).toHaveTextContent("Ärendet har redan den statusen.")
    // The view stays in edit mode, so the user can try again (KSP-32 AC6).
    expect(select).toBeInTheDocument()
    expect(select).toHaveDisplayValue("Pågående")
  })

  it("HIST-06: invalid status shows the message and keeps the saved status", async () => {
    const user = userEvent.setup()
    patchAnswer.current = async () => jsonResponse({ detail: "Välj en giltig status." }, 422)
    renderAt("/tickets/5")
    const select = await openEditor(user)

    await user.selectOptions(select, "Avslutat")
    await user.click(saveButton())

    expect(await screen.findByRole("alert")).toHaveTextContent("Välj en giltig status.")
    expect(select).toBeInTheDocument()
    expect(select).toHaveDisplayValue("Pågående")
  })

  it("HIST-13: a closed ticket can be reopened", async () => {
    const user = userEvent.setup()
    renderAt("/tickets/7")
    const select = await openEditor(user)
    expect(select).toHaveDisplayValue("Avslutat")

    await user.selectOptions(select, "Nytt")
    await user.click(saveButton())

    expect(patchCalls(fetchMock)).toEqual([{ url: "/api/tickets/7/status", body: { status: "new" } }])
    await screen.findByRole("button", { name: "Ändra status" })
    expect(screen.getByText("Nytt")).toBeInTheDocument()
  })

  it("HIST-14: failed save shows the detail from the API and keeps the saved status", async () => {
    const user = userEvent.setup()
    patchAnswer.current = async () =>
      jsonResponse({ detail: "Statusen kunde inte ändras. Försök igen." }, 503)
    renderAt("/tickets/5")
    const select = await openEditor(user)

    await user.selectOptions(select, "Avslutat")
    await user.click(saveButton())

    expect(await screen.findByRole("alert")).toHaveTextContent("Statusen kunde inte ändras. Försök igen.")
    expect(select).toBeInTheDocument()
    expect(select).toHaveDisplayValue("Pågående")
  })

  it("HIST-14: network error when saving shows the shared message and keeps the saved status", async () => {
    const user = userEvent.setup()
    patchAnswer.current = async () => {
      throw new TypeError("Failed to fetch")
    }
    renderAt("/tickets/5")
    const select = await openEditor(user)

    await user.selectOptions(select, "Avslutat")
    await user.click(saveButton())

    expect(await screen.findByRole("alert")).toHaveTextContent(BACKEND_UNREACHABLE)
    expect(document.body).not.toHaveTextContent(/Failed to fetch/)
    expect(select).toBeInTheDocument()
    expect(select).toHaveDisplayValue("Pågående")
  })
})
