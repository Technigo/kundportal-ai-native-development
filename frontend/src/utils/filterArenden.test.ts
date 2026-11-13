import { describe, expect, it } from "vitest";
import { seedArenden } from "../mocks/data";
import type { ArendeFilter } from "../types/arende";
import { filterArenden, sortNewestFirst } from "./filterArenden";

// C1–C3 from docs/specs/sok-filter.md, in the order the list shows them (newest first, R6).
const [C1, C2, C3] = seedArenden().map((a) => a.rubrik);
const list = sortNewestFirst(seedArenden());
const titles = (filter: ArendeFilter) => filterArenden(list, filter).map((a) => a.rubrik);

describe("filterArenden (sok-filter.md)", () => {
  it("SF-A1: 'faktura' finds C3 and C1, with C3 first", () => {
    expect(titles({ q: "faktura" })).toEqual([C3, C1]);
  });

  it("SF-A2: 'FAKTURA' gives the same result as 'faktura'", () => {
    expect(titles({ q: "FAKTURA" })).toEqual([C3, C1]);
  });

  it("SF-A3: 'FÖR' finds only C1", () => {
    expect(titles({ q: "FÖR" })).toEqual([C1]);
  });

  it("SF-A4: 'inloggningen', only in the description, finds only C2", () => {
    expect(titles({ q: "inloggningen" })).toEqual([C2]);
  });

  it("SF-A5: part of a word, 'faktur', finds C3 and C1", () => {
    expect(titles({ q: "faktur" })).toEqual([C3, C1]);
  });

  it("SF-A6: status Nytt shows only C1, and Alla shows all three again", () => {
    expect(titles({ status: "Nytt" })).toEqual([C1]);
    expect(titles({ status: undefined })).toEqual([C3, C2, C1]);
  });

  it("SF-A7: kategori Teknik shows only C2", () => {
    expect(titles({ kategori: "Teknik" })).toEqual([C2]);
  });

  it("SF-A8: prioritet Låg shows only C3", () => {
    expect(titles({ prioritet: "Låg" })).toEqual([C3]);
  });

  it("SF-A9: 'faktura' and status Nytt together show only C1", () => {
    expect(titles({ q: "faktura", status: "Nytt" })).toEqual([C1]);
  });

  it("SF-A11: only spaces shows all three, and '  faktura  ' is the same as 'faktura'", () => {
    expect(titles({ q: "   " })).toEqual([C3, C2, C1]);
    expect(titles({ q: "  faktura  " })).toEqual([C3, C1]);
  });

  it("returns an empty list when nothing matches", () => {
    expect(titles({ q: "xyz123" })).toEqual([]);
  });

  it("SF-R6: treats special characters as plain text", () => {
    for (const q of ["%", "_", "'", '"', "<script>", ".*"]) {
      expect(titles({ q })).toEqual([]);
    }
  });

  it("SF-R8: does not change the cases", () => {
    const copy = structuredClone(list);
    filterArenden(list, { q: "faktura", status: "Nytt" });
    expect(list).toEqual(copy);
  });
});

describe("sortNewestFirst (R6)", () => {
  it("A12: the most recently created case comes first and the oldest last", () => {
    const [c1, c2, c3] = seedArenden();
    // Neither the ids nor the input order follow the created time, so only skapad decides.
    const unordered = [
      { ...c1, skapad: "2026-10-21T09:30:00Z" },
      { ...c2, skapad: "2026-10-22T14:15:00Z" },
      { ...c3, skapad: "2026-10-20T08:00:00Z" },
    ];
    expect(sortNewestFirst(unordered).map((a) => a.id)).toEqual([2, 1, 3]);
  });

  it("R6: with the same created time, the highest id comes first", () => {
    const [c1, c2] = seedArenden();
    const sameTime = [c1, { ...c2, skapad: c1.skapad }];
    expect(sortNewestFirst(sameTime).map((a) => a.id)).toEqual([2, 1]);
  });
});
