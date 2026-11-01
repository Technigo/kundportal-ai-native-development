import "vitest"

// Types for the jest-axe matcher registered in setup.ts.
declare module "vitest" {
  interface Assertion {
    toHaveNoViolations(): void
  }
}
