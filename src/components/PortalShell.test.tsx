import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { navItems } from "@/lib/navigation";
import { PortalShell } from "./PortalShell";

const pathname = vi.hoisted(() => ({ current: "/dashboard" }));

vi.mock("next/navigation", () => ({
  usePathname: () => pathname.current,
}));

describe("PortalShell", () => {
  beforeEach(() => {
    pathname.current = "/dashboard";
  });

  it("renders a banner with the portal name", () => {
    render(<PortalShell>content</PortalShell>);
    expect(within(screen.getByRole("banner")).getByText("Kundserviceportalen")).toBeInTheDocument();
  });

  it("renders one navigation link per nav item", () => {
    render(<PortalShell>content</PortalShell>);
    const nav = screen.getByRole("navigation", { name: "Main" });
    const links = within(nav).getAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual(navItems.map((item) => item.href));
  });

  it("marks the link for the current section as the current page", () => {
    pathname.current = "/tickets/new";
    render(<PortalShell>content</PortalShell>);
    expect(screen.getByRole("link", { name: "Tickets" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Dashboard" })).not.toHaveAttribute("aria-current");
  });

  it("renders its children inside the main landmark", () => {
    render(<PortalShell>page content</PortalShell>);
    expect(within(screen.getByRole("main")).getByText("page content")).toBeInTheDocument();
  });
});
