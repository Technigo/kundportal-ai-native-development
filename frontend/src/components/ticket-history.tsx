import { useEffect, useId, useState } from "react"

import { fetchHistory } from "@/api/tickets"
import type { HistoryEntry } from "@/api/types"
import { TicketTimeline } from "@/components/ticket-timeline"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

// The message when the history cannot be fetched (KSP-38, error messages in the UI). It is
// an exception from showing the detail as it is: "Något gick fel" would not say that only
// the history is missing while the rest of the view works. The button says what to do.
export const HISTORY_ERROR = "Historiken kunde inte hämtas."

type HistoryState = { kind: "loading" } | { kind: "ok"; entries: HistoryEntry[] } | { kind: "error" }

// KSP-37 (the timeline in the detail view): the section "Historik" under the ticket.
// It is shown only when the ticket has come with 200, so an unknown ticket never asks for
// its history (HIST-08). A new version, after a saved status or a 409, fetches the history
// again (KSP-37 AC4). While it is fetched again the old list stays, so nothing blinks.
// An error replaces the list, so a list that is behind the ticket is never shown (HIST-14).
export function TicketHistory({ ticketId, version }: { ticketId: string; version: number }) {
  const headingId = useId()
  const [state, setState] = useState<HistoryState>({ kind: "loading" })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    void fetchHistory(ticketId).then((result) => {
      if (!active) return
      setState(result.state === "ok" ? { kind: "ok", entries: result.entries } : { kind: "error" })
    })
    return () => {
      active = false
    }
  }, [ticketId, version, attempt])

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-4">
      <h2 id={headingId} className="text-lg font-bold">
        Historik
      </h2>
      {state.kind === "loading" && <TimelineSkeleton />}
      {state.kind === "ok" && <TicketTimeline entries={state.entries} />}
      {state.kind === "error" && (
        <Alert variant="destructive">
          <AlertDescription className="flex flex-col gap-3">
            <p>{HISTORY_ERROR}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="self-start"
              // The skeleton shows while the history is fetched again, so a click visibly does
              // something, and the button is gone so it cannot be clicked twice.
              onClick={() => {
                setState({ kind: "loading" })
                setAttempt((n) => n + 1)
              }}
            >
              Försök igen
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </section>
  )
}

// Two grey entries, like the detail view's skeleton (KSP-31). Hidden from screen readers,
// so the wrapper announces the loading.
function TimelineSkeleton() {
  return (
    <div role="status" aria-label="Laddar historiken …" aria-busy="true" className="flex flex-col gap-4">
      <Skeleton variant="blocks" className="h-12 w-full" />
      <Skeleton variant="blocks" className="h-12 w-full" />
    </div>
  )
}
