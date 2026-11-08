import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import CreateCaseForm from "./CreateCaseForm";

vi.mock("./caseService", () => ({
  createCase: vi.fn(),
  CaseApiError: class CaseApiError extends Error {},
}));

import { createCase } from "./caseService";

describe("CreateCaseForm", () => {
  it("shows required-field errors when submitting an empty form", async () => {
    const user = userEvent.setup();
    render(<CreateCaseForm onBack={() => {}} />);

    await user.click(screen.getByRole("button", { name: /create case/i }));

    expect(screen.getByText(/customer email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/issue title is required/i)).toBeInTheDocument();
    expect(screen.getByText(/description is required/i)).toBeInTheDocument();
    expect(screen.getByText(/category is required/i)).toBeInTheDocument();
    expect(screen.getByText(/priority is required/i)).toBeInTheDocument();
    expect(screen.getByText(/status is required/i)).toBeInTheDocument();
  });

  it("shows an email format error for an invalid email", async () => {
    const user = userEvent.setup();
    render(<CreateCaseForm onBack={() => {}} />);

    await user.type(screen.getByLabelText(/customer email/i), "not-an-email");
    await user.click(screen.getByRole("button", { name: /create case/i }));

    expect(screen.getByText(/enter a valid email address/i)).toBeInTheDocument();
  });

  it("creates a case with trimmed values and shows success", async () => {
    (createCase as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "case-123",
      title: "Login issue",
      description: "Cannot log in",
      category: "Technical support",
      priority: "High",
      status: "new",
      customer_email: "customer@example.com",
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    });

    const user = userEvent.setup();
    render(<CreateCaseForm onBack={() => {}} />);

    await user.type(screen.getByLabelText(/customer email/i), "  customer@example.com  ");
    await user.type(screen.getByLabelText(/issue title/i), "  Login issue  ");
    await user.type(screen.getByLabelText(/description/i), "  Cannot log in  ");
    await user.selectOptions(screen.getByLabelText(/category/i), "Technical support");
    await user.selectOptions(screen.getByLabelText(/priority/i), "High");
    await user.selectOptions(screen.getByLabelText(/status/i), "new");

    await user.click(screen.getByRole("button", { name: /create case/i }));

    await waitFor(() => {
      expect(createCase).toHaveBeenCalledWith({
        title: "Login issue",
        description: "Cannot log in",
        category: "Technical support",
        priority: "High",
        status: "new",
        customer_email: "customer@example.com",
      });
    });

    expect(screen.getByText(/case created and saved/i)).toBeInTheDocument();
  });

  it("shows a server error when creation fails", async () => {
    (createCase as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("server down"));

    const user = userEvent.setup();
    render(<CreateCaseForm onBack={() => {}} />);

    await user.type(screen.getByLabelText(/customer email/i), "customer@example.com");
    await user.type(screen.getByLabelText(/issue title/i), "Login issue");
    await user.type(screen.getByLabelText(/description/i), "Cannot log in");
    await user.selectOptions(screen.getByLabelText(/category/i), "Technical support");
    await user.selectOptions(screen.getByLabelText(/priority/i), "High");
    await user.selectOptions(screen.getByLabelText(/status/i), "new");

    await user.click(screen.getByRole("button", { name: /create case/i }));

    await waitFor(() => {
      expect(screen.getByText(/the case could not be saved/i)).toBeInTheDocument();
    });
  });
});