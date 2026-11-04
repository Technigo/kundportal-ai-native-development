import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Link } from "react-router"
import type { ColumnDef } from "@tanstack/react-table"
import { ChevronDown, Filter, Search } from "lucide-react"

import type { components, operations } from "@/api/schema"
import { CreateTicketForm } from "@/components/create-ticket-form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateTitle,
} from "@/components/ui/empty-state"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NativeSelect } from "@/components/ui/native-select"
import { Skeleton } from "@/components/ui/skeleton"
import { formatLocalDateTime } from "@/lib/format"
import { filterTickets, matchCountLabel } from "@/lib/ticket-filters"
import {
  categoryLabel,
  categoryLabels,
  priorityLabel,
  priorityLabels,
  statusBadgeVariant,
  statusLabel,
  statusLabels,
} from "@/labels"
import { BACKEND_UNREACHABLE } from "@/pages/HealthPage"

// KSP-29: ticket list. CORE-03 keeps the API order. CORE-15 empty list is a message.
// KSP-77: search filters the table immediately. Status, priority and category
// stay behind the Filtrera button. Filtering does not call the API again.

type Ticket = components["schemas"]["Ticket"]
type Category = components["schemas"]["Category"]
type Priority = components["schemas"]["Priority"]
type Status = components["schemas"]["Status"]

type TicketListBody =
  operations["list_tickets_tickets_get"]["responses"][200]["content"]["application/json"]
type ErrorBody = components["schemas"]["ErrorResponse"]

type ListState =
  | { state: "loading" }
  | { state: "ok"; tickets: Ticket[] }
  | { state: "error"; message: string }

const columns: ColumnDef<Ticket>[] = [
  {
    accessorKey: "id",
    header: "Ärende-id",
    cell: ({ row }) => <span className="whitespace-nowrap">{row.original.id}</span>,
  },
  {
    accessorKey: "title",
    header: "Rubrik",
    cell: ({ row }) => (
      <Link
        to={`/tickets/${row.original.id}`}
        className="break-words font-bold underline-offset-4 hover:underline"
      >
        {row.original.title}
      </Link>
    ),
  },
  {
    accessorKey: "category",
    header: "Kategori",
    cell: ({ row }) => categoryLabel(row.original.category),
  },
  {
    accessorKey: "priority",
    header: "Prioritet",
    cell: ({ row }) => priorityLabel(row.original.priority),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={statusBadgeVariant(row.original.status)}>
        {statusLabel(row.original.status)}
      </Badge>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Skapad",
    cell: ({ row }) => (
      <span className="whitespace-nowrap">
        {formatLocalDateTime(row.original.created_at)}
      </span>
    ),
  },
]

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

function FilterSelect<T extends string>({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string
  label: string
  value: T | ""
  options: Record<T, string>
  onChange: (value: T | "") => void
}) {
  const optionLabels = ["Alla", ...Object.values(options)]

  return (
    <Field className="w-full min-w-0 sm:w-max sm:shrink-0">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {/* Width follows the longest label, not the selected one, so the row does not move. */}
      <div className="grid max-w-full">
        <div className="col-start-1 row-start-1 min-w-0">
          <NativeSelect
            id={id}
            title={value === "" ? "Alla" : options[value]}
            value={value}
            onChange={(event) => onChange(event.target.value as T | "")}
          >
            <option value="">Alla</option>
            {Object.entries(options).map(([code, optionLabel]) => (
              <option key={code} value={code}>
                {optionLabel as string}
              </option>
            ))}
          </NativeSelect>
        </div>
        {optionLabels.map((optionLabel) => (
          <span
            key={optionLabel}
            aria-hidden
            className="invisible col-start-1 row-start-1 self-center border-3 border-transparent px-3 pr-10 text-sm leading-[calc(2.75rem-6px)] font-bold tracking-wide whitespace-nowrap uppercase"
          >
            {optionLabel}
          </span>
        ))}
      </div>
    </Field>
  )
}

export function TicketListPage() {
  const [list, setList] = useState<ListState>({ state: "loading" })
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<Status | "">("")
  const [priority, setPriority] = useState<Priority | "">("")
  const [category, setCategory] = useState<Category | "">("")
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const requestId = useRef(0)

  const reload = useCallback(() => {
    const id = ++requestId.current
    void fetchTickets().then((result) => {
      if (requestId.current === id) setList(result)
    })
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  const filtered = useMemo(() => {
    if (list.state !== "ok") return []
    return filterTickets(list.tickets, { query, status, priority, category })
  }, [list, query, status, priority, category])
  const filtersActive = status !== "" || priority !== "" || category !== ""

  return (
    <div className="flex min-h-svh flex-col gap-6 p-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Ärenden</h1>
        <div className="flex flex-wrap items-center gap-3">
          <CreateTicketForm onCreated={reload} />
          <Button variant="link" render={<Link to="/health" />}>
            Systemstatus
          </Button>
        </div>
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
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1">
              <Search
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <label className="sr-only" htmlFor="ticket-search">
                Sök ärenden
              </label>
              <Input
                id="ticket-search"
                className="pl-10"
                placeholder="Sök ärenden..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              aria-expanded={advancedOpen}
              aria-controls="ticket-advanced-filters"
              onClick={() => setAdvancedOpen((open) => !open)}
            >
              <Filter aria-hidden />
              Filtrera
              <ChevronDown
                aria-hidden
                className={
                  advancedOpen ? "rotate-180 transition-transform" : "transition-transform"
                }
              />
            </Button>
          </div>
          {advancedOpen && (
            <div
              id="ticket-advanced-filters"
              role="group"
              aria-label="Avancerade filter"
              className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end"
            >
              <FilterSelect
                id="ticket-filter-status"
                label="Status"
                value={status}
                options={statusLabels}
                onChange={setStatus}
              />
              <FilterSelect
                id="ticket-filter-priority"
                label="Prioritet"
                value={priority}
                options={priorityLabels}
                onChange={setPriority}
              />
              <FilterSelect
                id="ticket-filter-category"
                label="Kategori"
                value={category}
                options={categoryLabels}
                onChange={setCategory}
              />
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                disabled={!filtersActive}
                onClick={() => {
                  setStatus("")
                  setPriority("")
                  setCategory("")
                }}
              >
                Återställ filter
              </Button>
            </div>
          )}
          <p aria-live="polite">{matchCountLabel(filtered.length)}</p>
          <DataTable
            columns={columns}
            data={filtered}
            enableSorting={false}
            enableFiltering={false}
            enablePagination={false}
            emptyMessage="Inga ärenden matchar"
          />
        </div>
      )}
    </div>
  )
}
