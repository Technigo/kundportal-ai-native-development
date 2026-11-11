import Link from "next/link";
import type { Ticket, TicketStatusChange } from "@/db/schema";
import type { ChangeStatusState } from "@/tickets/changeStatusState";
import { StatusForm } from "./StatusForm";
import { statusLabels } from "@/tickets/statusLabels";
import type { TicketPriority, TicketStatus } from "@/tickets/ticketSchema";

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

type TicketDetailsProps = {
  ticket: Ticket;
  changes: TicketStatusChange[];
  statusAction: (state: ChangeStatusState, formData: FormData) => Promise<ChangeStatusState>;
};

export function TicketDetails({ ticket, changes, statusAction }: TicketDetailsProps) {
  return (
    <article className="max-w-3xl space-y-6">
      <Link
        href="/tickets"
        className="text-sm text-slate-600 underline hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        Back to tickets
      </Link>
      <h1 className="wrap-break-word text-2xl font-semibold">{ticket.subject}</h1>
      <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2 text-sm">
        <dt className="font-medium text-slate-600">Status</dt>
        <dd>
          <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusStyles[ticket.status]}`}>
            {statusLabels[ticket.status]}
          </span>
        </dd>
        <dt className="font-medium text-slate-600">Priority</dt>
        <dd className="text-slate-700">{priorityLabels[ticket.priority]}</dd>
        <dt className="font-medium text-slate-600">Created</dt>
        <dd className="text-slate-700">
          <time dateTime={ticket.createdAt.toISOString()}>{dateFormat.format(ticket.createdAt)}</time>
        </dd>
        <dt className="font-medium text-slate-600">Requester</dt>
        <dd className="text-slate-700">{ticket.requesterName}</dd>
        <dt className="font-medium text-slate-600">Email</dt>
        <dd className="text-slate-700">{ticket.requesterEmail ?? "No email given"}</dd>
      </dl>
      <section aria-label="Description" className="space-y-2">
        <h2 className="text-lg font-semibold">Description</h2>
        <p className="wrap-break-word whitespace-pre-wrap rounded-lg border border-slate-200 bg-white p-4 text-slate-800">
          {ticket.description}
        </p>
      </section>
      <section aria-label="Status and history" className="space-y-4">
        <StatusForm ticketId={ticket.id} status={ticket.status} action={statusAction} />
        <h2 className="text-lg font-semibold">Status history</h2>
        {changes.length === 0 ? (
          <p className="text-sm text-slate-600">No status changes yet.</p>
        ) : (
          <ol className="space-y-1 text-sm text-slate-700">
            {changes.map((change) => (
              <li key={change.id}>
                {statusLabels[change.fromStatus]} → {statusLabels[change.toStatus]} ·{" "}
                <time dateTime={change.changedAt.toISOString()}>{dateFormat.format(change.changedAt)}</time>
              </li>
            ))}
          </ol>
        )}
      </section>
    </article>
  );
}
