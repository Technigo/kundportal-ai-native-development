import { useState, type FormEvent } from 'react';
import { isCreatedCase, type CreatedCase } from './caseTypes';

const statuses = ['Nytt', 'Pågående', 'Väntar på kund', 'Avslutat'];

interface CaseStatusFormProps {
  caseItem: CreatedCase;
  onUpdated: (caseItem: CreatedCase) => void;
}

export function CaseStatusForm({ caseItem, onUpdated }: CaseStatusFormProps) {
  const [status, setStatus] = useState(caseItem.status);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const response = await fetch(`/api/cases/${caseItem.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.status === 404 || response.status === 400) {
        setError(response.status === 404 ? 'Ärendet hittades inte.' : 'Välj en giltig status.');
        return;
      }

      if (!response.ok) {
        throw new Error(`API responded with ${response.status}`);
      }

      const body: unknown = await response.json();
      if (!isCreatedCase(body) || body.id !== caseItem.id || !statuses.includes(body.status)) {
        throw new Error('API returned invalid updated case data.');
      }

      setStatus(body.status);
      onUpdated(body);
      setSaved(true);
    } catch {
      setError('Status kunde inte sparas. Försök igen.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="case-status-form" onSubmit={handleSubmit}>
      <label className="form-field">
        <span>Ändra status</span>
        <select
          value={status}
          disabled={saving}
          onChange={(event) => {
            setStatus(event.target.value);
            setSaved(false);
            setError(null);
          }}
        >
          {statuses.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
      </label>
      <button className="primary-button" type="submit" disabled={saving}>
        {saving ? 'Sparar…' : 'Spara status'}
      </button>
      {error && <p className="form-message form-message--error" role="alert">{error}</p>}
      {saved && <p className="form-message form-message--success" role="status">Status sparad.</p>}
    </form>
  );
}
