import { useEffect, useState } from "react"
import { Link } from "react-router"

import type { components, operations } from "@/api/schema"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateTitle,
} from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { formatLocalDateTime } from "@/lib/format"
import {
  categoryLabel,
  priorityLabel,
  statusBadgeVariant,
  statusLabel,
} from "@/labels"
import { BACKEND_UNREACHABLE } from "@/pages/HealthPage"

// KSP-29: ticket list. CORE-03 keeps the API order. CORE-15 empty list is a message.

type Ticket = components["schemas"]["Ticket"]
type TicketListBody =
  operations["list_tickets_tickets_get"]["responses"][200]["content"]["application/json"]
type ErrorBody = components["schemas"]["ErrorResponse"]

type ListState =
  | { state: "loading" }
  | { state: "ok"; tickets: Ticket[] }
  | { state: "error"; message: string }

async function fetchTickets(): Promise<ListState> {
  try {
    const response = await fetch("/api/tickets")
    if (response.ok) {
      const tickets = (await response.json()) as TicketListBody
      return { state: "ok", tickets }
    }
    const data = (await response.json()) as ErrorBody
    return { state: "error", message: data.detail }
  } catch {
    return { state: "error", message: BACKEND_UNREACHABLE }
  }
}

export function TicketListPage() {
  const [list, setList] = useState<ListState>({ state: "loading" })

  useEffect(() => {
    let active = true
    void fetchTickets().then((result) => {
      if (active) setList(result)
    })
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="flex min-h-svh flex-col gap-6 p-6">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Ärenden</h1>
        <Button variant="link" render={<Link to="/health" />}>
          Systemstatus
        </Button>
      </header>
      {list.state === "loading" && (
        <div role="status" aria-live="polite" aria-busy="true">
          <p className="sr-only">Hämtar ärenden …</p>
          <div className="flex flex-col gap-4">
            <Skeleton className="h-24 w-full" variant="blocks" />
            <Skeleton className="h-24 w-full" variant="blocks" />
            <Skeleton className="h-24 w-full" variant="blocks" />
          </div>
        </div>
      )}
      {list.state === "error" && (
        <Alert variant="destructive">
          <AlertDescription>{list.message}</AlertDescription>
        </Alert>
      )}
      {list.state === "ok" && list.tickets.length === 0 && (
        <EmptyState>
          <EmptyStateTitle>Inga ärenden än</EmptyStateTitle>
          <EmptyStateDescription>
            När ett ärende registreras visas det här.
          </EmptyStateDescription>
        </EmptyState>
      )}
      {list.state === "ok" && list.tickets.length > 0 && (
        <ul className="flex flex-col gap-4">
          {list.tickets.map((ticket) => (
            <li key={ticket.id}>
              <Link to={`/tickets/${ticket.id}`} className="block">
                <Card>
                  <CardHeader>
                    <CardTitle className="break-words">{ticket.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap items-center gap-3">
                    <p>{categoryLabel(ticket.category)}</p>
                    <p>{priorityLabel(ticket.priority)}</p>
                    <Badge variant={statusBadgeVariant(ticket.status)}>
                      {statusLabel(ticket.status)}
                    </Badge>
                    <p>{formatLocalDateTime(ticket.created_at)}</p>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
