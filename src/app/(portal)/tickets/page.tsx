import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { TicketList } from "@/components/TicketList";
import { TicketNotice } from "@/components/TicketNotice";
import { getDb } from "@/db/client";
import { listTickets } from "@/tickets/ticketRepository";

export const metadata: Metadata = { title: "Tickets" };

async function AllTickets() {
  // Ticket data is per request: render it at request time, never at build time.
  await connection();
  const tickets = await listTickets(getDb());
  return <TicketList tickets={tickets} />;
}

async function Notice({ searchParams }: { searchParams: Promise<{ notice?: string | string[] }> }) {
  const { notice } = await searchParams;
  return <TicketNotice notice={typeof notice === "string" ? notice : undefined} />;
}

export default function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string | string[] }>;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Tickets</h1>
        <Link
          href="/tickets/new"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          New ticket
        </Link>
      </div>
      <Suspense>
        <Notice searchParams={searchParams} />
      </Suspense>
      <Suspense fallback={<p className="text-slate-600">Loading tickets…</p>}>
        <AllTickets />
      </Suspense>
    </div>
  );
}
