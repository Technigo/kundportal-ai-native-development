import { describe, expect, it } from "vitest";
import { seedArenden } from "../mocks/data";
import type { ArendeStatus } from "../types/arende";
import { countByStatus } from "./countByStatus";

// Only the status counts (docs/specs/statusoversikt.md), so the other fields come from C1.
const [c1] = seedArenden();
const withStatuses = (...statuses: ArendeStatus[]) =>
  statuses.map((status, i) => ({ ...c1, id: i + 1, status }));

describe("countByStatus (statusoversikt.md)", () => {
  it("SO-A1: S1–S4 give Nytt 2, Pågående 1, Väntar på kund 0, Avslutat 1, in that order", () => {
    expect(countByStatus(withStatuses("Nytt", "Nytt", "Pågående", "Avslutat"))).toEqual([
      { status: "Nytt", count: 2 },
      { status: "Pågående", count: 1 },
      { status: "Väntar på kund", count: 0 },
      { status: "Avslutat", count: 1 },
    ]);
  });

  it("SO-A2: no cases give 0 for all four statuses", () => {
    expect(countByStatus([])).toEqual([
      { status: "Nytt", count: 0 },
      { status: "Pågående", count: 0 },
      { status: "Väntar på kund", count: 0 },
      { status: "Avslutat", count: 0 },
    ]);
  });

  it("SO-A8: three cases, all Avslutat, give Nytt 0, Pågående 0, Väntar på kund 0, Avslutat 3, in that order", () => {
    expect(countByStatus(withStatuses("Avslutat", "Avslutat", "Avslutat"))).toEqual([
      { status: "Nytt", count: 0 },
      { status: "Pågående", count: 0 },
      { status: "Väntar på kund", count: 0 },
      { status: "Avslutat", count: 3 },
    ]);
  });
});
