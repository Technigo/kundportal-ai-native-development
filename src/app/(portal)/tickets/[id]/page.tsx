import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache, Suspense } from "react";
import { InternalNotes } from "@/components/InternalNotes";
import { TicketDetails } from "@/components/TicketDetails";
import { getDb } from "@/db/client";
import { parseTicketId } from "@/tickets/parseTicketId";
import { getTicket, listNotesWithComments } from "@/tickets/ticketRepository";
import { addNote, addNoteComment } from "../actions";

const loadTicket = cache(async (rawId: string) => {
  // Ticket data is per request: render it at request time, never at build time.
  await connection();
  const id = parseTicketId(rawId);
  return id === undefined ? undefined : await getTicket(getDb(), id);
});

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const ticket = await loadTicket((await params).id);
  return { title: ticket?.subject ?? "Ticket" };
}

async function SelectedTicket({ params }: { params: Promise<{ id: string }> }) {
  const ticket = await loadTicket((await params).id);
  if (!ticket) redirect("/tickets?notice=ticket-not-found");
  const notes = await listNotesWithComments(getDb(), ticket.id);
  return (
    <TicketDetails ticket={ticket}>
      <InternalNotes ticketId={ticket.id} notes={notes} addNote={addNote} addNoteComment={addNoteComment} />
    </TicketDetails>
  );
}

export default function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="text-slate-600">Loading ticket…</p>}>
      <SelectedTicket params={params} />
    </Suspense>
  );
}
