import { desc, eq } from "drizzle-orm";
import type { Db } from "@/db/client";
import { tickets, type Ticket } from "@/db/schema";
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
