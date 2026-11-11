"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/db/client";
import { createTicket } from "@/tickets/ticketRepository";
import { newTicketSchema } from "@/tickets/ticketSchema";

type TicketFormValues = { requesterName: string; requesterEmail: string; subject: string; description: string; category: string; priority: string };

export type SubmitTicketState =
  | {
      errors: Partial<Record<keyof TicketFormValues, string[]>>;
      values: TicketFormValues;
      formError?: string;
    }
  | undefined;

// Only the error type is logged: Drizzle's message contains the entered values.
function errorSummary(error: unknown) {
  const cause = error instanceof Error ? error.cause : undefined;
  const code = (cause as { code?: unknown } | undefined)?.code;
  return {
    name: error instanceof Error ? error.name : typeof error,
    cause: cause instanceof Error ? cause.name : undefined,
    code: typeof code === "string" && code ? code : undefined,
  };
}

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

  try {
    await createTicket(getDb(), parsed.data);
  } catch (error) {
    console.error("Failed to save ticket", errorSummary(error));
    return { errors: {}, values, formError: "Could not save the ticket to the database. Please try again." };
  }

  revalidatePath("/tickets");
  redirect("/tickets");
}
