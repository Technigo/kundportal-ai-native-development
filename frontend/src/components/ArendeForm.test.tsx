import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { afterEach, describe, expect, it, vi } from "vitest";
import { API_BASE_URL } from "../api/arendenApi";
import { seedArenden } from "../mocks/data";
import { db } from "../mocks/handlers";
import { server } from "../mocks/node";
import { ArendeForm } from "./ArendeForm";

// A2, A3 and A4 start with two cases.
const startWithTwoCases = () => db.reset(seedArenden().slice(0, 2));

// Records every POST /arenden the form sends, so a test can show that the form itself
// stopped the request, whatever the mock would have answered. It spies on fetch, which the
// form calls synchronously on submit, so a request is recorded before the click resolves.
// It matches the exact URL the form builds, so a path prefix or trailing slash in
// VITE_API_URL is still caught. It reads the URL and method the way fetch does (from init,
// else from a Request object), and compares the method in any letter case, so a refactor
// to fetch(new Request(...)) or method: "post" is still counted.
function recordCreateRequests() {
  const fetchSpy = vi.spyOn(globalThis, "fetch");
  return () =>
    fetchSpy.mock.calls.filter(([input, init]) => {
      const url = input instanceof Request ? input.url : String(input);
      const method = init?.method ?? (input instanceof Request ? input.method : "GET");
      return url === `${API_BASE_URL}/arenden` && method.toUpperCase() === "POST";
    });
}

afterEach(() => vi.restoreAllMocks());

const KATEGORI_ERROR = "Ogiltig kategori. Välj Fakturering, Teknik, Leverans eller Övrigt.";

async function fill(values: Partial<Record<"rubrik" | "beskrivning", string>> = {}) {
  const user = userEvent.setup();
  const rubrik = values.rubrik ?? "Leverans försenad";
  const beskrivning = values.beskrivning ?? "Paketet har inte kommit.";
  if (rubrik) await user.type(screen.getByLabelText("Rubrik"), rubrik);
  if (beskrivning) await user.type(screen.getByLabelText("Beskrivning"), beskrivning);
  await user.selectOptions(screen.getByLabelText("Kategori"), "Leverans");
  await user.selectOptions(screen.getByLabelText("Prioritet"), "Hög");
  return user;
}

function renderCreate() {
  const onSaved = vi.fn();
  const onCancel = vi.fn();
  render(<ArendeForm onSaved={onSaved} onCancel={onCancel} />);
  return { onSaved, onCancel };
}

describe("ArendeForm – create", () => {
  it("creates a case and passes it to onSaved", async () => {
    const { onSaved } = renderCreate();
    expect(screen.getByRole("heading", { name: "Nytt ärende" })).toBeInTheDocument();
    const user = await fill();
    await user.click(screen.getByRole("button", { name: "Skapa ärende" }));

    expect(onSaved).toHaveBeenCalledWith(
      expect.objectContaining({
        rubrik: "Leverans försenad",
        status: "Nytt",
        kategori: "Leverans",
      }),
    );
    expect(db.arenden).toHaveLength(4);
  });

  it("A2: a case without a title is rejected with a clear message; still two cases", async () => {
    startWithTwoCases();
    expect(db.arenden).toHaveLength(2);
    const createRequests = recordCreateRequests();
    const { onSaved } = renderCreate();
    const user = await fill({ rubrik: "" });
    await user.click(screen.getByRole("button", { name: "Skapa ärende" }));

    expect(screen.getByText("Rubrik måste fyllas i.")).toBeInTheDocument();
    expect(screen.getByLabelText("Rubrik")).toHaveAttribute("aria-invalid", "true");
    expect(createRequests()).toHaveLength(0);
    expect(onSaved).not.toHaveBeenCalled();
    expect(db.arenden).toHaveLength(2);
  });

  it("moves focus to the first invalid field on submit", async () => {
    renderCreate();
    await userEvent.setup().click(screen.getByRole("button", { name: "Skapa ärende" }));
    expect(screen.getByLabelText("Rubrik")).toHaveFocus();
  });

  it("A3: a title with only spaces counts as empty; still two cases", async () => {
    startWithTwoCases();
    expect(db.arenden).toHaveLength(2);
    const createRequests = recordCreateRequests();
    const { onSaved } = renderCreate();
    const user = await fill({ rubrik: "    " });
    await user.click(screen.getByRole("button", { name: "Skapa ärende" }));

    expect(screen.getByText("Rubrik måste fyllas i.")).toBeInTheDocument();
    expect(screen.getByLabelText("Rubrik")).toHaveAttribute("aria-invalid", "true");
    expect(createRequests()).toHaveLength(0);
    expect(onSaved).not.toHaveBeenCalled();
    expect(db.arenden).toHaveLength(2);
  });

  it("R2: shows a message for every missing field", async () => {
    renderCreate();
    await userEvent.setup().click(screen.getByRole("button", { name: "Skapa ärende" }));

    for (const text of [
      "Rubrik måste fyllas i.",
      "Beskrivning måste fyllas i.",
      "Välj en kategori.",
      "Välj en prioritet.",
    ]) {
      expect(screen.getByText(text)).toBeInTheDocument();
    }
  });

  it("A4: the backend's rejection of a category is shown clearly and nothing is passed on", async () => {
    // Q8 in kravspec.md: the form only offers allowed categories, so A4's action can only be
    // done against the API. The backend's API test shows the rejection and that nothing is
    // saved, and arendenApi.test.ts sends a real disallowed category to the mock. This test
    // shows only that the form displays the backend's rejection, so the answer is simulated.
    // The handler records what the form sent, so the test also shows that the rejection
    // answers the form's own request with the chosen category.
    const sentBodies: unknown[] = [];
    server.use(
      http.post(`${API_BASE_URL}/arenden`, async ({ request }) => {
        sentBodies.push(await request.json());
        return HttpResponse.json(
          { detail: [{ type: "value_error", loc: ["body", "kategori"], msg: KATEGORI_ERROR }] },
          { status: 422 },
        );
      }),
    );
    const { onSaved } = renderCreate();
    const user = await fill();
    await user.click(screen.getByRole("button", { name: "Skapa ärende" }));

    expect(await screen.findByText(KATEGORI_ERROR)).toBeInTheDocument();
    expect(sentBodies).toEqual([expect.objectContaining({ kategori: "Leverans" })]);
    expect(screen.getByLabelText("Kategori")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("Kontrollera fälten och försök igen.");
    expect(onSaved).not.toHaveBeenCalled();
  });

  it("disables submit while saving", async () => {
    let release: () => void = () => {};
    server.use(
      http.post(`${API_BASE_URL}/arenden`, async () => {
        await new Promise<void>((resolve) => (release = resolve));
        return HttpResponse.json({}, { status: 201 });
      }),
    );
    renderCreate();
    const user = await fill();
    await user.click(screen.getByRole("button", { name: "Skapa ärende" }));

    expect(await screen.findByRole("button", { name: "Sparar…" })).toBeDisabled();
    release();
    expect(await screen.findByRole("button", { name: "Skapa ärende" })).toBeEnabled();
  });

  it("calls onCancel", async () => {
    const { onCancel } = renderCreate();
    await userEvent.setup().click(screen.getByRole("button", { name: "Avbryt" }));
    expect(onCancel).toHaveBeenCalled();
  });
});
