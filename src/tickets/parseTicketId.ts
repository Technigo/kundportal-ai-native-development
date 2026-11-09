import { z } from "zod";

// Strict: plain positive decimal digits only. No leading zeros, signs, spaces, decimals or exponents.
const ticketId = z
  .string()
  .regex(/^[1-9]\d*$/)
  .transform(Number)
  .pipe(z.number().int().safe());

export function parseTicketId(raw: string): number | undefined {
  const parsed = ticketId.safeParse(raw);
  return parsed.success ? parsed.data : undefined;
}
