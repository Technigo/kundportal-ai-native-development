import { describe, expect, it } from "vitest";
import { navItems } from "./navigation";

describe("navItems", () => {
  it("lists the case handler sections in order", () => {
    expect(navItems.map((item) => item.label)).toEqual(["Dashboard", "Tickets"]);
  });

  it("gives every item a unique absolute href", () => {
    const hrefs = navItems.map((item) => item.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
    for (const href of hrefs) expect(href).toMatch(/^\//);
  });
});
