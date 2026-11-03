import { FormEvent, useState } from "react";
import { caseOptions, CaseStatus } from "./caseOptions";
import { CaseApiError, createCase, CreatedCase } from "./caseService";

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

export default function CreateCaseForm({ onBack }: { onBack: () => void }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CaseFormValues, string>>
  >({});
  const [submittedCase, setSubmittedCase] = useState<CreatedCase | null>(null);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (Object.keys(nextErrors).length > 0 || !values.status) return;

    setIsSubmitting(true);
    try {
      const created = await createCase({
        title: values.issueTitle.trim(),
        description: values.description.trim(),
        category: values.category,
        priority: values.priority,
        status: values.status,
        customer_email: values.customerEmail.trim(),
      });
      setSubmittedCase(created);
      setValues(initialValues);
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

  return (
    <main className="page-content">
      <div className="page-heading">
        <button type="button" className="back-link" onClick={onBack}>
          ← Back to cases
        </button>
        <div>
          <p className="eyebrow">Cases / New case</p>
          <h1>New case</h1>
          <p className="intro">
            Capture the customer’s request so your team can follow up quickly.
          </p>
        </div>
      </div>

      <form className="case-form" onSubmit={handleSubmit} noValidate>
        <section
          className="form-section"
          aria-labelledby="customer-section-title"
        >
          <div className="section-heading">
            <div className="section-number">01</div>
            <div>
              <h2 id="customer-section-title">Customer details</h2>
              <p>What email address can your team use to follow up?</p>
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
              <p>Describe what the customer needs help with.</p>
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
                aria-describedby={
                  errors.description ? "description-error" : undefined
                }
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
              />
              {errors.description && (
                <p
                  className="error-message"
                  id="description-error"
                  role="alert"
                >
                  {errors.description}
                </p>
              )}
            </div>
          </div>
        </section>

        <section
          className="form-section"
          aria-labelledby="classification-section-title"
        >
          <div className="section-heading">
            <div className="section-number">03</div>
            <div>
              <h2 id="classification-section-title">Classification</h2>
              <p>Set the initial routing and follow-up information.</p>
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
          <button
            className="primary-button"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving case…" : "Create case"}
          </button>
        </div>
      </form>

      {submitError && (
        <div className="submit-error" role="alert">
          {submitError}
        </div>
      )}
      {submittedCase && (
        <div className="success-message" role="status" tabIndex={-1}>
          <div className="success-icon" aria-hidden="true">
            ✓
          </div>
          <div>
            <h2>Case created and saved</h2>
            <p>Your case was saved to the shared case database.</p>
            <p className="timestamp">
              Case #{submittedCase.id.slice(0, 8)} · Created{" "}
              {new Date(submittedCase.created_at).toLocaleString()}
            </p>
            <button className="secondary-button" type="button" onClick={onBack}>
              View Cases Overview
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function Field({
  label,
  name,
  type = "text",
  value,
  error,
  onChange,
}: {
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

function SelectField({
  label,
  name,
  options,
  value,
  error,
  onChange,
}: {
  label: string;
  name: keyof CaseFormValues;
  options:
    | ReadonlyArray<string>
    | ReadonlyArray<{ value: CaseStatus; label: string }>;
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
            <option key={option} value={option}>
              {option}
            </option>
          ) : (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
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
