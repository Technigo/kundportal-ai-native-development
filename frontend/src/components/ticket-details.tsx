import type { ReactNode } from "react"

import type { Ticket } from "@/api/types"
import { StatusBadge } from "@/components/status-badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { categoryLabel, priorityLabel } from "@/labels"
import { formatLocalDateTime } from "@/lib/format"

// All fields of a ticket (CORE-04), laid out as decided in KSP-31 AC8: id and title in a
// header with the primary colour, then category and created on the left, status and
// priority on the right, and the description last.
export function TicketDetails({ ticket }: { ticket: Ticket }) {
  return (
    <Card>
      <CardHeader className="bg-primary text-primary-foreground">
        <h1 className="flex flex-wrap items-baseline gap-3 text-xl leading-tight font-bold">
          <span>#{ticket.id}</span>
          <span>{ticket.title}</span>
        </h1>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div className="flex flex-col gap-4">
            <Field label="Kategori">{categoryLabel(ticket.category)}</Field>
            <Field label="Skapad">
              <time dateTime={ticket.created_at}>{formatLocalDateTime(ticket.created_at)}</time>
            </Field>
          </div>
          <div className="flex flex-col gap-4">
            <Field label="Status">
              <StatusBadge status={ticket.status} />
            </Field>
            <Field label="Prioritet">{priorityLabel(ticket.priority)}</Field>
          </div>
        </dl>

        <div className="flex flex-col gap-1 text-sm">
          <h2 className="text-xs font-bold tracking-wide text-muted-foreground uppercase">Beskrivning</h2>
          <p className="whitespace-pre-line">{ticket.description}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-bold tracking-wide text-muted-foreground uppercase">{label}</dt>
      <dd className="font-medium">{children}</dd>
    </div>
  )
}
