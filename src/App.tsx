import { FormEvent, useState } from "react";
import { caseOptions } from "./caseOptions";

type CaseFormValues = {
  customerName: string;
  customerEmail: string;
  issueTitle: string;
  description: string;
  category: string;
  priority: string;
  status: string;
};

type CaseRecord = CaseFormValues & { createdAt: string };

const initialValues: CaseFormValues = {
  customerName: "",
  customerEmail: "",
  issueTitle: "",
  description: "",
  category: "",
  priority: "",
  status: "",
};

const fieldLabels: Record<keyof CaseFormValues, string> = {
  customerName: "Customer name",
  customerEmail: "Customer email",
  issueTitle: "Issue title",
  description: "Description",
  category: "Category",
  priority: "Priority",
  status: "Status",
};

function App() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof CaseFormValues, string>>>({});
  const [submittedCase, setSubmittedCase] = useState<CaseRecord | null>(null);

  function updateField(field: keyof CaseFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSubmittedCase(null);
  }

  function validate() {
    const nextErrors: Partial<Record<keyof CaseFormValues, string>> = {};
    (Object.keys(values) as Array<keyof CaseFormValues>).forEach((field) => {
      if (!values[field].trim()) {
        nextErrors[field] = `${fieldLabels[field]} is required.`;
      }
    });

    if (values.customerEmail.trim() && !/^\S+@\S+\.\S+$/.test(values.customerEmail.trim())) {
      nextErrors.customerEmail = "Enter a valid email address, for example name@company.com.";
    }
    return nextErrors;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setSubmittedCase(null);
      return;
    }

    const newCase: CaseRecord = {
      ...values,
      createdAt: new Date().toISOString(),
    };
    setSubmittedCase(newCase);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-mark" aria-hidden="true">CS</div>
        <div>
          <p className="eyebrow">Customer service portal</p>
          <p className="brand-name">Support workspace</p>
        </div>
        <span className="internal-badge">Internal</span>
      </header>

      <main className="page-content">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Cases / New case</p>
            <h1>New case</h1>
            <p className="intro">Capture the customer’s request so your team can follow up quickly.</p>
          </div>
        </div>

        <form className="case-form" onSubmit={handleSubmit} noValidate>
          <section className="form-section" aria-labelledby="customer-section-title">
            <div className="section-heading">
              <div className="section-number">01</div>
              <div>
                <h2 id="customer-section-title">Customer details</h2>
                <p>Who is contacting your team?</p>
              </div>
            </div>
            <div className="field-grid two-columns">
              <Field label="Customer name" name="customerName" value={values.customerName} error={errors.customerName} onChange={(value) => updateField("customerName", value)} />
              <Field label="Customer email" name="customerEmail" type="email" value={values.customerEmail} error={errors.customerEmail} onChange={(value) => updateField("customerEmail", value)} />
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
              <Field label="Issue title" name="issueTitle" value={values.issueTitle} error={errors.issueTitle} onChange={(value) => updateField("issueTitle", value)} />
              <div className="field">
                <label htmlFor="description">Description</label>
                <textarea id="description" name="description" rows={5} value={values.description} aria-invalid={Boolean(errors.description)} aria-describedby={errors.description ? "description-error" : undefined} onChange={(event) => updateField("description", event.target.value)} />
                {errors.description && <p className="error-message" id="description-error" role="alert">{errors.description}</p>}
              </div>
            </div>
          </section>

          <section className="form-section" aria-labelledby="classification-section-title">
            <div className="section-heading">
              <div className="section-number">03</div>
              <div>
                <h2 id="classification-section-title">Classification</h2>
                <p>Set the initial routing and follow-up information.</p>
              </div>
            </div>
            <div className="field-grid three-columns">
              <SelectField label="Category" name="category" options={caseOptions.categories} value={values.category} error={errors.category} onChange={(value) => updateField("category", value)} />
              <SelectField label="Priority" name="priority" options={caseOptions.priorities} value={values.priority} error={errors.priority} onChange={(value) => updateField("priority", value)} />
              <SelectField label="Status" name="status" options={caseOptions.statuses} value={values.status} error={errors.status} onChange={(value) => updateField("status", value)} />
            </div>
            <p className="helper-note">Category, priority, and status are placeholder options for this MVP. Confirm their final values with Daniel before backend integration.</p>
          </section>

          <div className="form-actions">
            <button className="primary-button" type="submit">Create case</button>
          </div>
        </form>

        {submittedCase && (
          <div className="success-message" role="status" tabIndex={-1}>
            <div className="success-icon" aria-hidden="true">✓</div>
            <div>
              <h2>Case ready for review</h2>
              <p>This case was constructed in the browser. It has not been saved to a database.</p>
              <p className="timestamp">Created {new Date(submittedCase.createdAt).toLocaleString()}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function Field({ label, name, type = "text", value, error, onChange }: { label: string; name: keyof CaseFormValues; type?: string; value: string; error?: string; onChange: (value: string) => void }) {
  const errorId = `${name}-error`;
  return <div className="field"><label htmlFor={name}>{label}</label><input id={name} name={name} type={type} value={value} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} onChange={(event) => onChange(event.target.value)} />{error && <p className="error-message" id={errorId} role="alert">{error}</p>}</div>;
}

function SelectField({ label, name, options, value, error, onChange }: { label: string; name: keyof CaseFormValues; options: readonly string[]; value: string; error?: string; onChange: (value: string) => void }) {
  const errorId = `${name}-error`;
  return <div className="field"><label htmlFor={name}>{label}</label><select id={name} name={name} value={value} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} onChange={(event) => onChange(event.target.value)}><option value="">Select {label.toLowerCase()}</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select>{error && <p className="error-message" id={errorId} role="alert">{error}</p>}</div>;
}

export default App;
