import { Headset } from "lucide-react"
import { Link, useLocation, useNavigate } from "react-router"

import type { Ticket } from "@/api/types"
import { CreateTicketForm } from "@/components/create-ticket-form"
import { useTicketListRefresh } from "@/components/ticket-list-refresh"
import { cn } from "@/lib/utils"

// KSP-75: portal name and navigation above the ticket pages.
// The name truncates. Below 28rem the icon, the list link and the create button
// need the row, so the name is hidden visually and kept for screen readers.
// Below 340px the row uses tighter padding and gaps, so those controls stay
// fully visible without wrapping or scrolling sideways.

export function AppHeader() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const refresh = useTicketListRefresh()
  const onList = pathname === "/"

  // On the list the new ticket shows up when the list reloads. Elsewhere the new
  // ticket is opened, so the handler sees that it was created. A dialog that was
  // discarded during the request does not move the handler away.
  function handleCreated(ticket: Ticket, { discarded }: { discarded: boolean }) {
    if (onList) {
      refresh?.onCreated()
      return
    }
    if (!discarded) void navigate(`/tickets/${ticket.id}`)
  }

  return (
    <header className="@container sticky top-0 z-50 border-b-3 bg-background">
      <div className="flex h-1 w-full" aria-hidden="true">
        <div className="flex-1 bg-primary" />
        <div className="flex-1 bg-secondary" />
        <div className="flex-1 bg-accent" />
        <div className="flex-1 bg-success" />
        <div className="flex-1 bg-info" />
      </div>
      <div className="mx-auto flex h-14 w-full max-w-7xl flex-nowrap items-center gap-4 px-6 @max-[340px]:gap-2 @max-[340px]:px-2 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3 @max-[340px]:gap-2">
          <Headset aria-hidden="true" className="size-4 shrink-0" />
          <span title="Kundserviceportalen" className="min-w-0 truncate @max-[28rem]:sr-only">
            Kundserviceportalen
          </span>
          <nav className="flex h-14 shrink-0" aria-label="Huvudmeny">
            <Link
              to="/"
              aria-current={onList ? "page" : undefined}
              className={cn(
                "relative flex h-14 items-center px-3 text-sm font-bold tracking-wide transition-colors duration-150 hover:text-primary",
                onList ? "text-primary" : "text-foreground/70 hover:text-foreground",
              )}
            >
              Ärenden
              {onList && (
                <span aria-hidden="true" className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary" />
              )}
            </Link>
          </nav>
        </div>
        <div className="shrink-0">
          <CreateTicketForm onCreated={handleCreated} />
        </div>
      </div>
    </header>
  )
}
