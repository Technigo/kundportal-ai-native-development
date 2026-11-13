import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import App from "./App";
import { API_BASE_URL } from "./api/arendenApi";
import { seedArenden } from "./mocks/data";
import { db } from "./mocks/handlers";
import { server } from "./mocks/node";
import type { Arende } from "./types/arende";
import { formatDate } from "./utils/formatDate";

// The text in each cell of each row in the list, without the header row.
async function rowCells() {
  const table = await screen.findByRole("table");
  return within(table)
    .getAllByRole("row")
    .slice(1)
    .map((row) =>
      within(row)
        .getAllByRole("cell")
        .map((cell) => cell.textContent),
    );
}

async function rowTitles() {
  return (await rowCells()).map((cells) => cells[0]);
}

const panel = () => screen.queryByRole("complementary", { name: /ärende/i });

describe("App", () => {
  it("default page: Alla ärenden list, no side panel", async () => {
    render(<App />);
    expect(screen.getByRole("heading", { level: 1, name: "Alla ärenden" })).toBeInTheDocument();
    expect(await rowTitles()).toEqual(["Fel på faktura", "Kan inte logga in", "Faktura saknas"]);
    expect(screen.queryByRole("button", { name: /ta bort/i })).not.toBeInTheDocument();
    expect(panel()).not.toBeInTheDocument();
  });

  it("A6: all three cases show with title, status, priority and created time", async () => {
    // The mock starts with three cases, C1–C3.
    render(<App />);
    const rows = await rowCells();
    const headers = screen.getAllByRole("columnheader").map((h) => h.textContent);
    expect(headers).toEqual(["Rubrik", "Status", "Prioritet", "Skapad"]);
    expect(rows).toHaveLength(3);
    for (const arende of db.arenden) {
      expect(rows).toContainEqual([
        arende.rubrik,
        arende.status,
        arende.prioritet,
        formatDate(arende.skapad),
      ]);
    }
  });

  it("shows empty state when no cases exist", async () => {
    db.reset([]);
    render(<App />);
    expect(await screen.findByText("Inga ärenden ännu")).toBeInTheDocument();
  });

  it("shows error with retry when the API is down", async () => {
    server.use(http.get(`${API_BASE_URL}/arenden`, () => HttpResponse.error()));
    render(<App />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Kunde inte nå servern");
    server.resetHandlers();
    await userEvent.setup().click(screen.getByRole("button", { name: "Försök igen" }));
    expect(await rowTitles()).toHaveLength(3);
  });

  it("clicking a row opens details in the side panel, list stays visible", async () => {
    render(<App />);
    const user = userEvent.setup();
    await rowTitles();
    await user.click(screen.getByText("Kan inte logga in"));

    const side = await screen.findByRole("complementary", { name: "Ärendedetaljer" });
    expect(await within(side).findByText("Inloggningen ger felmeddelande.")).toBeInTheDocument();
    expect(await rowTitles()).toHaveLength(3);
    expect(screen.getByRole("button", { name: "Kan inte logga in" })).toHaveAttribute(
      "aria-current",
      "true",
    );

    await user.click(within(side).getByRole("button", { name: "Stäng" }));
    expect(panel()).not.toBeInTheDocument();
  });

  it("A1: a valid case is saved with status Nytt and a created time, and shows in the list", async () => {
    db.reset([]);
    render(<App />);
    const user = userEvent.setup();
    expect(await screen.findByText("Inga ärenden ännu")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Nytt ärende" }));

    const side = screen.getByRole("complementary", { name: "Nytt ärende" });
    await user.type(within(side).getByLabelText("Rubrik"), "Leverans försenad");
    await user.type(within(side).getByLabelText("Beskrivning"), "Paketet har inte kommit.");
    await user.selectOptions(within(side).getByLabelText("Kategori"), "Leverans");
    await user.selectOptions(within(side).getByLabelText("Prioritet"), "Hög");
    await user.click(within(side).getByRole("button", { name: "Skapa ärende" }));

    expect(await rowTitles()).toEqual(["Leverans försenad"]);
    expect(db.arenden).toHaveLength(1);
    const [saved] = db.arenden;
    expect(saved).toMatchObject({ rubrik: "Leverans försenad", status: "Nytt" });
    expect(Number.isNaN(Date.parse(saved.skapad))).toBe(false);

    const row = within(screen.getByRole("table")).getAllByRole("row")[1];
    expect(within(row).getByText("Nytt")).toBeInTheDocument();
    expect(within(row).getByText(formatDate(saved.skapad))).toBeInTheDocument();

    // After saving, the new case opens in the panel.
    const detail = await screen.findByRole("complementary", { name: "Ärendedetaljer" });
    expect(
      await within(detail).findByRole("heading", { name: "Leverans försenad" }),
    ).toBeInTheDocument();
  });

  it("only status can be changed: no edit option in the list or the details", async () => {
    render(<App />);
    const user = userEvent.setup();
    await rowTitles();
    expect(screen.queryByRole("button", { name: /redigera/i })).not.toBeInTheDocument();

    await user.click(screen.getByText("Faktura saknas"));
    const side = await screen.findByRole("complementary", { name: "Ärendedetaljer" });
    expect(await within(side).findByLabelText("Ändra status")).toBeEnabled();
    expect(within(side).queryByRole("button", { name: /redigera/i })).not.toBeInTheDocument();
    expect(within(side).queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("search, filters and the no-hits message work together in the list", async () => {
    render(<App />);
    const user = userEvent.setup();
    await rowTitles();

    await user.type(screen.getByLabelText("Sök"), "faktura{Enter}");
    expect(await rowTitles()).toEqual(["Fel på faktura", "Faktura saknas"]);

    await user.selectOptions(screen.getByLabelText("Filtrera prioritet"), "Låg");
    expect(await rowTitles()).toEqual(["Fel på faktura"]);

    await user.clear(screen.getByLabelText("Sök"));
    await user.type(screen.getByLabelText("Sök"), "xyz123{Enter}");
    expect(await screen.findByText("Inga ärenden matchar")).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Filtrera prioritet"), "");
    await user.clear(screen.getByLabelText("Sök"));
    await user.type(screen.getByLabelText("Sök"), "   ");
    await user.click(screen.getByRole("button", { name: "Sök" }));
    expect(await rowTitles()).toHaveLength(3);
  });

  it("a status change in the panel is reflected by the list filter", async () => {
    render(<App />);
    const user = userEvent.setup();
    await rowTitles();
    await user.click(screen.getByText("Faktura saknas"));
    await user.selectOptions(await screen.findByLabelText("Ändra status"), "Avslutat");
    await screen.findByText("Avslutat", { selector: "aside .badge" });

    await user.selectOptions(screen.getByLabelText("Filtrera status"), "Avslutat");
    expect(await rowTitles()).toEqual(["Fel på faktura", "Faktura saknas"]);
  });
});

// C1–C3 from docs/specs/sok-filter.md are the mock's three cases.
describe("App – search and filters (sok-filter.md)", () => {
  it("SF-A10: 'xyz' gives 'Inga ärenden matchar'; clearing and searching again shows all three unchanged", async () => {
    const before = structuredClone(db.arenden);
    render(<App />);
    const user = userEvent.setup();
    const shownBefore = await rowCells();

    await user.type(screen.getByLabelText("Sök"), "xyz{Enter}");
    expect(await screen.findByText("Inga ärenden matchar")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();

    await user.clear(screen.getByLabelText("Sök"));
    await user.click(screen.getByRole("button", { name: "Sök" }));
    expect(await rowCells()).toEqual(shownBefore);
    expect(shownBefore).toHaveLength(3);
    expect(db.arenden).toEqual(before);
  });

  it("SF-A12: '<script>' is plain text: 'Inga ärenden matchar', and the app keeps working", async () => {
    render(<App />);
    const user = userEvent.setup();
    await rowTitles();

    await user.type(screen.getByLabelText("Sök"), "<script>{Enter}");
    expect(await screen.findByText("Inga ärenden matchar")).toBeInTheDocument();
    expect(screen.getByLabelText("Sök")).toHaveValue("<script>");

    await user.clear(screen.getByLabelText("Sök"));
    await user.type(screen.getByLabelText("Sök"), "faktura{Enter}");
    expect(await rowTitles()).toEqual(["Fel på faktura", "Faktura saknas"]);
  });

  it("SF-A13: the list is unchanged while typing and is searched when Enter is pressed", async () => {
    render(<App />);
    const user = userEvent.setup();
    const all = await rowTitles();

    await user.type(screen.getByLabelText("Sök"), "faktura");
    expect(await rowTitles()).toEqual(all);

    await user.keyboard("{Enter}");
    expect(await rowTitles()).toEqual(["Fel på faktura", "Faktura saknas"]);
  });

  it("SF-A14: the search field holds at most 100 characters", async () => {
    render(<App />);
    const user = userEvent.setup();
    await rowTitles();

    await user.type(screen.getByLabelText("Sök"), "a".repeat(101));
    expect(screen.getByLabelText("Sök")).toHaveValue("a".repeat(100));
  });
});

// S1–S4 from docs/specs/statusoversikt.md: S1, S2 and S4 are C1–C3 with S2 set to Nytt.
// A new copy each time, since creating a case adds to the array.
function statusCases(): Arende[] {
  const [c1, c2, c3] = seedArenden();
  return [
    c1,
    { ...c2, status: "Nytt" },
    {
      id: 4,
      rubrik: "Paketet har inte kommit",
      beskrivning: "Kunden väntar fortfarande på sitt paket.",
      kategori: "Leverans",
      prioritet: "Medel",
      status: "Pågående",
      skapad: "2026-10-23T10:00:00Z",
    },
    c3,
  ];
}

const S1_S4_COUNTS = ["Nytt 2", "Pågående 1", "Väntar på kund 0", "Avslutat 1"];

// Found by its name, as a screen reader user would (SO-K1).
const overview = () => screen.queryByRole("list", { name: "Antal ärenden per status" });
// queryAll, so that an empty overview gives a diff instead of failing in the helper.
const overviewItems = () =>
  within(screen.getByRole("list", { name: "Antal ärenden per status" }))
    .queryAllByRole("listitem")
    .map((item) => item.textContent);

describe("App – status overview (statusoversikt.md)", () => {
  it("SO-A1: opening the list shows Nytt 2, Pågående 1, Väntar på kund 0, Avslutat 1 and all four cases", async () => {
    db.reset(statusCases());
    expect(db.arenden).toHaveLength(4);
    render(<App />);

    expect(await rowTitles()).toEqual([
      "Paketet har inte kommit",
      "Fel på faktura",
      "Kan inte logga in",
      "Faktura saknas",
    ]);
    expect(overviewItems()).toEqual(S1_S4_COUNTS);
  });

  it("SO-A2: with no cases the overview shows 0 for all four and the list 'Inga ärenden ännu'", async () => {
    db.reset([]);
    expect(db.arenden).toEqual([]);
    render(<App />);

    expect(await screen.findByText("Inga ärenden ännu")).toBeInTheDocument();
    expect(overviewItems()).toEqual(["Nytt 0", "Pågående 0", "Väntar på kund 0", "Avslutat 0"]);
  });

  it("SO-A3: changing S1 from Nytt to Pågående updates the overview, the other counts are unchanged", async () => {
    db.reset(statusCases());
    render(<App />);
    const user = userEvent.setup();
    await rowTitles();
    expect(overviewItems()).toEqual(S1_S4_COUNTS);

    await user.click(screen.getByText("Faktura saknas"));
    await user.selectOptions(await screen.findByLabelText("Ändra status"), "Pågående");
    await screen.findByText("Pågående", { selector: "aside .badge" });

    await waitFor(() =>
      expect(overviewItems()).toEqual(["Nytt 1", "Pågående 2", "Väntar på kund 0", "Avslutat 1"]),
    );
    expect(db.arenden.find((a) => a.rubrik === "Faktura saknas")?.status).toBe("Pågående");
  });

  it("SO-A4: creating a valid case updates the overview to Nytt 3, the other counts are unchanged", async () => {
    db.reset(statusCases());
    render(<App />);
    const user = userEvent.setup();
    await rowTitles();
    expect(overviewItems()).toEqual(S1_S4_COUNTS);

    await user.click(screen.getByRole("button", { name: "Nytt ärende" }));
    const side = screen.getByRole("complementary", { name: "Nytt ärende" });
    await user.type(within(side).getByLabelText("Rubrik"), "Leverans försenad");
    await user.type(within(side).getByLabelText("Beskrivning"), "Paketet har inte kommit.");
    await user.selectOptions(within(side).getByLabelText("Kategori"), "Leverans");
    await user.selectOptions(within(side).getByLabelText("Prioritet"), "Hög");
    await user.click(within(side).getByRole("button", { name: "Skapa ärende" }));

    await waitFor(() =>
      expect(overviewItems()).toEqual(["Nytt 3", "Pågående 1", "Väntar på kund 0", "Avslutat 1"]),
    );
    expect(await rowTitles()).toHaveLength(5);
    expect(db.arenden).toHaveLength(5);
  });

  it("SO-A5: searching 'xyz' and filtering Avslutat gives 'Inga ärenden matchar', the overview is unchanged", async () => {
    db.reset(statusCases());
    const before = structuredClone(db.arenden);
    render(<App />);
    const user = userEvent.setup();
    await rowTitles();
    expect(overviewItems()).toEqual(S1_S4_COUNTS);

    await user.type(screen.getByLabelText("Sök"), "xyz{Enter}");
    await user.selectOptions(screen.getByLabelText("Filtrera status"), "Avslutat");

    expect(await screen.findByText("Inga ärenden matchar")).toBeInTheDocument();
    expect(overviewItems()).toEqual(S1_S4_COUNTS);
    expect(db.arenden).toEqual(before);
  });

  it("SO-A6: when the list cannot be fetched an error is shown and no overview", async () => {
    server.use(http.get(`${API_BASE_URL}/arenden`, () => HttpResponse.error()));
    render(<App />);

    // Wait for the error first, otherwise the overview is only missing because the list is loading.
    expect(await screen.findByRole("alert")).toHaveTextContent("Kunde inte nå servern");
    expect(overview()).not.toBeInTheDocument();
  });

  it("SO-A7: while the list is loading 'Laddar ärenden…' is shown and no overview", async () => {
    db.reset(statusCases());
    render(<App />);

    expect(screen.getByRole("status")).toHaveTextContent("Laddar ärenden…");
    expect(overview()).not.toBeInTheDocument();

    // Once loaded the overview appears, so it was missing because the list was loading.
    await rowTitles();
    expect(overviewItems()).toEqual(S1_S4_COUNTS);
  });

  it("SO-A8: opening the list with three Avslutat cases shows Nytt 0, Pågående 0, Väntar på kund 0, Avslutat 3", async () => {
    db.reset(seedArenden().map((a) => ({ ...a, status: "Avslutat" as const })));
    expect(db.arenden.map((a) => a.status)).toEqual(["Avslutat", "Avslutat", "Avslutat"]);
    render(<App />);

    expect(await rowTitles()).toHaveLength(3);
    expect(overviewItems()).toEqual(["Nytt 0", "Pågående 0", "Väntar på kund 0", "Avslutat 3"]);
  });
});
