import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ChevronUp } from 'lucide-react';
import { isCreatedCase, type CreatedCase } from './caseTypes';
import {
  focusFirstInvalidField,
  readCaseFormValue,
  validateCaseFields,
  type CaseFieldErrors,
  type CaseFieldName
} from './caseFieldValidation';

type DetailState =
  | { status: 'loading' }
  | { status: 'loaded'; caseItem: CreatedCase }
  | { status: 'deleted' }
  | { status: 'error'; message: string };

function formatCreatedAt(value: string): string {
  return new Intl.DateTimeFormat('sv-SE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).format(new Date(value));
}

interface CaseDetailProps {
  caseId: number;
  onCollapse?: () => void;
  onUpdated?: (caseItem: CreatedCase) => void;
  onDeleted?: () => void;
}

export function CaseDetail({ caseId, onCollapse, onUpdated, onDeleted }: CaseDetailProps) {
  const [state, setState] = useState<DetailState>({ status: 'loading' });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<CaseFieldErrors>({});
  const [focusInvalidField, setFocusInvalidField] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const editFormRef = useRef<HTMLFormElement>(null);
  const cancelDeleteButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!focusInvalidField) return;
    focusFirstInvalidField(editFormRef.current);
    setFocusInvalidField(false);
  }, [focusInvalidField]);

  useEffect(() => {
    if (confirmDelete) {
      cancelDeleteButtonRef.current?.focus();
    }
  }, [confirmDelete]);

  function clearFieldError(field: CaseFieldName) {
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  }

  useEffect(() => {
    let active = true;
    setState({ status: 'loading' });

    async function loadCase() {
      try {
        const response = await fetch(`/api/cases/${caseId}`);
        if (response.status === 404) {
          if (active) {
            setState({ status: 'error', message: 'Ärendet hittades inte.' });
          }
          return;
        }

        if (!response.ok) {
          throw new Error(`API responded with ${response.status}`);
        }

        const body: unknown = await response.json();
        if (!isCreatedCase(body)) {
          throw new Error('API returned invalid case details.');
        }

        if (active) {
          setState({ status: 'loaded', caseItem: body });
        }
      } catch {
        if (active) {
          setState({ status: 'error', message: 'Ärendet kunde inte hämtas. Försök igen.' });
        }
      }
    }

    void loadCase();
    return () => {
      active = false;
    };
  }, [caseId]);

  async function handleEditSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state.status !== 'loaded') {
      return;
    }

    setEditError(null);
    const formData = new FormData(event.currentTarget);
    const payload = {
      title: readCaseFormValue(formData, 'title').trim(),
      description: readCaseFormValue(formData, 'description').trim(),
      category: readCaseFormValue(formData, 'category'),
      priority: readCaseFormValue(formData, 'priority'),
      status: readCaseFormValue(formData, 'status'),
      note: readCaseFormValue(formData, 'note').trim()
    };

    const errors = validateCaseFields(payload);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setFocusInvalidField(true);
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/cases/${caseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const body: unknown = await response.json();
      if (!response.ok) {
        const message =
          typeof body === 'object' && body !== null && 'error' in body && typeof body.error === 'string'
            ? body.error
            : 'Ärendet kunde inte sparas. Försök igen.';
        setEditError(message);
        return;
      }

      if (!isCreatedCase(body) || body.id !== caseId) {
        throw new Error('API returned invalid updated case data.');
      }

      setState({ status: 'loaded', caseItem: body });
      setEditing(false);
      setFieldErrors({});
      onUpdated?.(body);
    } catch {
      setEditError('Ärendet kunde inte sparas. Kontrollera anslutningen och försök igen.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch(`/api/cases/${caseId}`, { method: 'DELETE' });
      if (response.status === 404) {
        setDeleteError('Ärendet hittades inte.');
        return;
      }
      if (!response.ok) {
        throw new Error(`API responded with ${response.status}`);
      }

      if (onDeleted) {
        onDeleted();
      } else {
        setConfirmDelete(false);
        setState({ status: 'deleted' });
      }
    } catch {
      setDeleteError('Ärendet kunde inte tas bort. Försök igen.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section
      className="case-detail"
      id={`case-detail-${caseId}`}
      aria-label={state.status === 'loaded' ? state.caseItem.title : 'Ärendedetalj'}
    >
      {state.status === 'loading' && <p role="status">Laddar ärende…</p>}
      {state.status === 'error' && (
        <p className="form-message form-message--error" role="alert">{state.message}</p>
      )}
      {state.status === 'deleted' && <p role="status">Ärendet har tagits bort.</p>}
      {state.status === 'loaded' && (
        <>
          <div className="case-detail__heading">
            {onCollapse && (
              <button
                className="case-expand-button"
                type="button"
                aria-label="Fäll ihop ärendet"
                aria-expanded={true}
                onClick={onCollapse}
              >
                <ChevronUp aria-hidden="true" size={18} strokeWidth={2} />
              </button>
            )}
            <h2>{state.caseItem.title}</h2>
            <button
              className="case-edit-button"
              type="button"
              disabled={saving || deleting}
              onClick={() => {
                setEditError(null);
                setFieldErrors({});
                setEditing((current) => !current);
              }}
            >
              {editing ? 'Avbryt redigering' : 'Redigera ärende'}
            </button>
          </div>
          <form
            ref={editFormRef}
            className="case-edit-form"
            aria-label={editing ? 'Redigera ärende' : undefined}
            onSubmit={handleEditSubmit}
            noValidate
          >
            <table className="case-fields-table" aria-label="Ärendeuppgifter">
              <tbody>
                <tr>
                  <th scope="row">Rubrik</th>
                  <td>
                    {editing
                      ? (
                        <div className="case-edit-field">
                          <input
                            className="form-control"
                            id={`case-title-${caseId}`}
                            name="title"
                            aria-label="Rubrik"
                            defaultValue={state.caseItem.title}
                            maxLength={120}
                            required
                            aria-invalid={Boolean(fieldErrors.title)}
                            aria-describedby={fieldErrors.title ? `case-title-error-${caseId}` : undefined}
                            onChange={() => clearFieldError('title')}
                          />
                          {fieldErrors.title && <p className="form-field__error" id={`case-title-error-${caseId}`} role="alert">{fieldErrors.title}</p>}
                        </div>
                      )
                      : state.caseItem.title}
                  </td>
                </tr>
                <tr>
                  <th scope="row">Beskrivning</th>
                  <td className="case-detail__description">
                    {editing
                      ? (
                        <div className="case-edit-field">
                        <textarea
                          className="form-control"
                          id={`case-description-${caseId}`}
                          name="description"
                          aria-label="Beskrivning"
                          defaultValue={state.caseItem.description}
                          maxLength={2000}
                          rows={4}
                          required
                          aria-invalid={Boolean(fieldErrors.description)}
                          aria-describedby={fieldErrors.description ? `case-description-error-${caseId}` : undefined}
                          onChange={() => clearFieldError('description')}
                        />
                        {fieldErrors.description && <p className="form-field__error" id={`case-description-error-${caseId}`} role="alert">{fieldErrors.description}</p>}
                        </div>
                      )
                      : state.caseItem.description}
                  </td>
                </tr>
                <tr>
                  <th scope="row">Kategori</th>
                  <td>
                    {editing
                      ? (
                        <div className="case-edit-field">
                        <select
                          className="form-control"
                          id={`case-category-${caseId}`}
                          name="category"
                          aria-label="Kategori"
                          defaultValue={state.caseItem.category}
                          required
                          aria-invalid={Boolean(fieldErrors.category)}
                          aria-describedby={fieldErrors.category ? `case-category-error-${caseId}` : undefined}
                          onChange={() => clearFieldError('category')}
                        >
                          <option value="Konto">Konto</option>
                          <option value="Fakturering">Fakturering</option>
                          <option value="Tekniskt">Tekniskt</option>
                          <option value="Övrigt">Övrigt</option>
                        </select>
                        {fieldErrors.category && <p className="form-field__error" id={`case-category-error-${caseId}`} role="alert">{fieldErrors.category}</p>}
                        </div>
                      )
                      : state.caseItem.category}
                  </td>
                </tr>
                <tr>
                  <th scope="row">Prioritet</th>
                  <td>
                    {editing
                      ? (
                        <div className="case-edit-field">
                        <select
                          className="form-control"
                          id={`case-priority-${caseId}`}
                          name="priority"
                          aria-label="Prioritet"
                          defaultValue={state.caseItem.priority}
                          required
                          aria-invalid={Boolean(fieldErrors.priority)}
                          aria-describedby={fieldErrors.priority ? `case-priority-error-${caseId}` : undefined}
                          onChange={() => clearFieldError('priority')}
                        >
                          <option value="Låg">Låg</option>
                          <option value="Normal">Normal</option>
                          <option value="Hög">Hög</option>
                        </select>
                        {fieldErrors.priority && <p className="form-field__error" id={`case-priority-error-${caseId}`} role="alert">{fieldErrors.priority}</p>}
                        </div>
                      )
                      : state.caseItem.priority}
                  </td>
                </tr>
                <tr>
                  <th scope="row">Status</th>
                  <td>
                    {editing
                      ? (
                        <div className="case-edit-field">
                        <select
                          className="form-control"
                          id={`case-status-${caseId}`}
                          name="status"
                          aria-label="Status"
                          defaultValue={state.caseItem.status}
                          required
                          aria-invalid={Boolean(fieldErrors.status)}
                          aria-describedby={fieldErrors.status ? `case-status-error-${caseId}` : undefined}
                          onChange={() => clearFieldError('status')}
                        >
                          <option value="Nytt">Nytt</option>
                          <option value="Pågående">Pågående</option>
                          <option value="Väntar på kund">Väntar på kund</option>
                          <option value="Avslutat">Avslutat</option>
                        </select>
                        {fieldErrors.status && <p className="form-field__error" id={`case-status-error-${caseId}`} role="alert">{fieldErrors.status}</p>}
                        </div>
                      )
                      : <span className="case-status">{state.caseItem.status}</span>}
                  </td>
                </tr>
                <tr>
                  <th scope="row">Skapad</th>
                  <td>
                    <time dateTime={state.caseItem.createdAt}>
                      {formatCreatedAt(state.caseItem.createdAt)}
                    </time>
                  </td>
                </tr>
                <tr>
                  <th scope="row">Intern anteckning</th>
                  <td className="case-detail__description">
                    {editing
                      ? (
                        <textarea
                          className="form-control"
                          id={`case-note-${caseId}`}
                          name="note"
                          aria-label="Intern anteckning"
                          defaultValue={state.caseItem.note ?? ''}
                          maxLength={2000}
                          rows={3}
                        />
                      )
                      : state.caseItem.note || '-'}
                  </td>
                </tr>
              </tbody>
            </table>
            {editing && (
              <>
                {editError && <p className="form-message form-message--error" role="alert">{editError}</p>}
                <div className="case-edit-actions" role="group" aria-label="Ärendeåtgärder">
                  <button className="primary-button" type="submit" disabled={saving}>
                    {saving ? 'Sparar…' : 'Spara ändringar'}
                  </button>
                  <button
                    className="case-edit-button button--danger-outline"
                    type="button"
                    disabled={saving || deleting}
                    onClick={() => {
                      setDeleteError(null);
                      setConfirmDelete(true);
                    }}
                  >
                    Ta bort ärende
                  </button>
                </div>
                {confirmDelete && (
                  <div
                    className="case-delete__confirmation"
                    role="alertdialog"
                    aria-labelledby={`delete-confirmation-title-${caseId}`}
                    aria-describedby={`delete-confirmation-description-${caseId}`}
                  >
                    <h3 id={`delete-confirmation-title-${caseId}`}>Ta bort ärende?</h3>
                    <p id={`delete-confirmation-description-${caseId}`}>
                      Är du säker på att du vill ta bort ”{state.caseItem.title}”? Det går inte att ångra.
                    </p>
                    {deleteError && <p className="form-message form-message--error" role="alert">{deleteError}</p>}
                    <div className="case-delete__actions">
                      <button
                        className="case-edit-button"
                        type="button"
                        disabled={deleting}
                        ref={cancelDeleteButtonRef}
                        onClick={() => {
                          setConfirmDelete(false);
                          setDeleteError(null);
                        }}
                      >
                        Avbryt
                      </button>
                      <button
                        className="case-edit-button button--danger"
                        type="button"
                        disabled={deleting}
                        onClick={() => void handleDelete()}
                      >
                        {deleting ? 'Tar bort…' : 'Ta bort på riktigt'}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </form>
        </>
      )}
    </section>
  );
}
