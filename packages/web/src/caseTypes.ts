export interface CaseSummary {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
}

export interface CreatedCase extends CaseSummary {
  description: string;
  note: string | null;
}

export function isCaseSummary(value: unknown): value is CaseSummary {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  return (
    'id' in value &&
    typeof value.id === 'number' &&
    'title' in value &&
    typeof value.title === 'string' &&
    'description' in value &&
    typeof value.description === 'string' &&
    'category' in value &&
    typeof value.category === 'string' &&
    'priority' in value &&
    typeof value.priority === 'string' &&
    'status' in value &&
    typeof value.status === 'string' &&
    'createdAt' in value &&
    typeof value.createdAt === 'string'
  );
}

export function isCreatedCase(value: unknown): value is CreatedCase {
  return (
    isCaseSummary(value) &&
    'description' in value && typeof value.description === 'string' &&
    'note' in value && (value.note === null || typeof value.note === 'string')
  );
}
