import type { TicketStatus } from "./ticketSchema";

// Display names for each status. Add a name here when a status is added to ticketStatuses.
export const statusLabels: Record<TicketStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  closed: "Closed",
};
