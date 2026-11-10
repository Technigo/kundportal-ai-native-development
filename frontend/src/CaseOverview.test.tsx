import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import CaseOverview from "./CaseOverview";

const mockCases = [
  {
    id: "case-1",
    title: "Login issue",
    description: "Cannot log in",
    category: "Technical support",
    priority: "High",
    status: "new" as const,
    customer_email: "alice@example.com",
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "case-2",
    title: "Billing question",
    description: "Invoice missing",
    category: "Billing",
    priority: "Low",
    status: "closed" as const,
    customer_email: "bob@example.com",
    created_at: "2026-01-02T00:00:00.000Z",
    updated_at: "2026-01-02T00:00:00.000Z",
  },
];

vi.mock("./caseService", () => ({
  getCases: vi.fn(),
  CaseApiError: class CaseApiError extends Error {},
}));

import { getCases } from "./caseService";

describe("CaseOverview", () => {
  it("shows a loading state while cases are being fetched", () => {
    (getCases as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}));
    render(<CaseOverview onCreateCase={() => {}} />);

    expect(screen.getByText(/loading cases/i)).toBeInTheDocument();
  });

  it("shows an empty state when no cases exist", async () => {
    (getCases as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    render(<CaseOverview onCreateCase={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText(/no cases yet/i)).toBeInTheDocument();
    });
  });

  it("renders all returned cases", async () => {
    (getCases as ReturnType<typeof vi.fn>).mockResolvedValue(mockCases);
    render(<CaseOverview onCreateCase={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText("Login issue")).toBeInTheDocument();
      expect(screen.getByText("Billing question")).toBeInTheDocument();
    });
  });

  it("filters cases by search text", async () => {
    (getCases as ReturnType<typeof vi.fn>).mockResolvedValue(mockCases);
    const user = userEvent.setup();
    render(<CaseOverview onCreateCase={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText("Login issue")).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/search cases/i), "alice@example.com");

    expect(screen.getByText("Login issue")).toBeInTheDocument();
    expect(screen.queryByText("Billing question")).not.toBeInTheDocument();
  });

  it("filters cases by status", async () => {
    (getCases as ReturnType<typeof vi.fn>).mockResolvedValue(mockCases);
    const user = userEvent.setup();
    render(<CaseOverview onCreateCase={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText("Login issue")).toBeInTheDocument();
    });

    await user.selectOptions(screen.getByLabelText(/status/i), "closed");

    expect(screen.getByText("Billing question")).toBeInTheDocument();
    expect(screen.queryByText("Login issue")).not.toBeInTheDocument();
  });

  it("shows a no-match state and clears filters", async () => {
    (getCases as ReturnType<typeof vi.fn>).mockResolvedValue(mockCases);
    const user = userEvent.setup();
    render(<CaseOverview onCreateCase={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText("Login issue")).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/search cases/i), "zzzz");

    expect(screen.getByText(/no matching cases/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /clear search and filters/i }));

    expect(screen.getByText("Login issue")).toBeInTheDocument();
    expect(screen.getByText("Billing question")).toBeInTheDocument();
  });

  it("calls onCreateCase when the create button is clicked", async () => {
    (getCases as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    const onCreateCase = vi.fn();
    const user = userEvent.setup();
    render(<CaseOverview onCreateCase={onCreateCase} />);

    await waitFor(() => {
      expect(screen.getByText(/no cases yet/i)).toBeInTheDocument();
    });

    await user.click(screen.getAllByRole("button", { name: /create new case/i })[0]);

    expect(onCreateCase).toHaveBeenCalled();
  });

  it("filters cases by priority", async () => {
    (getCases as ReturnType<typeof vi.fn>).mockResolvedValue(mockCases);
    const user = userEvent.setup();
    render(<CaseOverview onCreateCase={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText("Login issue")).toBeInTheDocument();
    });

    await user.selectOptions(screen.getByLabelText(/priority/i), "Low");

    expect(screen.getByText("Billing question")).toBeInTheDocument();
    expect(screen.queryByText("Login issue")).not.toBeInTheDocument();
  });

  it("search returns exactly the matching cases and hides non-matches", async () => {
    (getCases as ReturnType<typeof vi.fn>).mockResolvedValue(mockCases);
    const user = userEvent.setup();
    render(<CaseOverview onCreateCase={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText("Login issue")).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/search cases/i), "example.com");

    // both cases have example.com emails, so both should show
    expect(screen.getByText("Login issue")).toBeInTheDocument();
    expect(screen.getByText("Billing question")).toBeInTheDocument();
  });

  it("search by a unique term shows only the matching case", async () => {
    (getCases as ReturnType<typeof vi.fn>).mockResolvedValue(mockCases);
    const user = userEvent.setup();
    render(<CaseOverview onCreateCase={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText("Login issue")).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/search cases/i), "Billing question");

    expect(screen.getByText("Billing question")).toBeInTheDocument();
    expect(screen.queryByText("Login issue")).not.toBeInTheDocument();
  });

  it("shows an error and retries loading", async () => {
    (getCases as ReturnType<typeof vi.fn>)
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce(mockCases);
    const user = userEvent.setup();
    render(<CaseOverview onCreateCase={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText(/could not load cases/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /try again/i }));

    await waitFor(() => {
      expect(screen.getByText("Login issue")).toBeInTheDocument();
    });
  });
});