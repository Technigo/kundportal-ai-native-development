import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache, Suspense } from "react";
import { z } from "zod";
import { TicketDetails } from "@/components/TicketDetails";
import { getDb } from "@/db/client";
import { getTicket } from "@/tickets/ticketRepository";

const loadTicket = cache(async (rawId: string) => {
  // Ticket data is per request: render it at request time, never at build time.
  await connection();
  const parsed = z.coerce.number().int().positive().safeParse(rawId);
  return parsed.success ? await getTicket(getDb(), parsed.data) : undefined;
});

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const ticket = await loadTicket((await params).id);
  return { title: ticket?.subject ?? "Ticket" };
}

async function SelectedTicket({ params }: { params: Promise<{ id: string }> }) {
  const ticket = await loadTicket((await params).id);
  if (!ticket) redirect("/tickets?notice=ticket-not-found");
  return <TicketDetails ticket={ticket} />;
}

export default function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="text-slate-600">Loading ticket…</p>}>
      <SelectedTicket params={params} />
    </Suspense>
  );
}
