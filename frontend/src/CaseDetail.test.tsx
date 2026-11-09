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
  deleteCase: vi.fn(),
  CaseApiError: class CaseApiError extends Error {},
}));

import { deleteCase, getCaseById } from "./caseService";

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

  it("navigates to the edit form when Edit case is clicked", async () => {
    (getCaseById as ReturnType<typeof vi.fn>).mockResolvedValue(mockCase);
    const user = userEvent.setup();
    render(<CaseDetail caseId="case-1" onBack={() => {}} />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /edit case/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /edit case/i }));

    expect(window.location.hash).toBe("#/cases/case-1/edit");
  });

  it("does not delete the case when the confirmation is cancelled", async () => {
    (getCaseById as ReturnType<typeof vi.fn>).mockResolvedValue(mockCase);
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);
    const onBack = vi.fn();
    const user = userEvent.setup();
    render(<CaseDetail caseId="case-1" onBack={onBack} />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /delete case/i })).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: /delete case/i }));

    expect(confirmSpy).toHaveBeenCalledWith("Are you sure you want to delete this case?");
    expect(deleteCase).not.toHaveBeenCalled();
    expect(onBack).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it("deletes the case after the confirmation is accepted", async () => {
    (getCaseById as ReturnType<typeof vi.fn>).mockResolvedValue(mockCase);
    (deleteCase as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    const onBack = vi.fn();
    const user = userEvent.setup();
    render(<CaseDetail caseId="case-1" onBack={onBack} />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /delete case/i })).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: /delete case/i }));

    await waitFor(() => {
      expect(deleteCase).toHaveBeenCalledWith("case-1");
      expect(onBack).toHaveBeenCalled();
    });
    confirmSpy.mockRestore();
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
