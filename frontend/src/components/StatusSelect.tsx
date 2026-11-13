import { useState } from "react";
import { ApiError, UNKNOWN_ERROR_MESSAGE } from "../api/apiError";
import { updateStatus } from "../api/arendenApi";
import { STATUSAR } from "../constants/arende";
import type { Arende, ArendeStatus } from "../types/arende";

interface Props {
  arende: Arende;
  onChanged: (arende: Arende) => void;
}

export function StatusSelect({ arende, onChanged }: Props) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(status: ArendeStatus) {
    setSaving(true);
    setError(null);
    try {
      onChanged(await updateStatus(arende.id, status));
    } catch (err) {
      const apiError = err instanceof ApiError ? err : null;
      setError(apiError?.fieldErrors.status ?? apiError?.message ?? UNKNOWN_ERROR_MESSAGE);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="field">
      <label htmlFor="status-select">Ändra status</label>
      <select
        id="status-select"
        value={arende.status}
        disabled={saving}
        onChange={(e) => handleChange(e.target.value as ArendeStatus)}
      >
        {STATUSAR.map((s) => (
          <option key={s}>{s}</option>
        ))}
      </select>
      {error && (
        <p role="alert" className="field__error">
          {error}
        </p>
      )}
    </div>
  );
}
