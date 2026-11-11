"use client";

import { useActionState, useState } from "react";
import type { NoteActionState } from "@/app/(portal)/tickets/actions";
import type { TicketNoteComment } from "@/db/schema";
import type { NoteWithComments } from "@/tickets/ticketRepository";

type Action = (state: NoteActionState, formData: FormData) => Promise<NoteActionState>;

type InternalNotesProps = {
  ticketId: number;
  notes: NoteWithComments[];
  addNote: Action;
  addNoteComment: Action;
  deleteNote: Action;
  deleteNoteComment: Action;
};

const dateTimeFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" });

const textareaClass =
  "block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/30 aria-invalid:border-red-600";
const buttonClass =
  "rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-60";

export function InternalNotes({ ticketId, notes, addNote, addNoteComment, deleteNote, deleteNoteComment }: InternalNotesProps) {
  const [alert, setAlert] = useState<string>();
  // Four actions write to one alert area: a new alert replaces the old one, a save clears it.
  const withAlert =
    (action: Action): Action =>
    async (prev, formData) => {
      const next = await action(prev, formData);
      setAlert(next?.alert);
      return next;
    };
  const [state, formAction, pending] = useActionState(withAlert(addNote), undefined);

  return (
    <section aria-labelledby="internal-notes-heading" className="space-y-4">
      <h2 id="internal-notes-heading" className="text-lg font-semibold">
        Internal notes
      </h2>
      <div role="alert" className="text-sm text-red-700">
        {alert}
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
          className={textareaClass}
        />
        {state?.error && (
          <p id="note-body-error" className="text-sm text-red-700">
            {state.error}
          </p>
        )}
        <button type="submit" disabled={pending} className={buttonClass}>
          Add note
        </button>
      </form>
      {notes.length > 0 && (
        <ul className="space-y-3">
          {notes.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              addComment={withAlert(addNoteComment)}
              deleteNote={withAlert(deleteNote)}
              deleteComment={withAlert(deleteNoteComment)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function NoteItem({ note, addComment, deleteNote, deleteComment }: { note: NoteWithComments; addComment: Action; deleteNote: Action; deleteComment: Action }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(addComment, undefined);

  return (
    <li className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="wrap-break-word whitespace-pre-wrap text-slate-800">{note.body}</p>
      <time dateTime={note.createdAt.toISOString()} className="mt-2 block text-xs text-slate-600">
        {dateTimeFormat.format(note.createdAt)}
      </time>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="mt-2 inline-flex cursor-pointer items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm font-medium text-slate-800 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        <span aria-hidden="true">{open ? "▾" : "▸"}</span>
        Comments ({note.comments.length})
      </button>
      <DeleteControl
        action={deleteNote}
        field="noteId"
        id={note.id}
        label="Delete note"
        warning={commentWarning(note.comments.length)}
      />
      {open && (
        <div className="mt-2 space-y-2">
          {note.comments.length > 0 && (
            <ul className="space-y-2">
              {note.comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} deleteComment={deleteComment} />
              ))}
            </ul>
          )}
          <form key={JSON.stringify(state)} action={formAction} noValidate className="space-y-2">
            <input type="hidden" name="noteId" value={note.id} />
            <label htmlFor={`comment-body-${note.id}`} className="block text-sm font-medium text-slate-800">
              Comment
            </label>
            <textarea
              id={`comment-body-${note.id}`}
              name="body"
              maxLength={500}
              rows={2}
              defaultValue={state?.value}
              aria-invalid={state?.error ? true : undefined}
              aria-describedby={state?.error ? `comment-body-${note.id}-error` : undefined}
              className={textareaClass}
            />
            {state?.error && (
              <p id={`comment-body-${note.id}-error`} className="text-sm text-red-700">
                {state.error}
              </p>
            )}
            <button type="submit" disabled={pending} className={buttonClass}>
              Add comment
            </button>
          </form>
        </div>
      )}
    </li>
  );
}

function CommentItem({ comment, deleteComment }: { comment: TicketNoteComment; deleteComment: Action }) {
  return (
    <li className="rounded-md bg-slate-50 p-3">
      <p className="wrap-break-word whitespace-pre-wrap text-slate-800">{comment.body}</p>
      <time dateTime={comment.createdAt.toISOString()} className="mt-1 block text-xs text-slate-600">
        {dateTimeFormat.format(comment.createdAt)}
      </time>
      <DeleteControl action={deleteComment} field="commentId" id={comment.id} label="Delete comment" />
    </li>
  );
}

function commentWarning(count: number) {
  if (count === 0) return undefined;
  return count === 1 ? "This also deletes 1 comment." : `This also deletes ${count} comments.`;
}

// Two steps, because a delete cannot be undone. Each control keeps its own state.
function DeleteControl({ action, field, id, label, warning }: { action: Action; field: "noteId" | "commentId"; id: number; label: string; warning?: string }) {
  const [confirming, setConfirming] = useState(false);
  const [, formAction, pending] = useActionState(action, undefined);

  if (!confirming) {
    return (
      <button
        type="button"
        aria-label={label}
        onClick={() => setConfirming(true)}
        className="mt-2 ml-2 inline-flex cursor-pointer items-center rounded-md border border-red-300 bg-white px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
      >
        Delete
      </button>
    );
  }
  return (
    <form action={formAction} className="mt-2 flex flex-wrap items-center gap-2 text-sm">
      <input type="hidden" name={field} value={id} />
      {warning && <p className="text-red-700">{warning}</p>}
      <button
        type="submit"
        disabled={pending}
        className="cursor-pointer rounded-md bg-red-700 px-3 py-1 font-medium text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
      >
        Confirm delete
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="cursor-pointer rounded-md border border-slate-300 bg-white px-3 py-1 font-medium text-slate-800 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        Cancel
      </button>
    </form>
  );
}
