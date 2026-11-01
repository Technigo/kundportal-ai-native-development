import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/react"
import { toHaveNoViolations } from "jest-axe"
import { afterEach, expect } from "vitest"

expect.extend(toHaveNoViolations)

// Unmount rendered components so tests do not affect each other.
afterEach(() => {
  cleanup()
})
