import type { Category, Priority } from './ticket'
import { TEXT_LIMITS, textLength, type TextField } from './text'

export type TicketFormValues = {
  customer_id: string
  customer_name: string
  title: string
  description: string
  category: Category | ''
  priority: Priority | ''
}

export type TicketField = keyof TicketFormValues
export type FieldErrors = Partial<Record<TicketField, string>>

export const STATUS_FIELD_ERROR = 'Välj en giltig status.'

// Fältspecifika svenska felmeddelanden (K2): vad som är fel och hur det rättas
const REQUIRED_MESSAGES: Record<TicketField, string> = {
  customer_id: 'Ange kund-ID',
  customer_name: 'Ange kundnamn',
  title: 'Ange en rubrik',
  description: 'Ange en beskrivning',
  category: 'Välj en kategori',
  priority: 'Välj en prioritet',
}

const TOO_LONG_MESSAGES: Record<TextField, string> = {
  customer_id: 'Kund-ID får innehålla högst 100 tecken',
  customer_name: 'Kundnamnet får innehålla högst 200 tecken',
  title: 'Rubriken får innehålla högst 100 tecken',
  description: 'Beskrivningen får innehålla högst 5 000 tecken',
}

const TEXT_FIELDS = Object.keys(TEXT_LIMITS) as TextField[]

// Snabb återkoppling med samma regler som backend. Backend avgör alltid.
export function validateTicketForm(values: TicketFormValues): FieldErrors {
  const errors: FieldErrors = {}

  for (const field of TEXT_FIELDS) {
    const length = textLength(values[field])
    if (length === 0) {
      errors[field] = REQUIRED_MESSAGES[field]
    } else if (length > TEXT_LIMITS[field]) {
      errors[field] = TOO_LONG_MESSAGES[field]
    }
  }

  if (values.category === '') errors.category = REQUIRED_MESSAGES.category
  if (values.priority === '') errors.priority = REQUIRED_MESSAGES.priority

  return errors
}

// Fält-fel från en 422: frontendens egen text om den finns, annars backendens
export function mergeBackendFieldErrors(
  values: TicketFormValues,
  backendFields: Record<string, string[]>,
): FieldErrors {
  const own = validateTicketForm(values)
  const merged: FieldErrors = {}

  for (const [field, messages] of Object.entries(backendFields)) {
    if (!(field in REQUIRED_MESSAGES)) continue
    const key = field as TicketField
    merged[key] = own[key] ?? messages[0]
  }

  return merged
}
