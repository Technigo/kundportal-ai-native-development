import { getDb } from "./client";
import { ticketNoteComments, ticketNotes, tickets } from "./schema";

const db = getDb();
const day = 24 * 60 * 60 * 1000;
const daysAgo = (n: number) => new Date(Date.now() - n * day);
const hoursAgo = (n: number) => new Date(Date.now() - n * 60 * 60 * 1000);

const [invoice, delivery] = await db.insert(tickets).values([
  { requesterName: "Anna Berg", requesterEmail: "anna.berg@example.com", subject: "Invoice shows the wrong VAT rate", description: "Invoice 2026-0912 uses 25% instead of 12%.", category: "Billing", status: "open", priority: "high", createdAt: daysAgo(1) },
  { requesterName: "Erik Lindqvist", requesterEmail: "erik.lindqvist@example.com", subject: "Change delivery address", description: "Please ship future orders to our new office.", category: "Delivery", status: "in_progress", priority: "normal", createdAt: daysAgo(4) },
  { requesterName: "Maja Ek", subject: "Add a second user to our account", description: "Our accountant needs read access. Reported by phone.", category: "Account", status: "closed", priority: "low", createdAt: daysAgo(12) },
]).returning();

const [vatNote, , addressNote] = await db.insert(ticketNotes).values([
  { ticketId: invoice!.id, body: "Checked the invoice: the VAT rate comes from the old price list.\nAsked finance to correct it.", createdAt: hoursAgo(20) },
  { ticketId: invoice!.id, body: "Customer called to ask for a status update.", createdAt: hoursAgo(5) },
  { ticketId: delivery!.id, body: "New address confirmed by phone.", createdAt: daysAgo(3) },
]).returning();

await db.insert(ticketNoteComments).values([
  { noteId: vatNote!.id, body: "Finance confirms the fix goes out on Monday.", createdAt: hoursAgo(18) },
  { noteId: vatNote!.id, body: "Told the customer. They are fine with waiting.", createdAt: hoursAgo(15) },
  { noteId: addressNote!.id, body: "Updated in the order system.", createdAt: daysAgo(2) },
]);

console.log("Seeded 3 tickets, 3 notes and 3 comments.");
