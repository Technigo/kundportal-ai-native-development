import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Ticket, TicketStatusChange } from "@/db/schema";
import { statusLabels } from "@/tickets/statusLabels";
import { ticketStatuses } from "@/tickets/ticketSchema";
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
    category: "General",
    createdAt: new Date("2026-01-03T10:00:00Z"),
    ...overrides,
  };
}

function change(overrides: Partial<TicketStatusChange>): TicketStatusChange {
  return {
    id: 1,
    ticketId: 1,
    fromStatus: "open",
    toStatus: "in_progress",
    changedAt: new Date("2026-11-09T10:00:00Z"),
    ...overrides,
  };
}

function renderDetails(t: Ticket, changes: TicketStatusChange[] = []) {
  return render(<TicketDetails ticket={t} changes={changes} statusAction={vi.fn()} />);
}

describe("TicketDetails", () => {
  it("shows the subject, requester name and requester email", () => {
    renderDetails(ticket({}));

    expect(screen.getByRole("heading", { level: 1, name: "Login fails" })).toBeInTheDocument();
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("ada@example.com")).toBeInTheDocument();
  });

  it("says that no email was given when the requester has none", () => {
    renderDetails(ticket({ requesterEmail: null }));

    expect(screen.getByText("No email given")).toBeInTheDocument();
  });

  it("shows the full description and keeps its line breaks", () => {
    renderDetails(ticket({ description: "Line one.\nLine two." }));

    expect(screen.getByText(/Line one\./).textContent).toBe("Line one.\nLine two.");
  });

  it("shows status, priority and created date", () => {
    renderDetails(ticket({ status: "in_progress", priority: "high" }));

    // The status dropdown also has an "In progress" option, so look at the status badge only.
    expect(screen.getByText("In progress", { selector: "span" })).toBeInTheDocument();
    expect(screen.getByText("High")).toBeInTheDocument();
    expect(screen.getByText("Jan 3, 2026")).toBeInTheDocument();
  });

  it("links back to the ticket list", () => {
    renderDetails(ticket({}));

    expect(screen.getByRole("link", { name: "Back to tickets" })).toHaveAttribute("href", "/tickets");
  });

  it("has the status form in the status and history section, starting on the current status", () => {
    const current = ticketStatuses[1];
    renderDetails(ticket({ status: current }));

    const section = screen.getByRole("region", { name: "Status and history" });
    expect(within(section).getByLabelText("Status")).toHaveValue(current);
    expect(within(section).getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("shows the status history in the order given, with from, to and date", () => {
    const [a, b, c] = ticketStatuses;
    renderDetails(ticket({ status: c }), [
      change({ id: 2, fromStatus: b, toStatus: c, changedAt: new Date("2026-11-09T12:00:00Z") }),
      change({ id: 1, fromStatus: a, toStatus: b, changedAt: new Date("2026-11-08T10:00:00Z") }),
    ]);

    const section = screen.getByRole("region", { name: "Status and history" });
    expect(within(section).getByRole("heading", { level: 2, name: "Status history" })).toBeInTheDocument();
    const items = within(section).getAllByRole("listitem");
    expect(items.map((item) => item.textContent)).toEqual([
      `${statusLabels[b]} → ${statusLabels[c]} · Nov 9, 2026`,
      `${statusLabels[a]} → ${statusLabels[b]} · Nov 8, 2026`,
    ]);
    expect(within(items[0]!).getByText("Nov 9, 2026")).toHaveAttribute("dateTime", "2026-11-09T12:00:00.000Z");
  });

  it("says there are no status changes yet when the history is empty", () => {
    renderDetails(ticket({}));

    const section = screen.getByRole("region", { name: "Status and history" });
    expect(within(section).getByText("No status changes yet.")).toBeInTheDocument();
    expect(within(section).queryByRole("listitem")).not.toBeInTheDocument();
  });

  it("shows its children after the status and history section", () => {
    render(
      <TicketDetails ticket={ticket({})} changes={[]} statusAction={vi.fn()}>
        <p>Notes go here</p>
      </TicketDetails>,
    );

    const status = screen.getByRole("region", { name: "Status and history" });
    expect(status.compareDocumentPosition(screen.getByText("Notes go here")) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
