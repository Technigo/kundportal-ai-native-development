import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import App from "./App";

vi.mock("./caseService", () => ({
  getCaseById: vi.fn().mockResolvedValue({
    id: "case-123",
    title: "Test case",
    description: "Description",
    category: "Technical support",
    priority: "High",
    status: "new",
    customer_email: "customer@example.com",
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  }),
  getCases: vi.fn().mockResolvedValue([]),
  createCase: vi.fn(),
  updateCase: vi.fn(),
}));

describe("App routing", () => {
  it("shows the cases overview by default", () => {
    window.location.hash = "";
    render(<App />);

    expect(screen.getByRole("heading", { name: /cases overview/i })).toBeInTheDocument();
  });

  it("shows the create case form on the new-case route", async () => {
    const user = userEvent.setup();
    window.location.hash = "#/cases";
    render(<App />);

    await user.click(screen.getAllByRole("button", { name: /create new case/i })[0]);

    expect(screen.getByRole("heading", { name: /new case/i })).toBeInTheDocument();
  });

  it("shows the case detail page for a case route", () => {
    window.location.hash = "#/cases/case-123";
    render(<App />);

    // Detail page attempts to load; loading state is shown.
    expect(screen.getByText(/loading case/i)).toBeInTheDocument();
  });
});