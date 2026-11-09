// @vitest-environment node
import { beforeEach, describe, expect, it } from "vitest";
import type { Db } from "@/db/client";
import { tickets } from "@/db/schema";
import { createTestDb } from "@/test-utils/testDb";
import { createTicket, getTicket, listTickets } from "./ticketRepository";

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
      priority: "high",
    });

    expect(ticket).toMatchObject({
      requesterName: "Ada Lovelace",
      requesterEmail: "ada@example.com",
      subject: "Login fails",
      description: "I get a 500 error.",
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
      priority: "normal",
    });

    expect(ticket.requesterEmail).toBeNull();
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
