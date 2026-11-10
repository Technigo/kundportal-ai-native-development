// @vitest-environment node
import { beforeEach, describe, expect, it } from "vitest";
import type { Db } from "@/db/client";
import { ticketNoteComments, ticketNotes, tickets } from "@/db/schema";
import { createTestDb } from "@/test-utils/testDb";
import {
  addNote,
  addNoteComment,
  createTicket,
  getTicket,
  listNotesWithComments,
  listTickets,
} from "./ticketRepository";

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

async function insertTicket() {
  return createTicket(db, { requesterName: "Ada", subject: "Subject", description: "d", priority: "normal" });
}

describe("addNote", () => {
  it("stores a note for an existing ticket and returns it", async () => {
    const ticket = await insertTicket();

    const note = await addNote(db, ticket.id, "Called the customer.");

    expect(note).toMatchObject({ ticketId: ticket.id, body: "Called the customer." });
    expect(note?.id).toBeTypeOf("number");
    expect(note?.createdAt).toBeInstanceOf(Date);
    expect(await db.select().from(ticketNotes)).toHaveLength(1);
  });

  it("saves two notes with the same text", async () => {
    const ticket = await insertTicket();

    const first = await addNote(db, ticket.id, "Same text");
    const second = await addNote(db, ticket.id, "Same text");

    expect(first?.id).not.toBe(second?.id);
    expect(await db.select().from(ticketNotes)).toHaveLength(2);
  });

  it("returns undefined and saves nothing when the ticket does not exist", async () => {
    expect(await addNote(db, 999, "Orphan")).toBeUndefined();
    expect(await db.select().from(ticketNotes)).toEqual([]);
  });
});

describe("addNoteComment", () => {
  it("stores a comment for an existing note and returns it", async () => {
    const ticket = await insertTicket();
    const note = await addNote(db, ticket.id, "Note");

    const comment = await addNoteComment(db, note!.id, "Reply");

    expect(comment).toMatchObject({ noteId: note!.id, body: "Reply" });
    expect(comment?.id).toBeTypeOf("number");
    expect(comment?.createdAt).toBeInstanceOf(Date);
  });

  it("keeps a comment under its own note only", async () => {
    const ticket = await insertTicket();
    const noteA = await addNote(db, ticket.id, "A");
    const noteB = await addNote(db, ticket.id, "B");

    await addNoteComment(db, noteA!.id, "For A");

    const notes = await listNotesWithComments(db, ticket.id);
    expect(notes.find((n) => n.id === noteA!.id)?.comments.map((c) => c.body)).toEqual(["For A"]);
    expect(notes.find((n) => n.id === noteB!.id)?.comments).toEqual([]);
  });

  it("returns undefined and saves nothing when the note does not exist", async () => {
    expect(await addNoteComment(db, 999, "Orphan")).toBeUndefined();
    expect(await db.select().from(ticketNoteComments)).toEqual([]);
  });
});

describe("listNotesWithComments", () => {
  it("returns notes newest first", async () => {
    const ticket = await insertTicket();
    await db.insert(ticketNotes).values([
      { ticketId: ticket.id, body: "Oldest", createdAt: new Date("2026-01-01") },
      { ticketId: ticket.id, body: "Newest", createdAt: new Date("2026-01-03") },
      { ticketId: ticket.id, body: "Middle", createdAt: new Date("2026-01-02") },
    ]);

    const notes = await listNotesWithComments(db, ticket.id);

    expect(notes.map((n) => n.body)).toEqual(["Newest", "Middle", "Oldest"]);
  });

  it("puts the note with the higher id first when the times are equal", async () => {
    const ticket = await insertTicket();
    const sameTime = new Date("2026-01-01");
    await db.insert(ticketNotes).values([
      { ticketId: ticket.id, body: "First saved", createdAt: sameTime },
      { ticketId: ticket.id, body: "Second saved", createdAt: sameTime },
    ]);

    const notes = await listNotesWithComments(db, ticket.id);

    expect(notes.map((n) => n.body)).toEqual(["Second saved", "First saved"]);
  });

  it("returns comments oldest first, and the lower id first when the times are equal", async () => {
    const ticket = await insertTicket();
    const note = await addNote(db, ticket.id, "Note");
    const sameTime = new Date("2026-01-02");
    await db.insert(ticketNoteComments).values([
      { noteId: note!.id, body: "Latest", createdAt: new Date("2026-01-03") },
      { noteId: note!.id, body: "Tie, first saved", createdAt: sameTime },
      { noteId: note!.id, body: "Tie, second saved", createdAt: sameTime },
      { noteId: note!.id, body: "Earliest", createdAt: new Date("2026-01-01") },
    ]);

    const [result] = await listNotesWithComments(db, ticket.id);

    expect(result!.comments.map((c) => c.body)).toEqual(["Earliest", "Tie, first saved", "Tie, second saved", "Latest"]);
  });

  it("keeps the note order when a comment is added to the oldest note", async () => {
    const ticket = await insertTicket();
    await db.insert(ticketNotes).values([
      { ticketId: ticket.id, body: "Oldest", createdAt: new Date("2026-01-01") },
      { ticketId: ticket.id, body: "Newest", createdAt: new Date("2026-01-03") },
    ]);
    const before = await listNotesWithComments(db, ticket.id);

    await addNoteComment(db, before.find((n) => n.body === "Oldest")!.id, "New reply");

    const after = await listNotesWithComments(db, ticket.id);
    expect(after.map((n) => n.body)).toEqual(before.map((n) => n.body));
  });

  it("returns only the notes of the given ticket", async () => {
    const first = await insertTicket();
    const second = await insertTicket();
    await addNote(db, first.id, "On first");
    await addNote(db, second.id, "On second");

    const notes = await listNotesWithComments(db, first.id);

    expect(notes.map((n) => n.body)).toEqual(["On first"]);
  });

  it("returns an empty list for a ticket without notes", async () => {
    const ticket = await insertTicket();
    expect(await listNotesWithComments(db, ticket.id)).toEqual([]);
  });
});
