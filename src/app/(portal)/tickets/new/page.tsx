import type { Metadata } from "next";
import { TicketForm } from "@/components/TicketForm";
import { submitTicket } from "../actions";

export const metadata: Metadata = { title: "New ticket" };

export default function NewTicketPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">New ticket</h1>
      <TicketForm action={submitTicket} />
    </div>
  );
}
