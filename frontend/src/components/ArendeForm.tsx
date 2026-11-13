import { useState, type FormEvent } from "react";
import { ApiError, UNKNOWN_ERROR_MESSAGE } from "../api/apiError";
import { createArende } from "../api/arendenApi";
import { KATEGORIER, PRIORITETER } from "../constants/arende";
import type { Arende, ArendeCreate, FieldErrors } from "../types/arende";

const EMPTY: ArendeCreate = { rubrik: "", beskrivning: "", kategori: "", prioritet: "" };

const REQUIRED_MESSAGES: Record<keyof ArendeCreate, string> = {
  rubrik: "Rubrik måste fyllas i.",
  beskrivning: "Beskrivning måste fyllas i.",
  kategori: "Välj en kategori.",
  prioritet: "Välj en prioritet.",
};

function validate(values: ArendeCreate): FieldErrors {
  const errors: FieldErrors = {};
  for (const field of Object.keys(REQUIRED_MESSAGES) as (keyof ArendeCreate)[]) {
    if (!values[field].trim()) {
      errors[field] = REQUIRED_MESSAGES[field];
    }
  }
  return errors;
}

interface Props {
  onSaved: (arende: Arende) => void;
  onCancel: () => void;
}

export function ArendeForm({ onSaved, onCancel }: Props) {
  const [values, setValues] = useState<ArendeCreate>(EMPTY);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update(field: keyof ArendeCreate, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  async function save() {
    setFormError(null);
    const errors = validate(values);
    setFieldErrors(errors);
    const firstInvalid = (Object.keys(REQUIRED_MESSAGES) as (keyof ArendeCreate)[]).find(
      (field) => errors[field],
    );
    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus();
      return;
    }

    const data = {
      ...values,
      rubrik: values.rubrik.trim(),
      beskrivning: values.beskrivning.trim(),
    };
    setSubmitting(true);
    try {
      onSaved(await createArende(data));
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null;
      setFieldErrors(apiError?.fieldErrors ?? {});
      setFormError(apiError?.message ?? UNKNOWN_ERROR_MESSAGE);
    } finally {
      setSubmitting(false);
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void save();
  }

  const errorId = (field: keyof ArendeCreate) =>
    fieldErrors[field] ? `${field}-error` : undefined;
  const fieldError = (field: keyof ArendeCreate) =>
    fieldErrors[field] && (
      <p id={`${field}-error`} className="field__error">
        {fieldErrors[field]}
      </p>
    );

  return (
    <form className="form" onSubmit={handleSubmit} noValidate aria-labelledby="form-title">
      <h2 id="form-title">Nytt ärende</h2>

      <div className="field">
        <label htmlFor="rubrik">Rubrik</label>
        <input
          id="rubrik"
          value={values.rubrik}
          onChange={(e) => update("rubrik", e.target.value)}
          aria-invalid={Boolean(fieldErrors.rubrik)}
          aria-describedby={errorId("rubrik")}
        />
        {fieldError("rubrik")}
      </div>

      <div className="field">
        <label htmlFor="beskrivning">Beskrivning</label>
        <textarea
          id="beskrivning"
          rows={5}
          value={values.beskrivning}
          onChange={(e) => update("beskrivning", e.target.value)}
          aria-invalid={Boolean(fieldErrors.beskrivning)}
          aria-describedby={errorId("beskrivning")}
        />
        {fieldError("beskrivning")}
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="kategori">Kategori</label>
          <select
            id="kategori"
            value={values.kategori}
            onChange={(e) => update("kategori", e.target.value)}
            aria-invalid={Boolean(fieldErrors.kategori)}
            aria-describedby={errorId("kategori")}
          >
            <option value="">Välj…</option>
            {KATEGORIER.map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
          {fieldError("kategori")}
        </div>

        <div className="field">
          <label htmlFor="prioritet">Prioritet</label>
          <select
            id="prioritet"
            value={values.prioritet}
            onChange={(e) => update("prioritet", e.target.value)}
            aria-invalid={Boolean(fieldErrors.prioritet)}
            aria-describedby={errorId("prioritet")}
          >
            <option value="">Välj…</option>
            {PRIORITETER.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
          {fieldError("prioritet")}
        </div>
      </div>

      {formError && (
        <p role="alert" className="alert">
          {formError}
        </p>
      )}

      <div className="actions">
        <button type="submit" className="button" disabled={submitting}>
          {submitting ? "Sparar…" : "Skapa ärende"}
        </button>
        <button type="button" className="button button--secondary" onClick={onCancel}>
          Avbryt
        </button>
      </div>
    </form>
  );
}
