export type CaseFieldName = 'title' | 'description' | 'category' | 'priority' | 'status';
export type CaseFieldErrors = Partial<Record<CaseFieldName, string>>;

export function readCaseFormValue(formData: FormData, field: string): string {
  const value = formData.get(field);
  return typeof value === 'string' ? value : '';
}

export function focusFirstInvalidField(form: HTMLFormElement | null): void {
  form?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
}

interface CaseFieldValues {
  title: string;
  description: string;
  category: string;
  priority: string;
  status?: string;
}

export function validateCaseFields(values: CaseFieldValues): CaseFieldErrors {
  const errors: CaseFieldErrors = {};

  if (!values.title.trim()) errors.title = 'Ange en rubrik.';
  if (!values.description.trim()) errors.description = 'Ange en beskrivning.';
  if (!values.category) errors.category = 'Välj en kategori.';
  if (!values.priority) errors.priority = 'Välj en prioritet.';
  if (values.status === '') errors.status = 'Välj en status.';

  return errors;
}
