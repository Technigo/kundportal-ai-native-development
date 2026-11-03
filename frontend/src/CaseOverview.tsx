import { useEffect, useMemo, useState } from "react";
import { caseOptions, CaseStatus } from "./caseOptions";
import { CaseApiError, CaseRecord, getCases } from "./caseService";

const statusLabels: Record<CaseStatus, string> = {
  new: "New",
  in_progress: "In Progress",
  waiting_for_customer: "Waiting for Customer",
  closed: "Closed",
};

const priorityOptions = ["Low", "Normal", "High", "Urgent"] as const;

type StatusFilter = CaseStatus | "all";
type PriorityFilter = (typeof priorityOptions)[number] | "not_set" | "all";

function formatCreatedAt(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Unknown date"
    : new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
}

export default function CaseOverview({
  onCreateCase,
}: {
  onCreateCase: () => void;
}) {
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");

  useEffect(() => {
    let isCurrent = true;
    setIsLoading(true);
    setLoadError("");

    getCases()
      .then((result) => {
        if (isCurrent) setCases(result);
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          setLoadError(
            error instanceof CaseApiError
              ? error.message
              : "Could not load cases. Please try again.",
          );
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [reloadKey]);

  const metrics = useMemo(
    () => ({
      total: cases.length,
      open: cases.filter((item) => item.status !== "closed").length,
      inProgress: cases.filter((item) => item.status === "in_progress").length,
      highPriority: cases.filter(
        (item) => item.priority?.toLowerCase() === "high",
      ).length,
    }),
    [cases],
  );

  const visibleCases = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return cases.filter((item) => {
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.customer_email.toLowerCase().includes(query);
      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;
      const matchesPriority =
        priorityFilter === "all" ||
        (priorityFilter === "not_set"
          ? item.priority === null
          : item.priority?.toLowerCase() === priorityFilter.toLowerCase());
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [cases, priorityFilter, searchText, statusFilter]);

  const hasActiveFilters =
    searchText.trim() !== "" ||
    statusFilter !== "all" ||
    priorityFilter !== "all";

  function clearFilters() {
    setSearchText("");
    setStatusFilter("all");
    setPriorityFilter("all");
  }

  return (
    <main className="page-content overview-page">
      <div className="overview-heading">
        <div>
          <p className="eyebrow">Cases</p>
          <h1>Cases overview</h1>
          <p className="intro">
            Review and manage customer support cases from one place.
          </p>
        </div>
        <button className="primary-button" type="button" onClick={onCreateCase}>
          Create New Case
        </button>
      </div>

      <section className="summary-grid" aria-label="Case summary">
        <SummaryCard label="Total cases" value={metrics.total} />
        <SummaryCard label="Open cases" value={metrics.open} />
        <SummaryCard label="In progress cases" value={metrics.inProgress} />
        <SummaryCard label="High priority cases" value={metrics.highPriority} />
      </section>

      <section className="case-list-card" aria-labelledby="case-list-title">
        <div className="list-heading">
          <div>
            <h2 id="case-list-title">All cases</h2>
            <p>
              {hasActiveFilters
                ? `Showing ${visibleCases.length} of ${cases.length} cases`
                : `${cases.length} ${cases.length === 1 ? "case" : "cases"}`}
            </p>
          </div>
        </div>

        <div className="case-filters" aria-label="Search and filter cases">
          <div className="search-field">
            <label htmlFor="case-search">Search cases</label>
            <input
              id="case-search"
              type="search"
              value={searchText}
              placeholder="Search title or customer email"
              onChange={(event) => setSearchText(event.target.value)}
            />
          </div>
          <div className="filter-field">
            <label htmlFor="status-filter">Status</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as StatusFilter)
              }
            >
              <option value="all">All statuses</option>
              {caseOptions.statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-field">
            <label htmlFor="priority-filter">Priority</label>
            <select
              id="priority-filter"
              value={priorityFilter}
              onChange={(event) =>
                setPriorityFilter(event.target.value as PriorityFilter)
              }
            >
              <option value="all">All priorities</option>
              {priorityOptions.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
              <option value="not_set">Not set</option>
            </select>
          </div>
          <button
            className="clear-filters-button"
            type="button"
            onClick={clearFilters}
            disabled={!hasActiveFilters}
          >
            Clear
          </button>
        </div>

        {isLoading ? (
          <div className="overview-message" role="status">
            Loading cases…
          </div>
        ) : loadError ? (
          <div className="overview-message error-state" role="alert">
            <p>{loadError}</p>
            <button
              className="secondary-button"
              type="button"
              onClick={() => setReloadKey((key) => key + 1)}
            >
              Try again
            </button>
          </div>
        ) : cases.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon" aria-hidden="true">
              +
            </div>
            <h3>No cases yet</h3>
            <p>Create your first case to see it here.</p>
            <button
              className="secondary-button"
              type="button"
              onClick={onCreateCase}
            >
              Create New Case
            </button>
          </div>
        ) : visibleCases.length === 0 ? (
          <div className="empty-state">
            <h3>No matching cases</h3>
            <p>Try changing your search or filters.</p>
            <button
              className="secondary-button"
              type="button"
              onClick={clearFilters}
            >
              Clear search and filters
            </button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="cases-table">
              <thead>
                <tr>
                  <th scope="col">Case ID</th>
                  <th scope="col">Issue title</th>
                  <th scope="col">Customer email</th>
                  <th scope="col">Priority</th>
                  <th scope="col">Status</th>
                  <th scope="col">Created at</th>
                </tr>
              </thead>
              <tbody>
                {visibleCases.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span className="case-id">#{item.id.slice(0, 8)}</span>
                    </td>
                    <td>
                      <a className="case-detail-link" href={`#/cases/${encodeURIComponent(item.id)}`}>{item.title}</a>
                    </td>
                    <td>{item.customer_email}</td>
                    <td>
                      <span
                        className={`priority-pill priority-${item.priority?.toLowerCase() || "none"}`}
                      >
                        {item.priority || "Not set"}
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill status-${item.status}`}>
                        {statusLabels[item.status]}
                      </span>
                    </td>
                    <td>
                      <time dateTime={item.created_at}>
                        {formatCreatedAt(item.created_at)}
                      </time>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="summary-card">
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}
