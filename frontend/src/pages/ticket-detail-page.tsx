import { useEffect, useState } from "react"
import { Link, useParams } from "react-router"

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
      {result?.state === "ok" && (
        <TicketDetails
          ticket={result.ticket}
          // A saved status replaces the ticket, so the view shows the answer from the API.
          onStatusSaved={(ticket) => setLoaded({ id: ticketId, result: { state: "ok", ticket } })}
        />
      )}
      {/* The detail from the API as it is (KSP-31 AC7), in the same alert as the ticket list.
          KSP-38 AC4: a ticket that does not exist (404, CORE-10, also "abc" by B8) gets a
          link back to the list in the same alert. The status code decides, not the text. */}
      {result?.state === "error" && (
        <Alert variant="destructive">
          <AlertDescription className="flex flex-col gap-2">
            <p>{result.message}</p>
            {result.httpStatus === 404 && (
              <Link to="/" className="self-start font-bold underline underline-offset-4 hover:no-underline">
                Tillbaka till ärendelistan
              </Link>
            )}
          </AlertDescription>
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
