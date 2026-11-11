import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { ChangeStatusState } from "@/tickets/changeStatusState";
import { statusLabels } from "@/tickets/statusLabels";
import { ticketStatuses } from "@/tickets/ticketSchema";
import { StatusForm } from "./StatusForm";

describe("StatusForm", () => {
  it("offers every status, starts on the current one and sends the ticket id and new status only on Save", async () => {
    const action = vi.fn<(s: ChangeStatusState, f: FormData) => Promise<ChangeStatusState>>(async () => undefined);
    const [first, second] = ticketStatuses;
    render(<StatusForm ticketId={7} status={first} action={action} />);

    const select = screen.getByLabelText("Status");
    expect(select).toHaveValue(first);
    expect(within(select).getAllByRole("option").map((o) => [o.getAttribute("value"), o.textContent])).toEqual(
      ticketStatuses.map((s) => [s, statusLabels[s]]),
    );

    await userEvent.selectOptions(select, second);
    expect(action).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(action).toHaveBeenCalledOnce();
    const sent = action.mock.calls[0]![1];
    expect(sent.get("ticketId")).toBe("7");
    expect(sent.get("status")).toBe(second);
  });

  it("shows Invalid status. next to the dropdown when the action returns it", async () => {
    const action = vi.fn(async (): Promise<ChangeStatusState> => ({ error: "Invalid status." }));
    render(<StatusForm ticketId={7} status={ticketStatuses[0]} action={action} />);
    expect(screen.queryByText("Invalid status.")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Invalid status.")).toBeInTheDocument();
    expect(screen.getByLabelText("Status")).toHaveAccessibleDescription("Invalid status.");
    expect(screen.getByLabelText("Status")).toHaveAttribute("aria-invalid", "true");
  });
});
