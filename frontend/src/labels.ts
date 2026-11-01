import type { components } from "@/api/schema"

// One table from API code to Swedish label (API conventions, section 1).
// CORE B2 categories, CORE B3 priorities, HIST assumption 2 statuses.
// KSP-31 (ticket detail) imports this module too.

type Category = components["schemas"]["Category"]
type Priority = components["schemas"]["Priority"]
type Status = components["schemas"]["Status"]

export const categoryLabels: Record<Category, string> = {
  billing: "Faktura och betalning",
  delivery: "Leverans",
  technical: "Tekniskt problem",
  account: "Konto",
  other: "Övrigt",
}

export const priorityLabels: Record<Priority, string> = {
  low: "Låg",
  medium: "Medel",
  high: "Hög",
}

export const statusLabels: Record<Status, string> = {
  new: "Nytt",
  in_progress: "Pågående",
  waiting_on_customer: "Väntar på kund",
  closed: "Avslutat",
}

export function categoryLabel(code: Category): string {
  return categoryLabels[code]
}

export function priorityLabel(code: Priority): string {
  return priorityLabels[code]
}

export function statusLabel(code: Status): string {
  return statusLabels[code]
}

type StatusBadgeVariant = "info" | "accent" | "warning" | "secondary"

const statusBadgeVariants: Record<Status, StatusBadgeVariant> = {
  new: "info",
  in_progress: "accent",
  waiting_on_customer: "warning",
  closed: "secondary",
}

export function statusBadgeVariant(code: Status): StatusBadgeVariant {
  return statusBadgeVariants[code]
}
