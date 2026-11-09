"use client";

import { useActionState } from "react";
import type { SubmitTicketState } from "@/app/(portal)/tickets/actions";
import { ticketPriorities } from "@/tickets/ticketSchema";

type TicketFormProps = {
  action: (state: SubmitTicketState, formData: FormData) => Promise<SubmitTicketState>;
};

const inputClass =
  "mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/30 aria-invalid:border-red-600";

function FieldError({ id, messages }: { id: string; messages?: string[] }) {
  if (!messages?.length) return null;
  return (
    <p id={id} className="mt-1 text-sm text-red-700">
      {messages.join(" ")}
    </p>
  );
}

export function TicketForm({ action }: TicketFormProps) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const errors = state?.errors ?? {};
  const values = state?.values;

  return (
    // Remount with the returned values: React resets a form after its action runs.
    <form key={JSON.stringify(values)} action={formAction} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="requesterName" className="block text-sm font-medium text-slate-800">
            Requester name
          </label>
          <input
            id="requesterName"
            name="requesterName"
            required
            maxLength={120}
            defaultValue={values?.requesterName}
            aria-invalid={errors.requesterName ? true : undefined}
            aria-describedby={errors.requesterName ? "requesterName-error" : undefined}
            className={inputClass}
          />
          <FieldError id="requesterName-error" messages={errors.requesterName} />
        </div>
        <div>
          <label htmlFor="requesterEmail" className="block text-sm font-medium text-slate-800">
            Requester email (optional)
          </label>
          <input
            id="requesterEmail"
            name="requesterEmail"
            type="email"
            maxLength={254}
            defaultValue={values?.requesterEmail}
            aria-invalid={errors.requesterEmail ? true : undefined}
            aria-describedby={errors.requesterEmail ? "requesterEmail-error" : undefined}
            className={inputClass}
          />
          <FieldError id="requesterEmail-error" messages={errors.requesterEmail} />
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-slate-800">
          Subject
        </label>
        <input
          id="subject"
          name="subject"
          required
          maxLength={120}
          defaultValue={values?.subject}
          aria-invalid={errors.subject ? true : undefined}
          aria-describedby={errors.subject ? "subject-error" : undefined}
          className={inputClass}
        />
        <FieldError id="subject-error" messages={errors.subject} />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-800">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={6}
          maxLength={5000}
          defaultValue={values?.description}
          aria-invalid={errors.description ? true : undefined}
          aria-describedby={errors.description ? "description-error" : undefined}
          className={inputClass}
        />
        <FieldError id="description-error" messages={errors.description} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-slate-800">
            Category
          </label>
          <input
            id="category"
            name="category"
            required
            maxLength={50}
            defaultValue={values?.category}
            aria-invalid={errors.category ? true : undefined}
            aria-describedby={errors.category ? "category-error" : undefined}
            className={inputClass}
          />
          <FieldError id="category-error" messages={errors.category} />
        </div>
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-slate-800">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            defaultValue={values?.priority || "normal"}
            aria-invalid={errors.priority ? true : undefined}
            aria-describedby={errors.priority ? "priority-error" : undefined}
            className={`${inputClass} sm:w-48`}
          >
            {ticketPriorities.map((priority) => (
              <option key={priority} value={priority}>
                {priority[0]!.toUpperCase() + priority.slice(1)}
              </option>
            ))}
          </select>
          <FieldError id="priority-error" messages={errors.priority} />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Registering…" : "Register ticket"}
      </button>
    </form>
  );
}
