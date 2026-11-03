import { FormEvent, useEffect, useState } from "react";
import { caseOptions, CaseStatus } from "./caseOptions";
import { CaseApiError, CaseRecord, getCaseById, updateCase } from "./caseService";

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
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<CaseStatus | "">("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isCurrent = true;
    setIsLoading(true);
    setLoadError("");

    getCaseById(caseId)
      .then((result) => {
        if (!isCurrent) return;
        setCaseRecord(result);
        setDescription(result.description);
        setStatus(result.status);
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

  const trimmedDescription = description.trim();
  const hasChanges = caseRecord !== null && (
    status !== caseRecord.status || trimmedDescription !== caseRecord.description
  );

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!caseRecord || !hasChanges) return;
    if (trimmedDescription.length === 0) {
      setSaveError("Description is required.");
      setSaveSuccess("");
      return;
    }

    const updates: { description?: string; status?: CaseStatus } = {};
    if (trimmedDescription !== caseRecord.description) updates.description = trimmedDescription;
    if (status && status !== caseRecord.status) updates.status = status;

    if (Object.keys(updates).length === 0) return;

    setIsSaving(true);
    setSaveError("");
    setSaveSuccess("");
    try {
      const updated = await updateCase(caseRecord.id, updates);
      setCaseRecord(updated);
      setDescription(updated.description);
      setStatus(updated.status);
      setSaveSuccess("Changes saved.");
    } catch (error) {
      setSaveError(error instanceof CaseApiError ? error.message : "Changes could not be saved. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancel() {
    if (!caseRecord) return;
    setDescription(caseRecord.description);
    setStatus(caseRecord.status);
    setSaveError("");
    setSaveSuccess("");
  }

  return (
    <main className="page-content detail-page">
      <button type="button" className="back-link" onClick={onBack}>← Back to cases</button>

      {isLoading ? (
        <div className="overview-message" role="status">Loading case…</div>
      ) : loadError ? (
        <div className="overview-message error-state" role="alert">
          <p>{loadError}</p>
          <button className="secondary-button" type="button" onClick={() => setReloadKey((key) => key + 1)}>Try again</button>
        </div>
      ) : caseRecord ? (
        <>
          <div className="detail-heading">
            <p className="eyebrow">Cases / Case detail</p>
            <h1>{caseRecord.title}</h1>
            <p className="case-id">Case #{caseRecord.id}</p>
          </div>

          <section className="case-detail-card" aria-labelledby="case-information-title">
            <div className="detail-card-heading">
              <h2 id="case-information-title">Case information</h2>
              <span className={`status-pill status-${caseRecord.status}`}>{statusLabels[caseRecord.status]}</span>
            </div>
            <dl className="detail-metadata">
              <Metadata label="Customer email" value={caseRecord.customer_email} />
              <Metadata label="Category" value={caseRecord.category || "Not set"} />
              <Metadata label="Priority" value={caseRecord.priority || "Not set"} />
              <Metadata label="Created at" value={formatDate(caseRecord.created_at)} />
              <Metadata label="Last updated" value={formatDate(caseRecord.updated_at)} />
            </dl>
          </section>

          <form className="case-detail-card detail-edit-form" onSubmit={handleSave}>
            <div className="detail-card-heading">
              <h2>Update case</h2>
            </div>
            <div className="detail-edit-fields">
              <div className="field">
                <label htmlFor="case-status">Status</label>
                <select id="case-status" value={status} onChange={(event) => { setStatus(event.target.value as CaseStatus); setSaveError(""); setSaveSuccess(""); }}>
                  {caseOptions.statuses.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="case-description">Description</label>
                <textarea id="case-description" rows={7} value={description} aria-invalid={Boolean(saveError && trimmedDescription.length === 0)} onChange={(event) => { setDescription(event.target.value); setSaveError(""); setSaveSuccess(""); }} />
                {saveError && trimmedDescription.length === 0 && <p className="error-message" role="alert">{saveError}</p>}
              </div>
            </div>
            <div className="detail-form-footer">
              <div aria-live="polite">
                {saveSuccess && <p className="save-success-message" role="status">{saveSuccess}</p>}
                {saveError && trimmedDescription.length > 0 && <p className="error-message" role="alert">{saveError}</p>}
              </div>
              <div className="detail-form-actions">
                <button className="secondary-button" type="button" onClick={handleCancel} disabled={!hasChanges || isSaving}>Cancel</button>
                <button className="primary-button" type="submit" disabled={!hasChanges || isSaving}>{isSaving ? "Saving…" : "Save changes"}</button>
              </div>
            </div>
          </form>
        </>
      ) : null}
    </main>
  );
}

function Metadata({ label, value }: { label: string; value: string }) {
  return <div className="detail-metadata-item"><dt>{label}</dt><dd>{value}</dd></div>;
}
