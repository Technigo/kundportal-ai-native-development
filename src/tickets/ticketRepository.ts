import { desc, eq } from "drizzle-orm";
import type { Db } from "@/db/client";
import { ticketStatusChanges, tickets, type Ticket, type TicketStatusChange } from "@/db/schema";
import type { NewTicket, TicketStatus } from "./ticketSchema";

type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

export async function createTicket(db: Db, input: NewTicket): Promise<Ticket> {
  const [ticket] = await db.insert(tickets).values(input).returning();
  return ticket!;
}

export async function getTicket(db: Db | Tx, id: number): Promise<Ticket | undefined> {
  const [ticket] = await db.select().from(tickets).where(eq(tickets.id, id));
  return ticket;
}

export function listTickets(db: Db): Promise<Ticket[]> {
  return db.select().from(tickets).orderBy(desc(tickets.createdAt), desc(tickets.id));
}

export function changeTicketStatus(db: Db, id: number, to: TicketStatus): Promise<"changed" | "unchanged" | "not_found"> {
  return db.transaction(async (tx) => {
    const ticket = await getTicket(tx, id);
    if (!ticket) return "not_found";
    if (ticket.status === to) return "unchanged";
    await tx.update(tickets).set({ status: to }).where(eq(tickets.id, id));
    await tx.insert(ticketStatusChanges).values({ ticketId: id, fromStatus: ticket.status, toStatus: to });
    return "changed";
  });
}

export function listStatusChanges(db: Db, ticketId: number): Promise<TicketStatusChange[]> {
  return db
    .select()
    .from(ticketStatusChanges)
    .where(eq(ticketStatusChanges.ticketId, ticketId))
    .orderBy(desc(ticketStatusChanges.changedAt), desc(ticketStatusChanges.id));
}
