"use client";

import { useActionState } from "react";
import type { ChangeStatusState } from "@/tickets/changeStatusState";
import { statusLabels } from "@/tickets/statusLabels";
import { ticketStatuses, type TicketStatus } from "@/tickets/ticketSchema";

type StatusFormProps = {
  ticketId: number;
  status: TicketStatus;
  action: (state: ChangeStatusState, formData: FormData) => Promise<ChangeStatusState>;
};

export function StatusForm({ ticketId, status, action }: StatusFormProps) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const error = state?.error;

  return (
    // Remount when the saved status changes, so the dropdown starts on the new status.
    <form key={status} action={formAction} className="flex flex-wrap items-start gap-3">
      <input type="hidden" name="ticketId" value={ticketId} />
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-slate-800">
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={status}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "status-error" : undefined}
          className="mt-1 block rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/30 aria-invalid:border-red-600"
        >
          {ticketStatuses.map((s) => (
            <option key={s} value={s}>
              {statusLabels[s]}
            </option>
          ))}
        </select>
        {error && (
          <p id="status-error" className="mt-1 text-sm text-red-700">
            {error}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="mt-6 rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-60"
      >
        Save
      </button>
    </form>
  );
}
