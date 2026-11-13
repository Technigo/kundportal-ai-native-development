import { describe, expect, it } from "vitest"

import { parseApiTime } from "./format"

// API times include microseconds. Only milliseconds are kept, so parsing cannot fail.
describe("parseApiTime", () => {
  it("cuts microseconds before parsing", () => {
    expect(parseApiTime("2026-10-29T20:38:00.701559Z").toISOString()).toBe(
      "2026-10-29T20:38:00.701Z",
    )
  })
})
