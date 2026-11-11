"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/db/client";
import type { ChangeStatusState } from "@/tickets/changeStatusState";
import { parseTicketId } from "@/tickets/parseTicketId";
import { changeTicketStatus, createTicket, getTicket } from "@/tickets/ticketRepository";
import { newTicketSchema, ticketStatusSchema } from "@/tickets/ticketSchema";

type TicketFormValues = { requesterName: string; requesterEmail: string; subject: string; description: string; category: string; priority: string };

export type SubmitTicketState =
  | {
      errors: Partial<Record<keyof TicketFormValues, string[]>>;
      values: TicketFormValues;
    }
  | undefined;

export async function submitTicket(_prev: SubmitTicketState, formData: FormData): Promise<SubmitTicketState> {
  const values: TicketFormValues = {
    requesterName: String(formData.get("requesterName") ?? ""),
    requesterEmail: String(formData.get("requesterEmail") ?? ""),
    subject: String(formData.get("subject") ?? ""),
    description: String(formData.get("description") ?? ""),
    category: String(formData.get("category") ?? ""),
    priority: String(formData.get("priority") ?? ""),
  };

  const parsed = newTicketSchema.safeParse({ ...values, priority: values.priority || undefined });
  if (!parsed.success) {
    const { fieldErrors } = parsed.error.flatten();
    return { errors: fieldErrors, values };
  }

  await createTicket(getDb(), parsed.data);

  revalidatePath("/tickets");
  redirect("/tickets");
}

export async function changeStatus(_prev: ChangeStatusState, formData: FormData): Promise<ChangeStatusState> {
  // A missing ticket wins over an invalid status (see Decisions in docs/specs/status-change.md).
  const id = parseTicketId(String(formData.get("ticketId") ?? ""));
  if (id === undefined || !(await getTicket(getDb(), id))) redirect("/tickets?notice=ticket-not-found");

  const parsed = ticketStatusSchema.safeParse(formData.get("status"));
  if (!parsed.success) return { error: "Invalid status." };

  const result = await changeTicketStatus(getDb(), id, parsed.data);
  // The ticket can disappear between the check and the change.
  if (result === "not_found") redirect("/tickets?notice=ticket-not-found");
  if (result === "changed") {
    revalidatePath("/tickets");
    revalidatePath(`/tickets/${id}`);
  }
  return undefined;
}
