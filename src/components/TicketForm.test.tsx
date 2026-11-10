import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { SubmitTicketState } from "@/app/(portal)/tickets/actions";
import { TicketForm } from "./TicketForm";

describe("TicketForm", () => {
  it("has labelled requester, subject, description, category and priority fields", () => {
    render(<TicketForm action={vi.fn()} />);
    expect(screen.getByLabelText("Requester name")).toBeRequired();
    expect(screen.getByLabelText("Requester email (optional)")).not.toBeRequired();
    expect(screen.getByLabelText("Subject")).toBeRequired();
    expect(screen.getByLabelText("Description")).toBeRequired();
    expect(screen.getByLabelText("Category")).toBeRequired();
    expect(screen.getByLabelText("Category")).toHaveAttribute("maxlength", "50");
    expect(screen.getByLabelText("Priority")).toHaveValue("normal");
  });

  it("limits each text field to its documented length", () => {
    render(<TicketForm action={vi.fn()} />);
    expect(screen.getByLabelText("Requester name")).toHaveAttribute("maxlength", "120");
    expect(screen.getByLabelText("Requester email (optional)")).toHaveAttribute("maxlength", "254");
    expect(screen.getByLabelText("Subject")).toHaveAttribute("maxlength", "120");
    expect(screen.getByLabelText("Description")).toHaveAttribute("maxlength", "5000");
    expect(screen.getByLabelText("Category")).toHaveAttribute("maxlength", "50");
  });

  it("sends the entered values to the action", async () => {
    const action = vi.fn<(s: SubmitTicketState, f: FormData) => Promise<SubmitTicketState>>(async () => undefined);
    render(<TicketForm action={action} />);

    await userEvent.type(screen.getByLabelText("Requester name"), "Ada Lovelace");
    await userEvent.type(screen.getByLabelText("Requester email (optional)"), "ada@example.com");
    await userEvent.type(screen.getByLabelText("Subject"), "Late delivery");
    await userEvent.type(screen.getByLabelText("Description"), "Order 42 has not arrived.");
    await userEvent.type(screen.getByLabelText("Category"), "Delivery");
    await userEvent.selectOptions(screen.getByLabelText("Priority"), "high");
    await userEvent.click(screen.getByRole("button", { name: "Register ticket" }));

    const sent = action.mock.calls[0]![1];
    expect(Object.fromEntries(sent)).toMatchObject({
      requesterName: "Ada Lovelace",
      requesterEmail: "ada@example.com",
      subject: "Late delivery",
      description: "Order 42 has not arrived.",
      category: "Delivery",
      priority: "high",
    });
  });

  it("shows the errors returned by the action and keeps the entered values", async () => {
    const action = vi.fn(async (): Promise<SubmitTicketState> => ({
      errors: { subject: ["Subject must be at least 3 characters."], requesterEmail: ["Please enter a valid email address."] },
      values: { requesterName: "Ada", requesterEmail: "ada@", subject: "Hi", description: "Something broke", category: "Billing", priority: "low" },
    }));
    render(<TicketForm action={action} />);

    await userEvent.type(screen.getByLabelText("Subject"), "Hi");
    await userEvent.type(screen.getByLabelText("Description"), "Something broke");
    await userEvent.click(screen.getByRole("button", { name: "Register ticket" }));

    expect(await screen.findByText("Subject must be at least 3 characters.")).toBeInTheDocument();
    expect(screen.getByText("Please enter a valid email address.")).toBeInTheDocument();
    expect(screen.getByLabelText("Requester email (optional)")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Requester email (optional)")).toHaveValue("ada@");
    expect(screen.getByLabelText("Requester name")).toHaveValue("Ada");
    expect(screen.getByLabelText("Subject")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Subject")).toHaveValue("Hi");
    expect(screen.getByLabelText("Description")).toHaveValue("Something broke");
    expect(screen.getByLabelText("Category")).toHaveValue("Billing");
    expect(screen.getByLabelText("Priority")).toHaveValue("low");
  });

  it("shows the category error next to the field and keeps the entered category", async () => {
    const action = vi.fn(async (): Promise<SubmitTicketState> => ({
      errors: { category: ["Please enter a category."] },
      values: { requesterName: "Ada", requesterEmail: "", subject: "Hello", description: "Body", category: "   ", priority: "normal" },
    }));
    render(<TicketForm action={action} />);

    await userEvent.click(screen.getByRole("button", { name: "Register ticket" }));

    const category = await screen.findByLabelText("Category");
    expect(category).toHaveAttribute("aria-invalid", "true");
    expect(category).toHaveAccessibleDescription("Please enter a category.");
    expect(category).toHaveValue("   ");
  });

  it("disables the submit button while the action is pending", async () => {
    let finish!: () => void;
    const action = vi.fn(() => new Promise<SubmitTicketState>((resolve) => (finish = () => resolve(undefined))));
    render(<TicketForm action={action} />);

    await userEvent.type(screen.getByLabelText("Subject"), "Pending case");
    await userEvent.type(screen.getByLabelText("Description"), "Wait");
    await userEvent.click(screen.getByRole("button", { name: "Register ticket" }));

    expect(await screen.findByRole("button", { name: "Registering…" })).toBeDisabled();
    finish();
    expect(await screen.findByRole("button", { name: "Register ticket" })).toBeEnabled();
  });
});
