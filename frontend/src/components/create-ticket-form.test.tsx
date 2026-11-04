import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router"
import { afterEach, describe, expect, it, vi } from "vitest"

import type { TicketDraft } from "@/api/tickets"
import type { Ticket, TicketCreate } from "@/api/types"
import { BACKEND_UNREACHABLE } from "@/api/errors"
import { AppHeader } from "@/components/app-header"
import { TicketListRefreshProvider } from "@/components/ticket-list-refresh"
import { TicketListPage } from "@/pages/TicketListPage"

// KSP-30: create-ticket dialog. The API owns validation; the form shows detail unchanged.

const TITLE = "Fakturan har fel belopp"
const DESCRIPTION = "Kunden har fått dubbel debitering för oktober."

// The form posts a draft, which may have an empty category or priority (CORE-08).
function isTicketCreate(body: TicketDraft): body is TicketCreate {
  return body.category !== "" && body.priority !== ""
}

function createdTicket(body: TicketDraft): Ticket {
  if (!isTicketCreate(body)) {
    throw new Error("The mock stored a draft that is not a valid ticket.")
  }
  return {
    id: 1,
    title: body.title,
    description: body.description,
    category: body.category,
    priority: body.priority,
    status: "new",
    created_at: "2026-10-25T09:00:00.000000Z",
  }
}

type FetchCall = [input: RequestInfo | URL, init?: RequestInit]

function calls(): FetchCall[] {
  return vi.mocked(fetch).mock.calls as unknown as FetchCall[]
}

function postBodies(): TicketDraft[] {
  return calls()
    .filter(([, init]) => init?.method === "POST")
    .map(([, init]) => JSON.parse(String(init?.body)) as TicketDraft)
}

function getCount(): number {
  return calls().filter(([, init]) => !init?.method || init.method === "GET").length
}

// GET returns whatever has been stored. POST stores the body and answers 201,
// unless respond overrides the POST result.
function mockApi(respond?: (body: TicketDraft) => Response | Promise<Response>) {
  const stored: Ticket[] = []
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      const method = init?.method ?? "GET"
      if (method === "POST") {
        const body = JSON.parse(String(init?.body)) as TicketDraft
        const response = respond ? await respond(body) : json(201, createdTicket(body))
        // A 201 is what the next GET returns, so the list only updates when it is fetched again.
        if (response.ok) stored.unshift(createdTicket(body))
        return response
      }
      return json(200, stored)
    }),
  )
}

function json(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response
}

function errorResponse(detail: string): Response {
  return json(422, { detail })
}

function renderPage() {
  return render(
    <MemoryRouter>
      <TicketListRefreshProvider>
        <AppHeader />
        <TicketListPage />
      </TicketListRefreshProvider>
    </MemoryRouter>,
  )
}

async function openForm(user: ReturnType<typeof userEvent.setup>) {
  renderPage()
  await user.click(await screen.findByRole("button", { name: "Nytt ärende" }))
  expect(await screen.findByRole("dialog", { name: "Nytt ärende" })).toBeInTheDocument()
}

async function chooseCodes(user: ReturnType<typeof userEvent.setup>) {
  await user.selectOptions(screen.getByLabelText("Kategori"), "billing")
  await user.selectOptions(screen.getByLabelText("Prioritet"), "high")
}

