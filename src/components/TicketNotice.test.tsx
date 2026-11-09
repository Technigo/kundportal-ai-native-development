import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TicketNotice } from "./TicketNotice";

describe("TicketNotice", () => {
  it("shows a message for the ticket-not-found code", () => {
    render(<TicketNotice notice="ticket-not-found" />);

    expect(screen.getByRole("status")).toHaveTextContent("This ticket does not exist.");
  });

  it("shows nothing for an unknown code", () => {
    const { container } = render(<TicketNotice notice="<b>hi</b>" />);

    expect(container).toBeEmptyDOMElement();
  });

  it("shows nothing when there is no code", () => {
    const { container } = render(<TicketNotice notice={undefined} />);

    expect(container).toBeEmptyDOMElement();
  });
});
