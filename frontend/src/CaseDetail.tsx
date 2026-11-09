import { useEffect, useState } from "react";
import { CaseStatus } from "./caseOptions";
import { CaseApiError, CaseRecord, deleteCase, getCaseById } from "./caseService";

const statusLabels: Record<CaseStatus, string> = {
  new: "New",
  in_progress: "In Progress",
  waiting_for_customer: "Waiting for Customer",
  closed: "Closed",
};

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Unknown date"
    : new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default function CaseDetail({ caseId, onBack }: { caseId: string; onBack: () => void }) {
  const [caseRecord, setCaseRecord] = useState<CaseRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isCurrent = true;
    setIsLoading(true);
    setLoadError("");

    getCaseById(caseId)
      .then((result) => {
        if (!isCurrent) return;
        setCaseRecord(result);
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          setLoadError(error instanceof CaseApiError ? error.message : "Could not load this case. Please try again.");
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => { isCurrent = false; };
  }, [caseId, reloadKey]);

  async function handleDelete() {
    if (!caseRecord || isDeleting) return;
    if (!window.confirm("Are you sure you want to delete this case?")) return;
    setIsDeleting(true);
    setDeleteError("");
    try {
      await deleteCase(caseRecord.id);
      onBack();
    } catch (error) {
      setDeleteError(error instanceof CaseApiError ? error.message : "The case could not be deleted. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <main className="page-content detail-page">
      <button type="button" className="back-link" onClick={onBack}>Back to cases</button>

      {isLoading ? (
        <div className="overview-message" role="status">Loading case.</div>
      ) : loadError ? (
        <div className="overview-message error-state" role="alert">
          <p>{loadError}</p>
          <button className="secondary-button" type="button" onClick={() => setReloadKey((key) => key + 1)}>Try again</button>
        </div>
      ) : caseRecord ? (
        <>
          <div className="detail-heading">
            <p className="eyebrow">Cases / Case detail</p>
            <div className="detail-title-row">
              <div>
                <h1>{caseRecord.title}</h1>
                <span className={`status-pill status-${caseRecord.status}`}>{statusLabels[caseRecord.status]}</span>
              </div>
              <div className="detail-actions">
                <button className="primary-button" type="button" onClick={() => { window.location.hash = `#/cases/${encodeURIComponent(caseRecord.id)}/edit`; }}>
                  Edit case
                </button>
                <button className="danger-button" type="button" onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? "Deleting." : "Delete case"}
                </button>
              </div>
            </div>
          </div>

          {deleteError && <p className="error-message" role="alert">{deleteError}</p>}

          <section className="case-detail-card description-card" aria-labelledby="case-description-title">
            <div className="detail-card-heading">
              <h2 id="case-description-title">Description</h2>
            </div>
            <p className="case-description-text">{caseRecord.description}</p>
          </section>

          <section className="case-detail-card" aria-labelledby="case-information-title">
            <div className="detail-card-heading">
              <h2 id="case-information-title">Case information</h2>
            </div>
            <dl className="detail-metadata">
              <div className="detail-metadata-item"><dt>Customer email</dt><dd>{caseRecord.customer_email}</dd></div>
              <div className="detail-metadata-item"><dt>Category</dt><dd>{caseRecord.category || "Not set"}</dd></div>
              <div className="detail-metadata-item"><dt>Priority</dt><dd><span className={`priority-pill priority-${caseRecord.priority?.toLowerCase() || "none"}`}>{caseRecord.priority || "Not set"}</span></dd></div>
              <div className="detail-metadata-item"><dt>Created at</dt><dd>{formatDate(caseRecord.created_at)}</dd></div>
              <div className="detail-metadata-item"><dt>Last updated</dt><dd>{formatDate(caseRecord.updated_at)}</dd></div>
            </dl>
          </section>
        </>
      ) : null}
    </main>
  );
}
