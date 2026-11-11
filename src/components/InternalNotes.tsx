"use client";

import { useActionState } from "react";
import type { NoteActionState } from "@/app/(portal)/tickets/actions";
import type { NoteWithComments } from "@/tickets/ticketRepository";

type InternalNotesProps = {
  ticketId: number;
  notes: NoteWithComments[];
  addNote: (state: NoteActionState, formData: FormData) => Promise<NoteActionState>;
};

const dateTimeFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" });

export function InternalNotes({ ticketId, notes, addNote }: InternalNotesProps) {
  const [state, formAction, pending] = useActionState(addNote, undefined);

  return (
    <section aria-labelledby="internal-notes-heading" className="space-y-4">
      <h2 id="internal-notes-heading" className="text-lg font-semibold">
        Internal notes
      </h2>
      <div role="alert" className="text-sm text-red-700">
        {state?.alert}
      </div>
      {/* Remount with the returned values: React resets a form after its action runs. */}
      <form key={JSON.stringify(state)} action={formAction} noValidate className="space-y-2">
        <input type="hidden" name="ticketId" value={ticketId} />
        <label htmlFor="note-body" className="block text-sm font-medium text-slate-800">
          Note
        </label>
        <textarea
          id="note-body"
          name="body"
          maxLength={500}
          rows={3}
          defaultValue={state?.value}
          aria-invalid={state?.error ? true : undefined}
          aria-describedby={state?.error ? "note-body-error" : undefined}
          className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/30 aria-invalid:border-red-600"
        />
        {state?.error && (
          <p id="note-body-error" className="text-sm text-red-700">
            {state.error}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-60"
        >
          Add note
        </button>
      </form>
      {notes.length > 0 && (
        <ul className="space-y-3">
          {notes.map((note) => (
            <li key={note.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="wrap-break-word whitespace-pre-wrap text-slate-800">{note.body}</p>
              <time dateTime={note.createdAt.toISOString()} className="mt-2 block text-xs text-slate-600">
                {dateTimeFormat.format(note.createdAt)}
              </time>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
