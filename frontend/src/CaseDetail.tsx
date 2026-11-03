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
  const [isEditing, setIsEditing] = useState(false);
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
        setIsEditing(false);
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

  function handleEdit() {
    if (!caseRecord) return;
    setDescription(caseRecord.description);
    setStatus(caseRecord.status);
    setSaveError("");
    setSaveSuccess("");
    setIsEditing(true);
  }

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
      setIsEditing(false);
      setSaveSuccess("Changes saved.");
    } catch (error) {
      setSaveError(error instanceof CaseApiError ? error.message : "Changes could not be saved. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancel() {
    if (!caseRecord || isSaving) return;
    setDescription(caseRecord.description);
    setStatus(caseRecord.status);
    setSaveError("");
    setIsEditing(false);
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
            <div className="detail-title-row">
              <div>
                <h1>{caseRecord.title}</h1>
                <span className={`status-pill status-${caseRecord.status}`}>{statusLabels[caseRecord.status]}</span>
              </div>
              {!isEditing && <button className="primary-button" type="button" onClick={handleEdit}>Edit case</button>}
            </div>
          </div>

          {saveSuccess && !isEditing && <p className="save-success-banner" role="status">✓ {saveSuccess}</p>}

          {isEditing ? (
            <form className="case-detail-card detail-edit-form" onSubmit={handleSave}>
              <div className="detail-card-heading">
                <div>
                  <h2>Edit case</h2>
                  <p className="detail-card-subtitle">Update the status or description. Other case information is read-only.</p>
                </div>
              </div>
              <div className="detail-edit-fields">
                <div className="field">
                  <label htmlFor="case-status">Status</label>
                  <select id="case-status" value={status} onChange={(event) => { setStatus(event.target.value as CaseStatus); setSaveError(""); }}>
                    {caseOptions.statuses.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="case-description">Description</label>
                  <textarea id="case-description" rows={7} value={description} aria-invalid={Boolean(saveError && trimmedDescription.length === 0)} onChange={(event) => { setDescription(event.target.value); setSaveError(""); }} />
                  {saveError && trimmedDescription.length === 0 && <p className="error-message" role="alert">{saveError}</p>}
                </div>
              </div>
              <div className="detail-form-footer">
                <div aria-live="polite">
                  {saveError && trimmedDescription.length > 0 && <p className="error-message" role="alert">{saveError}</p>}
                </div>
                <div className="detail-form-actions">
                  <button className="secondary-button" type="button" onClick={handleCancel} disabled={isSaving}>Cancel</button>
                  <button className="primary-button" type="submit" disabled={!hasChanges || isSaving}>{isSaving ? "Saving…" : "Save changes"}</button>
                </div>
              </div>
            </form>
          ) : (
            <>
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
                  <Metadata label="Customer email" value={caseRecord.customer_email} />
                  <Metadata label="Category" value={caseRecord.category || "Not set"} />
                  <div className="detail-metadata-item">
                    <dt>Priority</dt>
                    <dd><span className={`priority-pill priority-${caseRecord.priority?.toLowerCase() || "none"}`}>{caseRecord.priority || "Not set"}</span></dd>
                  </div>
                  <Metadata label="Created at" value={formatDate(caseRecord.created_at)} />
                  <Metadata label="Last updated" value={formatDate(caseRecord.updated_at)} />
                </dl>
              </section>
            </>
          )}
        </>
      ) : null}
    </main>
  );
}

function Metadata({ label, value }: { label: string; value: string }) {
  return <div className="detail-metadata-item"><dt>{label}</dt><dd>{value}</dd></div>;
}
