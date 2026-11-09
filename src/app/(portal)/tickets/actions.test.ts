// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Db } from "@/db/client";
import { ticketStatusChanges, tickets } from "@/db/schema";
import { createTestDb } from "@/test-utils/testDb";
import { changeTicketStatus, createTicket, getTicket, listStatusChanges } from "@/tickets/ticketRepository";
import { changeStatus, submitTicket } from "./actions";

const mocks = vi.hoisted(() => ({
  db: undefined as unknown,
  revalidatePath: vi.fn(),
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/db/client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/db/client")>()),
  getDb: () => mocks.db,
}));

function formData(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

let db: Db;

beforeEach(async () => {
  vi.clearAllMocks();
  db = await createTestDb();
  mocks.db = db;
});

describe("submitTicket", () => {
  it("returns field errors and the submitted values when input is invalid, and saves nothing", async () => {
    const state = await submitTicket(undefined, formData({ requesterName: "Ada", subject: "", description: "Help", priority: "low" }));

    expect(state?.errors?.subject).toBeDefined();
    expect(state?.values).toEqual({
      requesterName: "Ada",
      requesterEmail: "",
      subject: "",
      description: "Help",
      priority: "low",
    });
    expect(await db.select().from(tickets)).toHaveLength(0);
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("saves a valid ticket with its requester, revalidates the list and redirects to it", async () => {
    await expect(
      submitTicket(undefined, formData({
        requesterName: "Ada Lovelace",
        requesterEmail: "ada@example.com",
        subject: "Broken invoice",
        description: "Totals are wrong",
        priority: "high",
      })),
    ).rejects.toThrow("NEXT_REDIRECT:/tickets");

    const saved = await db.select().from(tickets);
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({
      requesterName: "Ada Lovelace",
      requesterEmail: "ada@example.com",
      subject: "Broken invoice",
      priority: "high",
      status: "open",
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/tickets");
  });

  it("returns an error for an invalid requester email and saves nothing", async () => {
    const state = await submitTicket(
      undefined,
      formData({ requesterName: "Ada", requesterEmail: "not-an-email", subject: "Hello", description: "Body" }),
    );

    expect(state?.errors?.requesterEmail).toBeDefined();
    expect(await db.select().from(tickets)).toHaveLength(0);
  });

  it("saves a ticket without a requester email", async () => {
    await expect(
      submitTicket(undefined, formData({ requesterName: "Grace", subject: "Phone call", description: "Invoice query" })),
    ).rejects.toThrow("NEXT_REDIRECT");

    const [saved] = await db.select().from(tickets);
    expect(saved).toMatchObject({ requesterName: "Grace", requesterEmail: null });
  });

  it("ignores a status sent in the form", async () => {
    await expect(
      submitTicket(undefined, formData({ requesterName: "Ada", subject: "Spoof", description: "x", status: "closed" })),
    ).rejects.toThrow("NEXT_REDIRECT");

    const [saved] = await db.select().from(tickets);
    expect(saved).toMatchObject({ status: "open" });
  });
});

describe("changeStatus", () => {
  const notFound = "NEXT_REDIRECT:/tickets?notice=ticket-not-found";
  let existingId: number;

  beforeEach(async () => {
    const ticket = await createTicket(db, { requesterName: "Ada Lovelace", subject: "Login fails", description: "d", priority: "normal" });
    existingId = ticket.id;
  });

  it("redirects to the list with a notice and changes nothing when the ticket does not exist", async () => {
    await expect(changeStatus(undefined, formData({ ticketId: "999", status: "closed" }))).rejects.toThrow(notFound);

    expect((await getTicket(db, existingId))?.status).toBe("open");
    expect(await db.select().from(ticketStatusChanges)).toEqual([]);
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it.each(["abc", "0", "01", ""])("treats the malformed ticket id %j as a missing ticket", async (ticketId) => {
    await expect(changeStatus(undefined, formData({ ticketId, status: "closed" }))).rejects.toThrow(notFound);

    expect((await getTicket(db, existingId))?.status).toBe("open");
    expect(await db.select().from(ticketStatusChanges)).toEqual([]);
  });

  it("redirects for a missing ticket even when the status is also invalid", async () => {
    await expect(changeStatus(undefined, formData({ ticketId: "999", status: "resolved" }))).rejects.toThrow(notFound);
    expect(mocks.redirect).toHaveBeenCalledWith("/tickets?notice=ticket-not-found");
  });

  it.each(["resolved", ""])('returns "Invalid status." for the status %j and changes nothing', async (status) => {
    const state = await changeStatus(undefined, formData({ ticketId: String(existingId), status }));

    expect(state).toEqual({ error: "Invalid status." });
    expect((await getTicket(db, existingId))?.status).toBe("open");
    expect(await db.select().from(ticketStatusChanges)).toEqual([]);
    expect(mocks.redirect).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("saves the new status and revalidates the list and the detail page", async () => {
    const state = await changeStatus(undefined, formData({ ticketId: String(existingId), status: "in_progress" }));

    expect(state).toBeUndefined();
    expect((await getTicket(db, existingId))?.status).toBe("in_progress");
    expect(await listStatusChanges(db, existingId)).toHaveLength(1);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/tickets");
    expect(mocks.revalidatePath).toHaveBeenCalledWith(`/tickets/${existingId}`);
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it.each([
    ["open", "closed"],
    ["closed", "in_progress"],
    ["in_progress", "open"],
  ] as const)("changes the status from %s to %s", async (from, to) => {
    if (from !== "open") await changeTicketStatus(db, existingId, from);

    await changeStatus(undefined, formData({ ticketId: String(existingId), status: to }));

    expect((await getTicket(db, existingId))?.status).toBe(to);
    expect(mocks.revalidatePath).toHaveBeenCalledWith(`/tickets/${existingId}`);
  });

  it("ignores a change to the same status without an error or a revalidation", async () => {
    await changeTicketStatus(db, existingId, "in_progress");

    const state = await changeStatus(undefined, formData({ ticketId: String(existingId), status: "in_progress" }));

    expect(state).toBeUndefined();
    expect((await getTicket(db, existingId))?.status).toBe("in_progress");
    expect(await listStatusChanges(db, existingId)).toHaveLength(1);
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
    expect(mocks.redirect).not.toHaveBeenCalled();
  });
});
