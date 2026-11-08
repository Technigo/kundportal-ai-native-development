import { useState, type FormEvent } from 'react';
import { isCreatedCase, type CreatedCase } from './caseTypes';
import {
  readCaseFormValue,
  validateCaseFields,
  type CaseFieldErrors,
  type CaseFieldName
} from './caseFieldValidation';

export type { CreatedCase } from './caseTypes';

interface CreateCasePayload {
  title: string;
  description: string;
  category: string;
  priority: string;
}

interface CaseFormProps {
  onCreated: (createdCase: CreatedCase) => void;
}

class FormSubmissionError extends Error {}

function apiErrorMessage(value: unknown): string | null {
  if (typeof value === 'object' && value !== null && 'error' in value) {
    const error = value.error;
    return typeof error === 'string' ? error : null;
  }

  return null;
}

export function CaseForm({ onCreated }: CaseFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedCase | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<CaseFieldErrors>({});

  function clearFieldError(field: CaseFieldName) {
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setError(null);
    setCreated(null);

    const formData = new FormData(event.currentTarget);
    const payload: CreateCasePayload = {
      title: readCaseFormValue(formData, 'title').trim(),
      description: readCaseFormValue(formData, 'description').trim(),
      category: readCaseFormValue(formData, 'category'),
      priority: readCaseFormValue(formData, 'priority')
    };

    const errors = validateCaseFields(payload);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const responseBody: unknown = await response.json();

      if (!response.ok) {
        throw new FormSubmissionError(apiErrorMessage(responseBody) ?? 'Ärendet kunde inte sparas.');
      }

      if (!isCreatedCase(responseBody)) {
        throw new FormSubmissionError('Servern skickade ett ogiltigt svar.');
      }

      setCreated(responseBody);
      setFieldErrors({});
      onCreated(responseBody);
      form.reset();
    } catch (submitError) {
      setError(
        submitError instanceof FormSubmissionError
          ? submitError.message
          : 'Det gick inte att spara ärendet. Kontrollera anslutningen och försök igen.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="case-form case-form-card" aria-label="Skapa ärende" onSubmit={handleSubmit} noValidate>
      <table className="case-fields-table" aria-label="Uppgifter för nytt ärende">
        <tbody>
          <tr>
            <th scope="row"><label htmlFor="create-title">Rubrik</label></th>
            <td>
              <div className="case-edit-field">
                <input
                  className="form-control"
                  id="create-title"
                  name="title"
                  type="text"
                  maxLength={120}
                  required
                  aria-invalid={Boolean(fieldErrors.title)}
                  aria-describedby={fieldErrors.title ? 'create-title-error' : undefined}
                  onChange={() => clearFieldError('title')}
                />
                {fieldErrors.title && <p className="form-field__error" id="create-title-error" role="alert">{fieldErrors.title}</p>}
              </div>
            </td>
          </tr>
          <tr>
            <th scope="row"><label htmlFor="create-description">Beskrivning</label></th>
            <td>
              <div className="case-edit-field">
                <textarea
                  className="form-control"
                  id="create-description"
                  name="description"
                  maxLength={2000}
                  rows={4}
                  required
                  aria-invalid={Boolean(fieldErrors.description)}
                  aria-describedby={fieldErrors.description ? 'create-description-error' : undefined}
                  onChange={() => clearFieldError('description')}
                />
                {fieldErrors.description && <p className="form-field__error" id="create-description-error" role="alert">{fieldErrors.description}</p>}
              </div>
            </td>
          </tr>
          <tr>
            <th scope="row"><label htmlFor="create-category">Kategori</label></th>
            <td>
              <div className="case-edit-field">
                <select
                  className="form-control"
                  id="create-category"
                  name="category"
                  defaultValue=""
                  required
                  aria-invalid={Boolean(fieldErrors.category)}
                  aria-describedby={fieldErrors.category ? 'create-category-error' : undefined}
                  onChange={() => clearFieldError('category')}
                >
                  <option value="" disabled>Välj kategori</option>
                  <option value="Konto">Konto</option>
                  <option value="Fakturering">Fakturering</option>
                  <option value="Tekniskt">Tekniskt</option>
                  <option value="Övrigt">Övrigt</option>
                </select>
                {fieldErrors.category && <p className="form-field__error" id="create-category-error" role="alert">{fieldErrors.category}</p>}
              </div>
            </td>
          </tr>
          <tr>
            <th scope="row"><label htmlFor="create-priority">Prioritet</label></th>
            <td>
              <div className="case-edit-field">
                <select
                  className="form-control"
                  id="create-priority"
                  name="priority"
                  defaultValue=""
                  required
                  aria-invalid={Boolean(fieldErrors.priority)}
                  aria-describedby={fieldErrors.priority ? 'create-priority-error' : undefined}
                  onChange={() => clearFieldError('priority')}
                >
                  <option value="" disabled>Välj prioritet</option>
                  <option value="Låg">Låg</option>
                  <option value="Normal">Normal</option>
                  <option value="Hög">Hög</option>
                </select>
                {fieldErrors.priority && <p className="form-field__error" id="create-priority-error" role="alert">{fieldErrors.priority}</p>}
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {error && <p className="form-message form-message--error" role="alert">{error}</p>}
      {created && <p className="form-message form-message--success" role="status">Ärende skapat: {created.title}</p>}

      <button className="primary-button" type="submit" disabled={submitting}>
        {submitting ? 'Sparar…' : 'Skapa ärende'}
      </button>
    </form>
  );
}
