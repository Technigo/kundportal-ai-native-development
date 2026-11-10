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

export const ticketStatusChanges = sqliteTable(
  "ticket_status_changes",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    ticketId: integer("ticket_id")
      .notNull()
      .references(() => tickets.id),
    fromStatus: text("from_status", { enum: ticketStatuses }).notNull(),
    toStatus: text("to_status", { enum: ticketStatuses }).notNull(),
    changedAt: integer("changed_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch('subsec') * 1000)`),
  },
  (table) => [index("ticket_status_changes_ticket_idx").on(table.ticketId, table.changedAt)],
);

export type TicketStatusChange = typeof ticketStatusChanges.$inferSelect;
