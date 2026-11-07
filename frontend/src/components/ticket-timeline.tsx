import type { HistoryEntry } from "@/api/types"
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDescription,
  TimelineDot,
  TimelineItem,
  TimelineTime,
  TimelineTitle,
} from "@/components/ui/timeline"
import { statusLabel } from "@/labels"
import { formatLocalDateTime } from "@/lib/format"

// KSP-37 (the timeline in the detail view, HIST-05): the ticket's history as a list, in the
// order from the API (HIST-03, HIST-11). The UI never sorts.
// - created is an event: "Ärendet skapades" and "Status: Nytt" (it has no from status).
// - A status change is "Nytt → Pågående". The arrow is hidden from screen readers, which
//   read "Nytt till Pågående" instead.
// - The latest entry is the current status (the dot "current" and a hidden text, so that it
//   is not shown by colour alone, WCAG 1.4.1). The earlier ones are "completed".
// BOLDkit's timeline is only div elements, so the roles list and listitem are set here.
export function TicketTimeline({ entries }: { entries: HistoryEntry[] }) {
  return (
    <Timeline role="list">
      {entries.map((entry, index) => {
        const last = index === entries.length - 1
        const status = last ? "current" : "completed"
        return (
          <TimelineItem key={entry.id} role="listitem" status={status}>
            <div className="flex flex-col items-center" aria-hidden="true">
              <TimelineDot status={status} size="sm" />
              {!last && <TimelineConnector status="completed" className="ml-0 flex-1" />}
            </div>
            <TimelineContent className={last ? "pb-0" : undefined}>
              <TimelineTitle className="text-sm">
                {entry.event_type === "created" || entry.from_status === null ? (
                  "Ärendet skapades"
                ) : (
                  <>
                    {statusLabel(entry.from_status)} <span aria-hidden="true">→</span>{" "}
                    <span className="sr-only">till</span> {statusLabel(entry.to_status)}
                  </>
                )}
                {last && <span className="sr-only"> (aktuell status)</span>}
              </TimelineTitle>
              {entry.event_type === "created" && (
                <TimelineDescription>Status: {statusLabel(entry.to_status)}</TimelineDescription>
              )}
              <TimelineTime dateTime={entry.occurred_at}>{formatLocalDateTime(entry.occurred_at)}</TimelineTime>
            </TimelineContent>
          </TimelineItem>
        )
      })}
    </Timeline>
  )
}
