import type { TicketStatus } from "@/api/types"
import { Badge } from "@/components/ui/badge"
import { statusBadgeVariant, statusLabel } from "@/labels"
import { cn } from "@/lib/utils"

// Same label and colour as in the ticket list (labels.ts, KSP-29).
// The badge is not clickable, so BOLDkit's hover movement is turned off.
export function StatusBadge({ status, className }: { status: TicketStatus; className?: string }) {
  return (
    <Badge
      variant={statusBadgeVariant(status)}
      className={cn(
        "shadow-[2px_2px_0px_hsl(var(--shadow-color))] hover:translate-x-0 hover:translate-y-0 hover:shadow-[2px_2px_0px_hsl(var(--shadow-color))]",
        className
      )}
    >
      {statusLabel(status)}
    </Badge>
  )
}
