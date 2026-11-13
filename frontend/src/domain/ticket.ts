// Maskinvärden och svenska visningsnamn enligt docs/api-kontrakt.md

export const STATUSES = [
  'new',
  'in_progress',
  'waiting_for_customer',
  'closed',
] as const
export type TicketStatus = (typeof STATUSES)[number]

export const STATUS_LABELS: Record<TicketStatus, string> = {
  new: 'Nytt',
  in_progress: 'Pågående',
  waiting_for_customer: 'Väntar på kund',
  closed: 'Avslutat',
}

export const CATEGORIES = ['billing', 'technical_support', 'other'] as const
export type Category = (typeof CATEGORIES)[number]

export const CATEGORY_LABELS: Record<Category, string> = {
  billing: 'Faktura',
  technical_support: 'Teknisk support',
  other: 'Övrigt',
}

export const PRIORITIES = ['low', 'normal', 'high'] as const
export type Priority = (typeof PRIORITIES)[number]

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Låg',
  normal: 'Normal',
  high: 'Hög',
}

export type Ticket = {
  id: number
  customer_id: string
  customer_name: string
  title: string
  description: string
  category: Category
  priority: Priority
  status: TicketStatus
  created_at: string
}

// null betyder Alla (K8)
export type StatusFilter = TicketStatus | null
