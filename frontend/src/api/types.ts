import type { components } from "@/api/schema"

// Short names for the types generated from OpenAPI (KSP-28: TypeScript types generated
// from OpenAPI). Regenerate schema.d.ts with `pnpm generate:api`, never edit it by hand.
type Schemas = components["schemas"]

export type TicketStatus = Schemas["Status"]
export type TicketCategory = Schemas["Category"]
export type TicketPriority = Schemas["Priority"]
export type Ticket = Schemas["Ticket"]
export type HistoryEntry = Schemas["HistoryEntry"]
// Every error body from the backend (api-konventioner.md section 2).
export type ErrorResponse = Schemas["ErrorResponse"]
