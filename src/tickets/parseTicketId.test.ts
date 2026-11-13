import { describe, expect, it } from "vitest";
import { parseTicketId } from "./parseTicketId";

describe("parseTicketId", () => {
  it.each([
    ["1", 1],
    ["42", 42],
    ["1000", 1000],
  ])("accepts %j as %i", (raw, expected) => {
    expect(parseTicketId(raw)).toBe(expected);
  });

  it.each(["0", "-1", "1.5", "1.0", "01", "1e0", "0x1", " 1", "1 ", "+1", "abc", "", "99999999999999999999"])(
    "rejects %j",
    (raw) => {
      expect(parseTicketId(raw)).toBeUndefined();
    },
  );
});
