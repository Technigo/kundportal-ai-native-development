import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { seedArenden } from "../mocks/data";
import type { ArendeStatus } from "../types/arende";
import { StatusOverview } from "./StatusOverview";

// Only the statuses matter (docs/specs/statusoversikt.md), so the other fields come from C1.
const [c1] = seedArenden();
const withStatuses = (...statuses: ArendeStatus[]) =>
  statuses.map((status, i) => ({ ...c1, id: i + 1, status }));
const S1_S4 = withStatuses("Nytt", "Nytt", "Pågående", "Avslutat");

// Found by its name, as a screen reader user would (SO-K1).
const overview = () => screen.getByRole("list", { name: "Antal ärenden per status" });
const items = () =>
  within(overview())
    .queryAllByRole("listitem")
    .map((item) => item.textContent);

describe("StatusOverview (statusoversikt.md)", () => {
  it("SO-K1: the overview is named 'Antal ärenden per status' and each status reads together with its number", () => {
    render(<StatusOverview arenden={S1_S4} />);
    expect(items()).toEqual(["Nytt 2", "Pågående 1", "Väntar på kund 0", "Avslutat 1"]);
  });

  it("SO-A1: shows the four statuses in order, with no buttons or links", () => {
    render(<StatusOverview arenden={S1_S4} />);
    expect(items()).toEqual(["Nytt 2", "Pågående 1", "Väntar på kund 0", "Avslutat 1"]);
    // queryAll, so that several buttons give a clear diff instead of "Found multiple elements".
    expect(within(overview()).queryAllByRole("button")).toEqual([]);
    expect(within(overview()).queryAllByRole("link")).toEqual([]);
  });

  it("SO-A2: with no cases all four statuses show 0", () => {
    render(<StatusOverview arenden={[]} />);
    expect(items()).toEqual(["Nytt 0", "Pågående 0", "Väntar på kund 0", "Avslutat 0"]);
  });
});
