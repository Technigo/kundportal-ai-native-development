import { useState, type FormEvent } from 'react';
import { isCreatedCase, type CreatedCase } from './caseTypes';

interface CaseNoteFormProps {
  caseItem: CreatedCase;
  onUpdated: (caseItem: CreatedCase) => void;
}

export function CaseNoteForm({ caseItem, onUpdated }: CaseNoteFormProps) {
  const [note, setNote] = useState(caseItem.note ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setConfirmation(null);

    try {
      const response = await fetch(`/api/cases/${caseItem.id}/note`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note })
      });

      if (response.status === 404) {
        setError('Ärendet hittades inte.');
        return;
      }
      if (response.status === 400) {
        const body: unknown = await response.json();
        if (typeof body !== 'object' || body === null || !('error' in body) || typeof body.error !== 'string') {
          throw new Error('API returned an invalid validation error.');
        }
        setError(body.error);
        return;
      }
      if (!response.ok) {
        throw new Error(`API responded with ${response.status}`);
      }

      const body: unknown = await response.json();
      if (!isCreatedCase(body) || body.id !== caseItem.id) {
        throw new Error('API returned invalid updated case data.');
      }

      setNote(body.note ?? '');
      onUpdated(body);
      setConfirmation(body.note === null ? 'Anteckning raderad.' : 'Anteckning sparad.');
    } catch {
      setError('Anteckningen kunde inte sparas. Försök igen.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="case-note-form" onSubmit={handleSubmit}>
      <label className="form-field">
        <span>Intern anteckning</span>
        <textarea
          value={note}
          maxLength={2000}
          rows={4}
          disabled={saving}
          aria-describedby={`note-help-${caseItem.id}`}
          onChange={(event) => {
            setNote(event.target.value);
            setError(null);
            setConfirmation(null);
          }}
        />
      </label>
      <p className="case-item__details" id={`note-help-${caseItem.id}`}>
        Högst 2 000 tecken. Töm texten och spara för att radera anteckningen.
      </p>
      <button className="primary-button" type="submit" disabled={saving}>
        {saving ? 'Sparar anteckning…' : 'Spara anteckning'}
      </button>
      {error && <p className="form-message form-message--error" role="alert">{error}</p>}
      {confirmation && <p className="form-message form-message--success" role="status">{confirmation}</p>}
    </form>
  );
}
