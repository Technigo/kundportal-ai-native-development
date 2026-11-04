import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Ticket } from "@/db/schema";
import { TicketDetails } from "./TicketDetails";

function ticket(overrides: Partial<Ticket>): Ticket {
  return {
    id: 1,
    requesterName: "Ada Lovelace",
    requesterEmail: "ada@example.com",
    subject: "Login fails",
    description: "I get a 500 error.",
    status: "open",
    priority: "normal",
    createdAt: new Date("2026-01-03T10:00:00Z"),
    ...overrides,
  };
}

describe("TicketDetails", () => {
  it("shows the subject, requester name and requester email", () => {
    render(<TicketDetails ticket={ticket({})} />);

    expect(screen.getByRole("heading", { level: 1, name: "Login fails" })).toBeInTheDocument();
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("ada@example.com")).toBeInTheDocument();
  });

  it("says that no email was given when the requester has none", () => {
    render(<TicketDetails ticket={ticket({ requesterEmail: null })} />);

    expect(screen.getByText("No email given")).toBeInTheDocument();
  });

  it("shows the full description and keeps its line breaks", () => {
    render(<TicketDetails ticket={ticket({ description: "Line one.\nLine two." })} />);

    expect(screen.getByText(/Line one\./).textContent).toBe("Line one.\nLine two.");
  });

  it("shows status, priority and created date", () => {
    render(<TicketDetails ticket={ticket({ status: "in_progress", priority: "high" })} />);

    expect(screen.getByText("In progress")).toBeInTheDocument();
    expect(screen.getByText("High")).toBeInTheDocument();
    expect(screen.getByText("Jan 3, 2026")).toBeInTheDocument();
  });

  it("links back to the ticket list", () => {
    render(<TicketDetails ticket={ticket({})} />);

    expect(screen.getByRole("link", { name: "Back to tickets" })).toHaveAttribute("href", "/tickets");
  });

  it("has an empty section reserved for status change and history", () => {
    render(<TicketDetails ticket={ticket({})} />);

    expect(screen.getByRole("region", { name: "Status and history" })).toBeEmptyDOMElement();
  });
});
