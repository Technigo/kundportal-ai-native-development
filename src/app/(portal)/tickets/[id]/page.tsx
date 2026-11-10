import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache, Suspense } from "react";
import { TicketDetails } from "@/components/TicketDetails";
import { getDb } from "@/db/client";
import { parseTicketId } from "@/tickets/parseTicketId";
import { getTicket, listStatusChanges } from "@/tickets/ticketRepository";
import { changeStatus } from "../actions";

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
  const changes = await listStatusChanges(getDb(), ticket.id);
  return <TicketDetails ticket={ticket} changes={changes} statusAction={changeStatus} />;
}

export default function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="text-slate-600">Loading ticket…</p>}>
      <SelectedTicket params={params} />
    </Suspense>
  );
}
