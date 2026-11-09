import { z } from "zod";

export const ticketStatuses = ["open", "in_progress", "closed"] as const;
export const ticketPriorities = ["low", "normal", "high"] as const;

export type TicketStatus = (typeof ticketStatuses)[number];
export type TicketPriority = (typeof ticketPriorities)[number];

export const newTicketSchema = z.object({
  requesterName: z
    .string()
    .trim()
    .min(1, "Please enter who contacted us.")
    .max(120, "Name must be at most 120 characters."),
  requesterEmail: z
    .string()
    .trim()
    .max(254, "Email must be at most 254 characters.")
    .pipe(z.union([z.literal(""), z.email("Please enter a valid email address.")]))
    .transform((email) => email || undefined)
    .optional(),
  subject: z
    .string()
    .trim()
    .min(3, "Subject must be at least 3 characters.")
    .max(120, "Subject must be at most 120 characters."),
  description: z
    .string()
    .trim()
    .min(1, "Please describe the problem.")
    .max(5000, "Description must be at most 5000 characters."),
  priority: z.enum(ticketPriorities).default("normal"),
});

export type NewTicket = z.infer<typeof newTicketSchema>;

export const statusChangeSchema = z.object({
  ticketId: z.number().int().positive(),
  status: z.enum(ticketStatuses, { error: "Invalid status." }),
});

export type StatusChange = z.infer<typeof statusChangeSchema>;
