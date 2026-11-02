export const categories = ['Konto', 'Fakturering', 'Tekniskt', 'Övrigt'] as const;
export const priorities = ['Låg', 'Normal', 'Hög'] as const;
export const statuses = ['Nytt', 'Pågående', 'Väntar på kund', 'Avslutat'] as const;

export interface CreateCaseInput {
  title: string;
  description: string;
  category: (typeof categories)[number];
  priority: (typeof priorities)[number];
}

type TextResult = { success: true; value: string } | { success: false; error: string };
type ValidationResult =
  | { success: true; value: CreateCaseInput }
  | { success: false; error: string };

function requiredText(value: unknown, label: string, maximumLength: number): TextResult {
  if (typeof value !== 'string') {
    return { success: false, error: `${label} måste anges.` };
  }

  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > maximumLength) {
    return {
      success: false,
      error: `${label} måste innehålla mellan 1 och ${maximumLength} tecken.`
    };
  }

  return { success: true, value: trimmed };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isOneOf<T extends readonly string[]>(values: T, value: unknown): value is T[number] {
  return typeof value === 'string' && values.some((candidate) => candidate === value);
}

export function isValidCaseId(value: string): boolean {
  return /^[1-9]\d*$/.test(value) && Number.isSafeInteger(Number(value));
}

export function validateCaseStatus(input: unknown):
  | { success: true; value: (typeof statuses)[number] }
  | { success: false; error: string } {
  if (!isRecord(input) || !isOneOf(statuses, input.status)) {
    return { success: false, error: 'Välj en giltig status.' };
  }

  return { success: true, value: input.status };
}

export function validateCreateCase(input: unknown): ValidationResult {
  if (!isRecord(input)) {
    return { success: false, error: 'Ärendeuppgifterna måste skickas som ett objekt.' };
  }

  const title = requiredText(input.title, 'Rubrik', 120);
  if (!title.success) {
    return title;
  }

  const description = requiredText(input.description, 'Beskrivning', 2000);
  if (!description.success) {
    return description;
  }

  if (!isOneOf(categories, input.category)) {
    return { success: false, error: 'Välj en giltig kategori.' };
  }

  if (!isOneOf(priorities, input.priority)) {
    return { success: false, error: 'Välj en giltig prioritet.' };
  }

  return {
    success: true,
    value: {
      title: title.value,
      description: description.value,
      category: input.category,
      priority: input.priority
    }
  };
}
