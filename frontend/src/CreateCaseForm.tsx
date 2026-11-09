import { FormEvent, useEffect, useState } from "react";
import { caseOptions, CaseStatus } from "./caseOptions";
import {
  CaseApiError,
  CaseRecord,
  createCase,
  CreatedCase,
  getCaseById,
  updateCase,
} from "./caseService";

type CaseFormValues = {
  customerEmail: string;
  issueTitle: string;
  description: string;
  category: string;
  priority: string;
  status: CaseStatus | "";
};

const initialValues: CaseFormValues = {
  customerEmail: "",
  issueTitle: "",
  description: "",
  category: "",
  priority: "",
  status: "",
};

const fieldLabels: Record<keyof CaseFormValues, string> = {
  customerEmail: "Customer email",
  issueTitle: "Issue title",
  description: "Description",
  category: "Category",
  priority: "Priority",
  status: "Status",
};

function recordToValues(record: CaseRecord): CaseFormValues {
  return {
    customerEmail: record.customer_email,
    issueTitle: record.title,
    description: record.description,
    category: record.category ?? "",
    priority: record.priority ?? "",
    status: record.status,
  };
}

export default function CreateCaseForm({
  mode = "create",
  caseId,
  onBack,
}: {
  mode?: "create" | "edit";
  caseId?: string;
  onBack: () => void;
}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CaseFormValues, string>>
  >({});
  const [submittedCase, setSubmittedCase] = useState<CreatedCase | null>(null);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(mode === "edit");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (mode !== "edit" || !caseId) return;
    let isCurrent = true;
    setIsLoading(true);
    setLoadError("");

    getCaseById(caseId)
      .then((result) => {
        if (!isCurrent) return;
        setValues(recordToValues(result));
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          setLoadError(
            error instanceof CaseApiError
              ? error.message
              : "Could not load this case. Please try again.",
          );
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [caseId, mode]);

  function updateField(field: keyof CaseFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSubmittedCase(null);
    setSubmitError("");
  }

  function validate() {
    const nextErrors: Partial<Record<keyof CaseFormValues, string>> = {};
    (Object.keys(values) as Array<keyof CaseFormValues>).forEach((field) => {
      if (!values[field].trim())
        nextErrors[field] = `${fieldLabels[field]} is required.`;
    });

    if (
      values.customerEmail.trim() &&
      !/^\S+@\S+\.\S+$/.test(values.customerEmail.trim())
    ) {
      nextErrors.customerEmail =
        "Enter a valid email address, for example name@company.com.";
    }
    return nextErrors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    setSubmittedCase(null);
    setSubmitError("");
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const payload = {
        title: values.issueTitle.trim(),
        description: values.description.trim(),
        category: values.category,
        priority: values.priority,
        status: values.status as CaseStatus,
        customer_email: values.customerEmail.trim(),
      };

      if (mode === "edit" && caseId) {
        const updated = await updateCase(caseId, payload);
        setSubmittedCase(updated);
        onBack();
      } else {
        const created = await createCase(payload);
        setSubmittedCase(created);
        setValues(initialValues);
        onBack();
      }
    } catch (error) {
      setSubmitError(
        error instanceof CaseApiError
          ? error.message
          : "The case could not be saved. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <main className="page-content">
        <p role="status">Loading case.</p>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="page-content">
        <p role="alert">{loadError}</p>
        <button type="button" onClick={onBack}>
          Back
        </button>
      </main>
    );
  }

  return (
    <main className="page-content">
      <div className="page-heading">
        <button type="button" className="back-link" onClick={onBack}>
          Back to cases
        </button>
        <div>
          <p className="eyebrow">
            Cases / {mode === "edit" ? "Edit case" : "New case"}
          </p>
          <h1>{mode === "edit" ? "Edit case" : "New case"}</h1>
        </div>
      </div>

      <form className="case-form" onSubmit={handleSubmit} noValidate>
        <section className="form-section" aria-labelledby="customer-section-title">
          <div className="section-heading">
            <div className="section-number">01</div>
            <div>
              <h2 id="customer-section-title">Customer details</h2>
            </div>
          </div>
          <div className="field-grid">
            <Field
              label="Customer email"
              name="customerEmail"
              type="email"
              value={values.customerEmail}
              error={errors.customerEmail}
              onChange={(value) => updateField("customerEmail", value)}
            />
          </div>
        </section>

        <section className="form-section" aria-labelledby="issue-section-title">
          <div className="section-heading">
            <div className="section-number">02</div>
            <div>
              <h2 id="issue-section-title">Issue details</h2>
            </div>
          </div>
          <div className="field-grid">
            <Field
              label="Issue title"
              name="issueTitle"
              value={values.issueTitle}
              error={errors.issueTitle}
              onChange={(value) => updateField("issueTitle", value)}
            />
            <div className="field">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                rows={5}
                value={values.description}
                aria-invalid={Boolean(errors.description)}
                aria-describedby={errors.description ? "description-error" : undefined}
                onChange={(event) => updateField("description", event.target.value)}
              />
              {errors.description && (
                <p className="error-message" id="description-error" role="alert">
                  {errors.description}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="form-section" aria-labelledby="classification-section-title">
          <div className="section-heading">
            <div className="section-number">03</div>
            <div>
              <h2 id="classification-section-title">Classification</h2>
            </div>
          </div>
          <div className="field-grid three-columns">
            <SelectField
              label="Category"
              name="category"
              options={caseOptions.categories}
              value={values.category}
              error={errors.category}
              onChange={(value) => updateField("category", value)}
            />
            <SelectField
              label="Priority"
              name="priority"
              options={caseOptions.priorities}
              value={values.priority}
              error={errors.priority}
              onChange={(value) => updateField("priority", value)}
            />
            <SelectField
              label="Status"
              name="status"
              options={caseOptions.statuses}
              value={values.status}
              error={errors.status}
              onChange={(value) => updateField("status", value)}
            />
          </div>
        </section>

        <div className="form-actions">
          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving." : mode === "edit" ? "Save changes" : "Create case"}
          </button>
        </div>
      </form>

      {submitError && <div className="submit-error" role="alert">{submitError}</div>}
      {submittedCase && (
        <div className="success-message" role="status" tabIndex={-1}>
          <h2>{mode === "edit" ? "Case updated" : "Case created and saved"}</h2>
        </div>
      )}
    </main>
  );
}

function Field({ label, name, type = "text", value, error, onChange }: {
  label: string;
  name: keyof CaseFormValues;
  type?: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  const errorId = `${name}-error`;
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {error && (
        <p className="error-message" id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function SelectField({ label, name, options, value, error, onChange }: {
  label: string;
  name: keyof CaseFormValues;
  options: ReadonlyArray<string> | ReadonlyArray<{ value: CaseStatus; label: string }>;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  const errorId = `${name}-error`;
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <select
        id={name}
        name={name}
        value={value}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((option) =>
          typeof option === "string" ? (
            <option key={option} value={option}>{option}</option>
          ) : (
            <option key={option.value} value={option.value}>{option.label}</option>
          ),
        )}
      </select>
      {error && (
        <p className="error-message" id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}