describe("Create ticket form", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  // CORE-01: a valid ticket is posted without status and then shown from a fresh list fetch.
  it("test_core01_valid_ticket_is_posted_and_shown", async () => {
    const user = userEvent.setup()
    mockApi()
    await openForm(user)
    await user.type(screen.getByLabelText("Rubrik"), TITLE)
    await user.type(screen.getByLabelText("Beskrivning"), DESCRIPTION)
    await chooseCodes(user)
    const getsBeforeSubmit = getCount()

    await user.click(screen.getByRole("button", { name: "Registrera ärende" }))

    expect(await screen.findByRole("heading", { name: TITLE })).toBeInTheDocument()
    expect(screen.queryByRole("dialog", { name: "Nytt ärende" })).not.toBeInTheDocument()
    expect(postBodies()).toEqual([
      {
        title: TITLE,
        description: DESCRIPTION,
        category: "billing",
        priority: "high",
      },
    ])
    expect(getCount()).toBeGreaterThan(getsBeforeSubmit)

    await user.click(screen.getByRole("button", { name: "Nytt ärende" }))
    await user.type(await screen.findByLabelText("Rubrik"), "Utkast")
    await user.keyboard("{Escape}")
    expect(await screen.findByRole("alertdialog")).toBeInTheDocument()
  })

  // CORE-01, AC1: after the page is opened again the ticket still comes from GET /tickets.
  it("test_core01_ticket_still_shown_after_remount", async () => {
    const user = userEvent.setup()
    mockApi()
    const page = renderPage()
    await user.click(await screen.findByRole("button", { name: "Nytt ärende" }))
    await user.type(screen.getByLabelText("Rubrik"), TITLE)
    await user.type(screen.getByLabelText("Beskrivning"), DESCRIPTION)
    await chooseCodes(user)
    await user.click(screen.getByRole("button", { name: "Registrera ärende" }))
    expect(await screen.findByRole("heading", { name: TITLE })).toBeInTheDocument()

    page.unmount()
    renderPage()

    expect(await screen.findByRole("heading", { name: TITLE })).toBeInTheDocument()
  })

  // CORE-06: an empty title is sent, and the API message is shown unchanged inside the dialog.
  it("test_core06_missing_title_shows_detail", async () => {
    const user = userEvent.setup()
    mockApi(() => errorResponse("Rubrik måste fyllas i."))
    await openForm(user)
    await user.type(screen.getByLabelText("Beskrivning"), DESCRIPTION)
    await chooseCodes(user)

    await user.click(screen.getByRole("button", { name: "Registrera ärende" }))

    const dialog = screen.getByRole("dialog", { name: "Nytt ärende" })
    expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      "Rubrik måste fyllas i.",
    )
    expect(postBodies()[0]?.title).toBe("")
  })

  // CORE-07: an empty description is sent, and the API message is shown unchanged.
  it("test_core07_missing_description_shows_detail", async () => {
    const user = userEvent.setup()
    mockApi(() => errorResponse("Beskrivning måste fyllas i."))
    await openForm(user)
    await user.type(screen.getByLabelText("Rubrik"), TITLE)
    await chooseCodes(user)

    await user.click(screen.getByRole("button", { name: "Registrera ärende" }))

    const dialog = screen.getByRole("dialog", { name: "Nytt ärende" })
    expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      "Beskrivning måste fyllas i.",
    )
    expect(postBodies()[0]?.description).toBe("")
  })

  // AC4: a joined detail is shown as one string. The backend owns the joining (CORE-18).
  it("test_ac4_422_detail_is_shown_unchanged", async () => {
    const detail =
      "Rubrik måste fyllas i. Beskrivningen får vara högst 2000 tecken."
    const user = userEvent.setup()
    mockApi(() => errorResponse(detail))
    await openForm(user)
    await chooseCodes(user)

    await user.click(screen.getByRole("button", { name: "Registrera ärende" }))

    const dialog = screen.getByRole("dialog", { name: "Nytt ärende" })
    expect(await within(dialog).findByRole("alert")).toHaveTextContent(detail)
  })

  // CORE-08, AC2: options use API codes as values and Swedish labels as text.
  it("test_core08_options_are_codes_with_swedish_labels", async () => {
    const user = userEvent.setup()
    mockApi()
    await openForm(user)

    const category = screen.getByLabelText("Kategori")
    expect(
      within(category)
        .getAllByRole("option")
        .map((option) => [option.getAttribute("value"), option.textContent]),
    ).toEqual([
      ["", "Välj…"],
      ["billing", "Faktura och betalning"],
      ["delivery", "Leverans"],
      ["technical", "Tekniskt problem"],
      ["account", "Konto"],
      ["other", "Övrigt"],
    ])
    const priority = screen.getByLabelText("Prioritet")
    expect(
      within(priority)
        .getAllByRole("option")
        .map((option) => [option.getAttribute("value"), option.textContent]),
    ).toEqual([
      ["", "Välj…"],
      ["low", "Låg"],
      ["medium", "Medel"],
      ["high", "Hög"],
    ])
    expect(screen.queryByRole("option", { name: "billing" })).not.toBeInTheDocument()
    expect(screen.queryByRole("option", { name: "high" })).not.toBeInTheDocument()
  })

  // CORE-08: an empty category or priority is sent, and the API message is shown unchanged.
  it("test_core08_empty_category_shows_detail", async () => {
    const user = userEvent.setup()
    mockApi((body) =>
      errorResponse(
        body.category === ""
          ? "Välj en giltig kategori."
          : "Välj en giltig prioritet.",
      ),
    )
    await openForm(user)
    await user.type(screen.getByLabelText("Rubrik"), TITLE)
    await user.type(screen.getByLabelText("Beskrivning"), DESCRIPTION)
    await user.selectOptions(screen.getByLabelText("Prioritet"), "high")
    await user.click(screen.getByRole("button", { name: "Registrera ärende" }))

    const dialog = screen.getByRole("dialog", { name: "Nytt ärende" })
    expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      "Välj en giltig kategori.",
    )
    expect(postBodies()[0]?.category).toBe("")

    await user.selectOptions(screen.getByLabelText("Kategori"), "billing")
    await user.selectOptions(screen.getByLabelText("Prioritet"), "")
    await user.click(screen.getByRole("button", { name: "Registrera ärende" }))

    expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      "Välj en giltig prioritet.",
    )
    expect(postBodies()[1]?.priority).toBe("")
  })

  // CORE-09: status is set by the server and must not be sent.
  it("test_core09_status_is_not_sent", async () => {
    const user = userEvent.setup()
    mockApi()
    await openForm(user)
    await user.type(screen.getByLabelText("Rubrik"), TITLE)
    await user.type(screen.getByLabelText("Beskrivning"), DESCRIPTION)
    await chooseCodes(user)
    await user.click(screen.getByRole("button", { name: "Registrera ärende" }))
    await screen.findByRole("heading", { name: TITLE })

    expect(postBodies()[0]).not.toHaveProperty("status")
  })

  // CORE-11: a title of only spaces is sent unchanged and shown as the API's empty-title message.
  it("test_core11_whitespace_title_shows_detail", async () => {
    const user = userEvent.setup()
    mockApi(() => errorResponse("Rubrik måste fyllas i."))
    await openForm(user)
    await user.type(screen.getByLabelText("Rubrik"), "   ")
    await user.type(screen.getByLabelText("Beskrivning"), DESCRIPTION)
    await chooseCodes(user)
    await user.click(screen.getByRole("button", { name: "Registrera ärende" }))

    const dialog = screen.getByRole("dialog", { name: "Nytt ärende" })
    expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      "Rubrik måste fyllas i.",
    )
    expect(postBodies()[0]?.title).toBe("   ")
  })

  // CORE-12, AC3: 100 code points are kept and submitted. The counter shows the raw length.
  it("test_core12_one_hundred_code_points_is_submitted", async () => {
    const user = userEvent.setup()
    mockApi()
    await openForm(user)
    const title = "Å".repeat(100)
    const titleField = screen.getByLabelText("Rubrik")
    await user.click(titleField)
    await user.paste(title)

    expect(screen.getByText("100 / 100")).toBeInTheDocument()
    expect(titleField).toHaveValue(title)
    await user.type(screen.getByLabelText("Beskrivning"), DESCRIPTION)
    await chooseCodes(user)
    await user.click(screen.getByRole("button", { name: "Registrera ärende" }))

    expect(postBodies()[0]?.title).toBe(title)
  })

  // CORE-12: 101 code points are still sent, and the API message is shown unchanged.
  it("test_core12_one_hundred_one_shows_detail", async () => {
    const user = userEvent.setup()
    mockApi(() => errorResponse("Rubriken får vara högst 100 tecken."))
    await openForm(user)
    const title = "Å".repeat(101)
    const titleField = screen.getByLabelText("Rubrik")
    await user.click(titleField)
    await user.paste(title)

    expect(screen.getByText("101 / 100")).toBeInTheDocument()
    await user.type(screen.getByLabelText("Beskrivning"), DESCRIPTION)
    await chooseCodes(user)
    await user.click(screen.getByRole("button", { name: "Registrera ärende" }))

    const dialog = screen.getByRole("dialog", { name: "Nytt ärende" })
    expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      "Rubriken får vara högst 100 tecken.",
    )
    expect(postBodies()[0]?.title).toBe(title)
  })

  // CORE-13: 2001 code points in the description are sent, and the API message is shown.
  it("test_core13_description_limit_message_is_shown", async () => {
    const user = userEvent.setup()
    mockApi(() => errorResponse("Beskrivningen får vara högst 2000 tecken."))
    await openForm(user)
    const description = "Å".repeat(2001)
    const descriptionField = screen.getByLabelText("Beskrivning")
    await user.click(descriptionField)
    await user.paste(description)

    expect(screen.getByText("2001 / 2000")).toBeInTheDocument()
    await user.type(screen.getByLabelText("Rubrik"), TITLE)
    await chooseCodes(user)
    await user.click(screen.getByRole("button", { name: "Registrera ärende" }))

    const dialog = screen.getByRole("dialog", { name: "Nytt ärende" })
    expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      "Beskrivningen får vara högst 2000 tecken.",
    )
    expect(postBodies()[0]?.description).toBe(description)
  })

  // CORE-14: Swedish characters and an emoji are posted unchanged. No normalization.
  it("test_core14_emoji_title_is_sent_unchanged", async () => {
    const user = userEvent.setup()
    mockApi()
    await openForm(user)
    const title = "Åtgärd för ärende 😊"
    const titleField = screen.getByLabelText("Rubrik")
    await user.click(titleField)
    await user.paste(title)
    await user.type(screen.getByLabelText("Beskrivning"), DESCRIPTION)
    await chooseCodes(user)
    await user.click(screen.getByRole("button", { name: "Registrera ärende" }))
    await screen.findByRole("heading", { name: title })

    expect(postBodies()[0]?.title).toBe(title)
  })

  // CORE-14, B11: the visible counter uses code points, so 👩‍💻 counts as 3.
  it("test_core14_compound_emoji_counts_as_code_points", async () => {
    const user = userEvent.setup()
    mockApi()
    await openForm(user)
    const title = `${"Å".repeat(98)}👩‍💻`
    const titleField = screen.getByLabelText("Rubrik")
    await user.click(titleField)
    await user.paste(title)

    expect(titleField).toHaveValue(title)
    expect(screen.getByText("101 / 100")).toBeInTheDocument()
    expect(screen.queryByText("103 / 100")).not.toBeInTheDocument()
  })

  // B11: no maxlength attribute, so 100 emoji (200 UTF-16 units) stay in the field.
  it("test_b11_fields_have_no_maxlength", async () => {
    const user = userEvent.setup()
    mockApi()
    await openForm(user)
    const title = "😊".repeat(100)
    const titleField = screen.getByLabelText("Rubrik")
    const descriptionField = screen.getByLabelText("Beskrivning")

    expect(titleField).not.toHaveAttribute("maxlength")
    expect(descriptionField).not.toHaveAttribute("maxlength")
    await user.click(titleField)
    await user.paste(title)

    expect(titleField).toHaveValue(title)
    expect(screen.getByText("100 / 100")).toBeInTheDocument()
  })

  // KSP-30: an untouched form closes without the discard confirmation.
  it("test_pristine_dialog_closes_without_confirm", async () => {
    const user = userEvent.setup()
    mockApi()
    await openForm(user)

    await user.keyboard("{Escape}")

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()
    expect(screen.queryByText("Släng utkastet?")).not.toBeInTheDocument()
    expect(screen.queryByRole("dialog", { name: "Nytt ärende" })).not.toBeInTheDocument()
  })

  // KSP-30: a filled form asks before discarding. Continue keeps the text; discard clears it.
  it("test_dirty_dialog_asks_before_discard", async () => {
    const user = userEvent.setup()
    mockApi()
    await openForm(user)
    await user.type(screen.getByLabelText("Rubrik"), "Utkast")

    await user.keyboard("{Escape}")

    expect(await screen.findByRole("alertdialog")).toBeInTheDocument()
    expect(screen.getByText("Släng utkastet?")).toBeInTheDocument()
    expect(screen.getByText("Det som är ifyllt försvinner.")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Fortsätt redigera" }))

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()
    expect(screen.getByLabelText("Rubrik")).toHaveValue("Utkast")

    await user.keyboard("{Escape}")
    await user.click(await screen.findByRole("button", { name: "Släng utkastet" }))

    expect(screen.queryByRole("dialog", { name: "Nytt ärende" })).not.toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Nytt ärende" }))
    expect(await screen.findByLabelText("Rubrik")).toHaveValue("")
  })

  // KSP-30: the submit button stays disabled until the response arrives, so one click is one POST.
  it("test_submit_disabled_while_request_is_pending", async () => {
    const user = userEvent.setup()
    let release: (response: Response) => void = () => {}
    const pending = new Promise<Response>((resolve) => {
      release = resolve
    })
    mockApi(() => pending as unknown as Response)
    await openForm(user)
    await user.type(screen.getByLabelText("Rubrik"), TITLE)
    await user.type(screen.getByLabelText("Beskrivning"), DESCRIPTION)
    await chooseCodes(user)
    const submit = screen.getByRole("button", { name: "Registrera ärende" })

    await user.click(submit)

    expect(submit).toBeDisabled()
    // A disabled button rejects the click. If it is still enabled, a second POST is sent.
    await user.click(submit).catch(() => undefined)
    expect(postBodies()).toHaveLength(1)

    release(json(201, createdTicket(postBodies()[0])))
    expect(await screen.findByRole("heading", { name: TITLE })).toBeInTheDocument()
  })

  // KSP-30: an error that arrives after the draft was discarded is not shown.
  it("test_discard_during_request_ignores_late_response", async () => {
    const user = userEvent.setup()
    let release: (response: Response) => void = () => {}
    const pending = new Promise<Response>((resolve) => {
      release = resolve
    })
    mockApi(() => pending as unknown as Response)
    await openForm(user)
    await user.type(screen.getByLabelText("Rubrik"), TITLE)
    await user.type(screen.getByLabelText("Beskrivning"), DESCRIPTION)
    await chooseCodes(user)
    await user.click(screen.getByRole("button", { name: "Registrera ärende" }))
    await user.keyboard("{Escape}")
    await user.click(await screen.findByRole("button", { name: "Släng utkastet" }))
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()

    release(errorResponse("Rubrik måste fyllas i."))
    await vi.waitFor(() => {
      expect(postBodies()).toHaveLength(1)
    })

    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    expect(screen.queryByText("Rubrik måste fyllas i.")).not.toBeInTheDocument()
    expect(screen.queryByText(BACKEND_UNREACHABLE)).not.toBeInTheDocument()
  })

  // KSP-30: discarding while the request is in flight still reloads the list when the ticket was created.
  it("test_discard_during_request_reloads_list_on_success", async () => {
    const user = userEvent.setup()
    let release: (response: Response) => void = () => {}
    const pending = new Promise<Response>((resolve) => {
      release = resolve
    })
    mockApi(() => pending as unknown as Response)
    await openForm(user)
    await user.type(screen.getByLabelText("Rubrik"), TITLE)
    await user.type(screen.getByLabelText("Beskrivning"), DESCRIPTION)
    await chooseCodes(user)
    await user.click(screen.getByRole("button", { name: "Registrera ärende" }))
    await user.keyboard("{Escape}")
    await user.click(await screen.findByRole("button", { name: "Släng utkastet" }))
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()

    const body = postBodies()[0]
    if (body === undefined) throw new Error("The form did not post a draft.")
    release(json(201, createdTicket(body)))

    expect(await screen.findByRole("heading", { name: TITLE })).toBeInTheDocument()
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })
})
