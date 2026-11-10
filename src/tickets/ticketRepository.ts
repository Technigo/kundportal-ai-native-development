import { asc, desc, eq, inArray } from "drizzle-orm";
import type { Db } from "@/db/client";
import {
  ticketNoteComments,
  ticketNotes,
  tickets,
  type Ticket,
  type TicketNote,
  type TicketNoteComment,
} from "@/db/schema";
import type { NewTicket } from "./ticketSchema";

// category may be left out: the database default General is used (decision 06).
export async function createTicket(db: Db, input: Omit<NewTicket, "category"> & { category?: string }): Promise<Ticket> {
  const [ticket] = await db.insert(tickets).values(input).returning();
  return ticket!;
}

export async function getTicket(db: Db, id: number): Promise<Ticket | undefined> {
  const [ticket] = await db.select().from(tickets).where(eq(tickets.id, id));
  return ticket;
}

export function listTickets(db: Db): Promise<Ticket[]> {
  return db.select().from(tickets).orderBy(desc(tickets.createdAt), desc(tickets.id));
}

export type NoteWithComments = TicketNote & { comments: TicketNoteComment[] };

// Foreign keys are not enforced (see the internal-notes spec), so the parent is checked here.
export async function addNote(db: Db, ticketId: number, body: string): Promise<TicketNote | undefined> {
  if (!(await getTicket(db, ticketId))) return undefined;
  const [note] = await db.insert(ticketNotes).values({ ticketId, body }).returning();
  return note;
}

export async function addNoteComment(db: Db, noteId: number, body: string): Promise<TicketNoteComment | undefined> {
  const [note] = await db.select({ id: ticketNotes.id }).from(ticketNotes).where(eq(ticketNotes.id, noteId));
  if (!note) return undefined;
  const [comment] = await db.insert(ticketNoteComments).values({ noteId, body }).returning();
  return comment;
}

export async function listNotesWithComments(db: Db, ticketId: number): Promise<NoteWithComments[]> {
  const notes = await db
    .select()
    .from(ticketNotes)
    .where(eq(ticketNotes.ticketId, ticketId))
    .orderBy(desc(ticketNotes.createdAt), desc(ticketNotes.id));
  if (notes.length === 0) return [];

  const comments = await db
    .select()
    .from(ticketNoteComments)
    .where(inArray(ticketNoteComments.noteId, notes.map((note) => note.id)))
    .orderBy(asc(ticketNoteComments.createdAt), asc(ticketNoteComments.id));

  return notes.map((note) => ({ ...note, comments: comments.filter((comment) => comment.noteId === note.id) }));
}

export async function deleteNote(db: Db, noteId: number): Promise<boolean> {
  return db.transaction(async (tx) => {
    await tx.delete(ticketNoteComments).where(eq(ticketNoteComments.noteId, noteId));
    const deleted = await tx.delete(ticketNotes).where(eq(ticketNotes.id, noteId)).returning({ id: ticketNotes.id });
    return deleted.length > 0;
  });
}

export async function deleteNoteComment(db: Db, commentId: number): Promise<boolean> {
  const deleted = await db
    .delete(ticketNoteComments)
    .where(eq(ticketNoteComments.id, commentId))
    .returning({ id: ticketNoteComments.id });
  return deleted.length > 0;
}
