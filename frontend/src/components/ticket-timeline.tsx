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
import { cn } from "@/lib/utils"

// KSP-37 (the timeline in the detail view, HIST-05): the ticket's history as a list, in the
// order from the API (HIST-03, HIST-11). The UI never sorts.
// - created has no from status: the heading is the status ("Nytt") and "Ärendet skapades"
//   is written under it.
// - A status change is "Nytt → Pågående", with the old status struck through (<s>, no
//   longer valid). The arrow is hidden from screen readers, which read "Nytt till Pågående".
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
            {/* A fixed width as wide as the largest dot, so all text starts at the same place
                and the line goes through the middle of every dot (Mustafa's review of PR #109). */}
            <div className="flex w-6 shrink-0 flex-col items-center" aria-hidden="true">
              {/* Earlier dots are smaller (16 px instead of 24 px), so the current one stands
                  out by size too, not only by colour. */}
              {/* BOLDkit's 4 px shadow took over on such small dots, so it is 2 px here. */}
              <TimelineDot
                status={status}
                size="sm"
                className={cn("shadow-[2px_2px_0px_hsl(var(--shadow-color))]", !last && "h-4 w-4")}
              />
              {!last && <TimelineConnector status="completed" className="ml-0 flex-1" />}
            </div>
            <TimelineContent className={last ? "pb-0" : undefined}>
              <TimelineTitle className="text-sm">
                {entry.event_type === "created" || entry.from_status === null ? (
                  statusLabel(entry.to_status)
                ) : (
                  <>
                    <s>{statusLabel(entry.from_status)}</s> <span aria-hidden="true">→</span>{" "}
                    <span className="sr-only">till</span> <span>{statusLabel(entry.to_status)}</span>
                  </>
                )}
                {last && <span className="sr-only"> (aktuell status)</span>}
              </TimelineTitle>
              {entry.event_type === "created" && <TimelineDescription>Ärendet skapades</TimelineDescription>}
              <TimelineTime dateTime={entry.occurred_at}>{formatLocalDateTime(entry.occurred_at)}</TimelineTime>
            </TimelineContent>
          </TimelineItem>
        )
      })}
    </Timeline>
  )
}
