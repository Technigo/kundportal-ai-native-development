import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";
import { API_BASE_URL } from "../api/arendenApi";
import { seedArenden } from "../mocks/data";
import { db } from "../mocks/handlers";
import { server } from "../mocks/node";
import { formatDate } from "../utils/formatDate";
import { ArendeDetail } from "./ArendeDetail";

function renderDetail(id = 1) {
  const props = { onClose: vi.fn(), onChanged: vi.fn() };
  render(<ArendeDetail id={id} {...props} />);
  return props;
}

describe("ArendeDetail", () => {
  it("A7: all fields of the chosen case are shown", async () => {
    const [c1] = seedArenden();
    db.reset([c1]);
    renderDetail(c1.id);

    expect(await screen.findByRole("heading", { name: c1.rubrik })).toBeInTheDocument();
    const terms = screen.getAllByRole("term").map((term) => term.textContent);
    const values = screen.getAllByRole("definition").map((value) => value.textContent);
    expect(Object.fromEntries(terms.map((term, i) => [term, values[i]]))).toEqual({
      Id: String(c1.id),
      Status: c1.status,
      Kategori: c1.kategori,
      Prioritet: c1.prioritet,
      Skapad: formatDate(c1.skapad),
      Beskrivning: c1.beskrivning,
    });
  });

  it("A10: shows a clear message when the case does not exist", async () => {
    renderDetail(999);
    expect(await screen.findByRole("alert")).toHaveTextContent("Ärendet hittades inte");
  });

  it("A8: the status changes to Pågående and the other fields are unchanged", async () => {
    const before = structuredClone(db.arenden[0]);
    expect(before.status).toBe("Nytt");
    const { onChanged } = renderDetail(before.id);
    await userEvent.setup().selectOptions(await screen.findByLabelText("Ändra status"), "Pågående");

    expect(await screen.findByText("Pågående", { selector: ".badge" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: before.rubrik })).toBeInTheDocument();
    const terms = screen.getAllByRole("term").map((term) => term.textContent);
    const values = screen.getAllByRole("definition").map((value) => value.textContent);
    expect(Object.fromEntries(terms.map((term, i) => [term, values[i]]))).toEqual({
      Id: String(before.id),
      Status: "Pågående",
      Kategori: before.kategori,
      Prioritet: before.prioritet,
      Skapad: formatDate(before.skapad),
      Beskrivning: before.beskrivning,
    });
    // The mock copies the other fields itself, so only the status in db depends on the component.
    expect(db.arenden[0].status).toBe("Pågående");
    expect(onChanged).toHaveBeenCalledWith({ ...before, status: "Pågående" });
  });

  it("A9: an invalid status is rejected with a clear message and the status is still Nytt", async () => {
    const before = db.arenden[0];
    expect(before.status).toBe("Nytt");
    // The list only offers allowed statuses, so the backend's rejection is simulated.
    // The override never writes to db, so the stored status is checked in the backend's API test.
    // Today's backend prefixes the message with "Value error, ", which must not be shown (R12).
    server.use(
      http.post(`${API_BASE_URL}/arenden/:id/status`, () =>
        HttpResponse.json(
          {
            detail: [
              { type: "value_error", loc: ["body", "status"], msg: "Value error, Ogiltig status" },
            ],
          },
          { status: 422 },
        ),
      ),
    );
    const { onChanged } = renderDetail(before.id);
    await userEvent.setup().selectOptions(await screen.findByLabelText("Ändra status"), "Avslutat");

    expect(await screen.findByRole("alert")).toHaveTextContent(/^Ogiltig status$/);
    expect(screen.getByLabelText("Ändra status")).toHaveValue("Nytt");
    expect(screen.getByText("Nytt", { selector: ".badge" })).toBeInTheDocument();
    expect(onChanged).not.toHaveBeenCalled();
  });

  it("ignores a status response for a case that is no longer shown", async () => {
    server.use(
      http.post(`${API_BASE_URL}/arenden/:id/status`, async ({ params }) => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        const arende = db.arenden.find((a) => a.id === Number(params.id));
        return HttpResponse.json({ ...arende, status: "Avslutat" });
      }),
    );
    const props = { onClose: vi.fn(), onChanged: vi.fn() };
    const { rerender } = render(<ArendeDetail id={1} {...props} />);
    await userEvent.setup().selectOptions(await screen.findByLabelText("Ändra status"), "Avslutat");
    rerender(<ArendeDetail id={2} {...props} />);
    expect(await screen.findByRole("heading", { name: "Kan inte logga in" })).toBeInTheDocument();

    await waitFor(() => expect(props.onChanged).toHaveBeenCalled());
    expect(screen.getByRole("heading", { name: "Kan inte logga in" })).toBeInTheDocument();
  });

  it("calls onClose", async () => {
    const { onClose } = renderDetail();
    await userEvent.setup().click(screen.getByRole("button", { name: "Stäng" }));
    expect(onClose).toHaveBeenCalled();
  });
});
