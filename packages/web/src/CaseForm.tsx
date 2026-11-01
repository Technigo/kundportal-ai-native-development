import { useState, type FormEvent } from 'react';

interface CreateCasePayload {
  title: string;
  description: string;
  category: string;
  priority: string;
}

export interface CreatedCase extends CreateCasePayload {
  id: number;
  status: string;
  createdAt: string;
}

interface CaseFormProps {
  onCreated: (createdCase: CreatedCase) => void;
}

class FormSubmissionError extends Error {}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isCreatedCase(value: unknown): value is CreatedCase {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'number' &&
    typeof value.title === 'string' &&
    typeof value.description === 'string' &&
    typeof value.category === 'string' &&
    typeof value.priority === 'string' &&
    typeof value.status === 'string' &&
    typeof value.createdAt === 'string'
  );
}

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setError(null);
    setCreated(null);
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const payload: CreateCasePayload = {
      title: String(formData.get('title')).trim(),
      description: String(formData.get('description')).trim(),
      category: String(formData.get('category')),
      priority: String(formData.get('priority'))
    };

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
    <form className="case-form" onSubmit={handleSubmit}>
      <label className="form-field">
        <span>Rubrik</span>
        <input name="title" type="text" maxLength={120} required />
      </label>

      <label className="form-field">
        <span>Beskrivning</span>
        <textarea name="description" maxLength={2000} rows={4} required />
      </label>

      <label className="form-field">
        <span>Kategori</span>
        <select name="category" defaultValue="" required>
          <option value="" disabled>Välj kategori</option>
          <option value="Konto">Konto</option>
          <option value="Fakturering">Fakturering</option>
          <option value="Tekniskt">Tekniskt</option>
          <option value="Övrigt">Övrigt</option>
        </select>
      </label>

      <label className="form-field">
        <span>Prioritet</span>
        <select name="priority" defaultValue="" required>
          <option value="" disabled>Välj prioritet</option>
          <option value="Låg">Låg</option>
          <option value="Normal">Normal</option>
          <option value="Hög">Hög</option>
        </select>
      </label>

      {error && <p className="form-message form-message--error" role="alert">{error}</p>}
      {created && <p className="form-message form-message--success" role="status">Ärende skapat: {created.title}</p>}

      <button className="primary-button" type="submit" disabled={submitting}>
        {submitting ? 'Sparar…' : 'Skapa ärende'}
      </button>
    </form>
  );
}
