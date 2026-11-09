import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Ticket } from "@/db/schema";
import { TicketList } from "./TicketList";

function ticket(overrides: Partial<Ticket>): Ticket {
  return {
    id: 1,
    requesterName: "Ada Lovelace",
    requesterEmail: null,
    subject: "Subject",
    description: "Description",
    status: "open",
    priority: "normal",
    createdAt: new Date("2026-01-03T10:00:00Z"),
    ...overrides,
  };
}

describe("TicketList", () => {
  it("renders a row per ticket with subject, requester, status, priority and date", () => {
    render(
      <TicketList
        tickets={[
          ticket({ id: 1, subject: "Invoice missing", requesterName: "Grace Hopper", status: "in_progress", priority: "high" }),
          ticket({ id: 2, subject: "Change address", status: "closed", createdAt: new Date("2025-12-24T10:00:00Z") }),
        ]}
      />,
    );

    const rows = within(screen.getByRole("table")).getAllByRole("row").slice(1);
    expect(rows).toHaveLength(2);
    expect(within(rows[0]!).getByText("Invoice missing")).toBeInTheDocument();
    expect(within(rows[0]!).getByText("Grace Hopper")).toBeInTheDocument();
    expect(within(rows[0]!).getByText("In progress")).toBeInTheDocument();
    expect(within(rows[0]!).getByText("High")).toBeInTheDocument();
    expect(within(rows[0]!).getByText("Jan 3, 2026")).toBeInTheDocument();
    expect(within(rows[1]!).getByText("Closed")).toBeInTheDocument();
  });

  it("links each subject to the ticket details", () => {
    render(<TicketList tickets={[ticket({ id: 7, subject: "Invoice missing" })]} />);

    expect(screen.getByRole("link", { name: "Invoice missing" })).toHaveAttribute("href", "/tickets/7");
  });

  it("shows an empty state when there are no tickets", () => {
    render(<TicketList tickets={[]} />);
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.getByText("No tickets yet.")).toBeInTheDocument();
  });
});
