import Link from "next/link";
import type { Ticket } from "@/db/schema";
import type { TicketPriority, TicketStatus } from "@/tickets/ticketSchema";

const statusLabels: Record<TicketStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  closed: "Closed",
};

const statusStyles: Record<TicketStatus, string> = {
  open: "bg-blue-100 text-blue-800",
  in_progress: "bg-amber-100 text-amber-800",
  closed: "bg-slate-200 text-slate-700",
};

const priorityLabels: Record<TicketPriority, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
};

const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" });

export function TicketList({ tickets }: { tickets: Ticket[] }) {
  if (tickets.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-600">
        No tickets yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">Subject</th>
            <th scope="col" className="px-4 py-3 font-medium">Requester</th>
            <th scope="col" className="px-4 py-3 font-medium">Status</th>
            <th scope="col" className="px-4 py-3 font-medium">Priority</th>
            <th scope="col" className="px-4 py-3 font-medium">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {tickets.map((ticket) => (
            <tr key={ticket.id}>
              <td className="px-4 py-3 font-medium text-slate-900">
                <Link
                  href={`/tickets/${ticket.id}`}
                  className="underline hover:text-slate-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  {ticket.subject}
                </Link>
              </td>
              <td className="px-4 py-3 text-slate-700">{ticket.requesterName}</td>
              <td className="px-4 py-3">
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusStyles[ticket.status]}`}>
                  {statusLabels[ticket.status]}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-700">{priorityLabels[ticket.priority]}</td>
              <td className="px-4 py-3 text-slate-700">
                <time dateTime={ticket.createdAt.toISOString()}>{dateFormat.format(ticket.createdAt)}</time>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
