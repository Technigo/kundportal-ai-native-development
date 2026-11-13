import { describe, expect, it } from "vitest"

import { codePointLength } from "@/lib/code-points"

// CORE-14, B11: lengths are Unicode code points, the same count as Python len().

describe("codePointLength", () => {
  // CORE-14: 😊 is one code point. string.length is 2 (a surrogate pair).
  it("test_core14_smiling_face_is_one_code_point", () => {
    expect(codePointLength("😊")).toBe(1)
    expect("😊".length).toBe(2)
  })

  // CORE-14, B11: 🇸🇪 is two regional-indicator code points.
  it("test_core14_flag_is_two_code_points", () => {
    expect(codePointLength("🇸🇪")).toBe(2)
    expect("🇸🇪".length).toBe(4)
  })

  // CORE-14, B11: 👩‍💻 is woman + ZWJ + computer, three code points.
  // string.length is 5 because two of them are surrogate pairs.
  it("test_core14_compound_emoji_is_three_code_points", () => {
    expect(codePointLength("👩‍💻")).toBe(3)
    expect("👩‍💻".length).toBe(5)
    expect(codePointLength(`${"Å".repeat(98)}👩‍💻`)).toBe(101)
  })
})
