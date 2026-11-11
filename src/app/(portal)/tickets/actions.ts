"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/db/client";
import { parseTicketId } from "@/tickets/parseTicketId";
import {
  addNote as saveNote,
  addNoteComment as saveComment,
  createTicket,
  deleteNote as removeNote,
  deleteNoteComment as removeComment,
  getCommentTicketId,
  getNoteTicketId,
  getTicket,
} from "@/tickets/ticketRepository";
import { newNoteCommentSchema, newNoteSchema, newTicketSchema } from "@/tickets/ticketSchema";

type TicketFormValues = { requesterName: string; requesterEmail: string; subject: string; description: string; category: string; priority: string };

export type SubmitTicketState =
  | {
      errors: Partial<Record<keyof TicketFormValues, string[]>>;
      values: TicketFormValues;
      formError?: string;
    }
  | undefined;

// Only the error type is logged: Drizzle's message contains the entered values.
function errorSummary(error: unknown) {
  const cause = error instanceof Error ? error.cause : undefined;
  const code = (cause as { code?: unknown } | undefined)?.code;
  return {
    name: error instanceof Error ? error.name : typeof error,
    cause: cause instanceof Error ? cause.name : undefined,
    code: typeof code === "string" && code ? code : undefined,
  };
}

export async function submitTicket(_prev: SubmitTicketState, formData: FormData): Promise<SubmitTicketState> {
  const values: TicketFormValues = {
    requesterName: String(formData.get("requesterName") ?? ""),
    requesterEmail: String(formData.get("requesterEmail") ?? ""),
    subject: String(formData.get("subject") ?? ""),
    description: String(formData.get("description") ?? ""),
    category: String(formData.get("category") ?? ""),
    priority: String(formData.get("priority") ?? ""),
  };

  const parsed = newTicketSchema.safeParse({ ...values, priority: values.priority || undefined });
  if (!parsed.success) {
    const { fieldErrors } = parsed.error.flatten();
    return { errors: fieldErrors, values };
  }

  try {
    await createTicket(getDb(), parsed.data);
  } catch (error) {
    console.error("Failed to save ticket", errorSummary(error));
    return { errors: {}, values, formError: "Could not save the ticket to the database. Please try again." };
  }

  revalidatePath("/tickets");
  redirect("/tickets");
}

export type NoteActionState = { value?: string; error?: string; alert?: string; saved?: boolean } | undefined;

const ticketGone = "This ticket no longer exists. Go back to the ticket list.";
const noteGone = "This note no longer exists.";
const commentGone = "This comment no longer exists.";

// The note or comment is gone, so there is no ticket id: refresh every ticket page (AC6.5, AC6.9).
function gone(alert: string, value?: string): NoteActionState {
  revalidatePath("/tickets/[id]", "page");
  return value === undefined ? { alert } : { value, alert };
}

export async function addNote(_prev: NoteActionState, formData: FormData): Promise<NoteActionState> {
  const value = String(formData.get("body") ?? "");
  const ticketId = parseTicketId(String(formData.get("ticketId") ?? ""));
  const db = getDb();
  if (ticketId === undefined || !(await getTicket(db, ticketId))) return { value, alert: ticketGone };

  const parsed = newNoteSchema.safeParse({ body: value });
  if (!parsed.success) return { value, error: parsed.error.issues[0]!.message };

  if (!(await saveNote(db, ticketId, parsed.data.body))) return { value, alert: ticketGone };
  revalidatePath(`/tickets/${ticketId}`);
  return { value: "", saved: true };
}

export async function addNoteComment(_prev: NoteActionState, formData: FormData): Promise<NoteActionState> {
  const value = String(formData.get("body") ?? "");
  const noteId = parseTicketId(String(formData.get("noteId") ?? ""));
  const db = getDb();
  const ticketId = noteId === undefined ? undefined : await getNoteTicketId(db, noteId);
  if (noteId === undefined || ticketId === undefined) return gone(noteGone, value);

  const parsed = newNoteCommentSchema.safeParse({ body: value });
  if (!parsed.success) return { value, error: parsed.error.issues[0]!.message };

  if (!(await saveComment(db, noteId, parsed.data.body))) return gone(noteGone, value);
  revalidatePath(`/tickets/${ticketId}`);
  return { value: "", saved: true };
}

export async function deleteNote(_prev: NoteActionState, formData: FormData): Promise<NoteActionState> {
  const noteId = parseTicketId(String(formData.get("noteId") ?? ""));
  const db = getDb();
  const ticketId = noteId === undefined ? undefined : await getNoteTicketId(db, noteId);
  if (noteId === undefined || ticketId === undefined || !(await removeNote(db, noteId))) return gone(noteGone);

  revalidatePath(`/tickets/${ticketId}`);
  return {};
}

export async function deleteNoteComment(_prev: NoteActionState, formData: FormData): Promise<NoteActionState> {
  const commentId = parseTicketId(String(formData.get("commentId") ?? ""));
  const db = getDb();
  const ticketId = commentId === undefined ? undefined : await getCommentTicketId(db, commentId);
  if (commentId === undefined || ticketId === undefined || !(await removeComment(db, commentId))) return gone(commentGone);

  revalidatePath(`/tickets/${ticketId}`);
  return {};
}
