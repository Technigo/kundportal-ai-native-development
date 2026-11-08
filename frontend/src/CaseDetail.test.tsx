import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import CaseDetail from "./CaseDetail";

const mockCase = {
  id: "case-1",
  title: "Login issue",
  description: "Cannot log in",
  category: "Technical support",
  priority: "High",
  status: "new" as const,
  customer_email: "customer@example.com",
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

vi.mock("./caseService", () => ({
  getCaseById: vi.fn(),
  updateCase: vi.fn(),
  CaseApiError: class CaseApiError extends Error {},
}));

import { getCaseById, updateCase } from "./caseService";

describe("CaseDetail", () => {
  it("loads and displays case details", async () => {
    (getCaseById as ReturnType<typeof vi.fn>).mockResolvedValue(mockCase);
    render(<CaseDetail caseId="case-1" onBack={() => {}} />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /login issue/i })).toBeInTheDocument();
    });

    expect(screen.getByText("Cannot log in")).toBeInTheDocument();
    expect(screen.getByText("customer@example.com")).toBeInTheDocument();
    expect(screen.getByText("Technical support")).toBeInTheDocument();
    expect(screen.getByText("High")).toBeInTheDocument();
  });

  it("edits and saves a description and status change", async () => {
    (getCaseById as ReturnType<typeof vi.fn>).mockResolvedValue(mockCase);
    (updateCase as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...mockCase,
      description: "Updated description",
      status: "in_progress",
    });

    const user = userEvent.setup();
    render(<CaseDetail caseId="case-1" onBack={() => {}} />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /edit case/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /edit case/i }));

    const descriptionField = screen.getByLabelText(/description/i);
    await user.clear(descriptionField);
    await user.type(descriptionField, "Updated description");
    await user.selectOptions(screen.getByLabelText(/status/i), "in_progress");

    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(updateCase).toHaveBeenCalledWith("case-1", {
        description: "Updated description",
        status: "in_progress",
      });
    });

    await waitFor(() => {
      expect(screen.getByText("Updated description")).toBeInTheDocument();
    });
  });

  it("cancels editing and reverts unsaved changes", async () => {
    (getCaseById as ReturnType<typeof vi.fn>).mockResolvedValue(mockCase);
    const user = userEvent.setup();
    render(<CaseDetail caseId="case-1" onBack={() => {}} />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /edit case/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /edit case/i }));
    const descriptionField = screen.getByLabelText(/description/i);
    await user.clear(descriptionField);
    await user.type(descriptionField, "Unsaved change");

    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(screen.getByText("Cannot log in")).toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: /description/i })).not.toBeInTheDocument();
  });

  it("validates an empty description before saving", async () => {
    (getCaseById as ReturnType<typeof vi.fn>).mockResolvedValue(mockCase);
    const user = userEvent.setup();
    render(<CaseDetail caseId="case-1" onBack={() => {}} />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /edit case/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /edit case/i }));
    const descriptionField = screen.getByLabelText(/description/i);
    await user.clear(descriptionField);

    await user.click(screen.getByRole("button", { name: /save changes/i }));

    expect(screen.getByText(/description is required/i)).toBeInTheDocument();
    expect(updateCase).not.toHaveBeenCalled();
  });

  it("shows an error state when loading fails", async () => {
    (getCaseById as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("not found"));
    const user = userEvent.setup();
    render(<CaseDetail caseId="case-1" onBack={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText(/could not load this case/i)).toBeInTheDocument();
    });

    (getCaseById as ReturnType<typeof vi.fn>).mockResolvedValue(mockCase);
    await user.click(screen.getByRole("button", { name: /try again/i }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /login issue/i })).toBeInTheDocument();
    });
  });
});