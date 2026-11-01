import { useEffect, useState } from "react"
import { useParams } from "react-router"

import { fetchTicket, type TicketResult } from "@/api/tickets"
import { TicketDetails } from "@/components/ticket-details"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

// Detail view for one ticket (KSP-31) on /tickets/:id (AC5): fetched by its id (CORE-04),
// with a skeleton while it loads, and the message from the API for an unknown id (CORE-10).
// The id is kept as text, also "abc": the API decides what is unknown.
export function TicketDetailPage() {
  const ticketId = useParams().id
  // The result remembers which id it belongs to, so a new id means loading again.
  const [loaded, setLoaded] = useState<{ id: string; result: TicketResult } | null>(null)

  useEffect(() => {
    if (ticketId === undefined) return
    let active = true
    void fetchTicket(ticketId).then((result) => {
      if (active) setLoaded({ id: ticketId, result })
    })
    return () => {
      active = false
    }
  }, [ticketId])

  if (ticketId === undefined) return null

  const result = loaded?.id === ticketId ? loaded.result : null

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 p-6">
      {result === null && <TicketDetailsSkeleton />}
      {result?.state === "ok" && <TicketDetails ticket={result.ticket} />}
      {/* The detail from the API as it is (KSP-31 AC7), in the same alert as the ticket list.
          A link back to the list comes with KSP-38 (error messages in the UI). */}
      {result?.state === "error" && (
        <Alert variant="destructive">
          <AlertDescription>{result.message}</AlertDescription>
        </Alert>
      )}
    </main>
  )
}

// One skeleton per field of the ticket, in the same places as in the view (KSP-31 AC4):
// the whole header (id and title) as one grey block, then two columns (category and created
// on the left, status and priority on the right), and a larger one for the description.
// The skeletons are hidden from screen readers, so the card itself announces the loading.
function TicketDetailsSkeleton() {
  return (
    <Card role="status" aria-label="Laddar ärendet …" aria-busy="true">
      <CardHeader className="p-0">
        <Skeleton variant="blocks" className="h-20 w-full border-0" />
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-4">
            <Skeleton variant="blocks" className="h-10" />
            <Skeleton variant="blocks" className="h-10" />
          </div>
          <div className="flex flex-col gap-4">
            <Skeleton variant="blocks" className="h-10" />
            <Skeleton variant="blocks" className="h-10" />
          </div>
        </div>
        <Skeleton variant="blocks" className="h-32 w-full" />
      </CardContent>
    </Card>
  )
}
