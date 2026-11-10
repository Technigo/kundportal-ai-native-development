// @vitest-environment node
import { beforeEach, describe, expect, it } from "vitest";
import type { Db } from "@/db/client";
import { ticketStatusChanges, tickets } from "@/db/schema";
import { createTestDb } from "@/test-utils/testDb";
import { changeTicketStatus, createTicket, getTicket, listStatusChanges, listTickets } from "./ticketRepository";

let db: Db;

beforeEach(async () => {
  db = await createTestDb();
});

describe("createTicket", () => {
  it("stores the ticket with its requester and status open", async () => {
    const ticket = await createTicket(db, {
      requesterName: "Ada Lovelace",
      requesterEmail: "ada@example.com",
      subject: "Login fails",
      description: "I get a 500 error.",
      category: "Billing",
      priority: "high",
    });

    expect(ticket).toMatchObject({
      requesterName: "Ada Lovelace",
      requesterEmail: "ada@example.com",
      subject: "Login fails",
      description: "I get a 500 error.",
      category: "Billing",
      priority: "high",
      status: "open",
    });
    expect(ticket.id).toBeTypeOf("number");
    expect(ticket.createdAt).toBeInstanceOf(Date);
  });

  it("stores a ticket without a requester email", async () => {
    const ticket = await createTicket(db, {
      requesterName: "Grace Hopper",
      subject: "Phone call",
      description: "Called about an invoice.",
      category: "Billing",
      priority: "normal",
    });

    expect(ticket.requesterEmail).toBeNull();
  });

  it("gives a ticket saved without a category the category General", async () => {
    await db.insert(tickets).values({ requesterName: "Ada", subject: "Old ticket", description: "Saved before categories" });

    const [saved] = await db.select().from(tickets);
    expect(saved?.category).toBe("General");
  });
});

describe("getTicket", () => {
  it("returns the ticket with the given id", async () => {
    const created = await createTicket(db, {
      requesterName: "Ada Lovelace",
      subject: "Login fails",
      description: "Line one.\nLine two.",
      priority: "normal",
    });
    await createTicket(db, {
      requesterName: "Grace Hopper",
      subject: "Other ticket",
      description: "d",
      priority: "low",
    });

    const ticket = await getTicket(db, created.id);

    expect(ticket).toMatchObject({
      id: created.id,
      requesterName: "Ada Lovelace",
      subject: "Login fails",
      description: "Line one.\nLine two.",
    });
  });

  it("returns undefined when the ticket does not exist", async () => {
    expect(await getTicket(db, 999)).toBeUndefined();
  });
});

describe("listTickets", () => {
  it("returns all tickets, newest first", async () => {
    await db.insert(tickets).values([
      { requesterName: "Ada", subject: "Oldest", description: "d", createdAt: new Date("2026-01-01") },
      { requesterName: "Grace", subject: "Newest", description: "d", createdAt: new Date("2026-01-03") },
      { requesterName: "Ada", subject: "Middle", description: "d", createdAt: new Date("2026-01-02") },
    ]);

    const result = await listTickets(db);

    expect(result.map((t) => t.subject)).toEqual(["Newest", "Middle", "Oldest"]);
  });

  it("returns an empty list when there are no tickets", async () => {
    expect(await listTickets(db)).toEqual([]);
  });
});

describe("changeTicketStatus and listStatusChanges", () => {
  const newTicket = (subject: string) =>
    createTicket(db, { requesterName: "Ada Lovelace", subject, description: "d", category: "General", priority: "normal" });

  it("stores the previous status, the new status and a timestamp for a change", async () => {
    const ticket = await newTicket("Login fails");
    await changeTicketStatus(db, ticket.id, "in_progress");

    expect(await listStatusChanges(db, ticket.id)).toEqual([
      expect.objectContaining({ ticketId: ticket.id, fromStatus: "open", toStatus: "in_progress", changedAt: expect.any(Date) }),
    ]);
  });

  it("lists the changes newest first", async () => {
    const ticket = await newTicket("Login fails");
    await changeTicketStatus(db, ticket.id, "in_progress");
    await changeTicketStatus(db, ticket.id, "closed");

    const changes = await listStatusChanges(db, ticket.id);
    expect(changes.map((c) => [c.fromStatus, c.toStatus])).toEqual([
      ["in_progress", "closed"],
      ["open", "in_progress"],
    ]);
  });

  it("lists the latest saved change first when two changes have the same timestamp", async () => {
    const ticket = await newTicket("Login fails");
    const changedAt = new Date("2026-11-09T10:00:00.000Z");
    await db.insert(ticketStatusChanges).values([
      { ticketId: ticket.id, fromStatus: "open", toStatus: "in_progress", changedAt },
      { ticketId: ticket.id, fromStatus: "in_progress", toStatus: "closed", changedAt },
    ]);

    const changes = await listStatusChanges(db, ticket.id);
    expect(changes.map((c) => [c.fromStatus, c.toStatus])).toEqual([
      ["in_progress", "closed"],
      ["open", "in_progress"],
    ]);
  });

  it("lists only the changes of the given ticket", async () => {
    const first = await newTicket("First");
    const second = await newTicket("Second");
    await changeTicketStatus(db, first.id, "in_progress");
    await changeTicketStatus(db, second.id, "closed");

    expect(await listStatusChanges(db, first.id)).toEqual([
      expect.objectContaining({ ticketId: first.id, toStatus: "in_progress" }),
    ]);
  });

  it("returns an empty history for a new ticket", async () => {
    const ticket = await newTicket("Login fails");
    expect(await listStatusChanges(db, ticket.id)).toEqual([]);
  });

  it("returns not_found and saves nothing when the ticket does not exist", async () => {
    expect(await changeTicketStatus(db, 999, "closed")).toBe("not_found");
    expect(await db.select().from(ticketStatusChanges)).toEqual([]);
  });

  it("ignores a change to the status the ticket already has", async () => {
    const ticket = await newTicket("Login fails");
    await changeTicketStatus(db, ticket.id, "in_progress");

    expect(await changeTicketStatus(db, ticket.id, "in_progress")).toBe("unchanged");
    expect((await getTicket(db, ticket.id))?.status).toBe("in_progress");
    expect(await listStatusChanges(db, ticket.id)).toHaveLength(1);
  });
});
