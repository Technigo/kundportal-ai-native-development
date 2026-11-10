import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { ticketPriorities, ticketStatuses } from "@/tickets/ticketSchema";

const createdAt = () =>
  integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch('subsec') * 1000)`);

export const tickets = sqliteTable(
  "tickets",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    requesterName: text("requester_name").notNull(),
    requesterEmail: text("requester_email"),
    subject: text("subject").notNull(),
    description: text("description").notNull(),
    category: text("category").notNull().default("General"),
    status: text("status", { enum: ticketStatuses }).notNull().default("open"),
    priority: text("priority", { enum: ticketPriorities }).notNull().default("normal"),
    createdAt: createdAt(),
  },
  (table) => [index("tickets_created_idx").on(table.createdAt)],
);

export type Ticket = typeof tickets.$inferSelect;

export const ticketNotes = sqliteTable(
  "ticket_notes",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    ticketId: integer("ticket_id")
      .notNull()
      .references(() => tickets.id),
    body: text("body").notNull(),
    createdAt: createdAt(),
  },
  (table) => [index("ticket_notes_ticket_created_idx").on(table.ticketId, table.createdAt)],
);

export const ticketNoteComments = sqliteTable(
  "ticket_note_comments",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    noteId: integer("note_id")
      .notNull()
      .references(() => ticketNotes.id),
    body: text("body").notNull(),
    createdAt: createdAt(),
  },
  (table) => [index("ticket_note_comments_note_created_idx").on(table.noteId, table.createdAt)],
);

export type TicketNote = typeof ticketNotes.$inferSelect;
export type TicketNoteComment = typeof ticketNoteComments.$inferSelect;
