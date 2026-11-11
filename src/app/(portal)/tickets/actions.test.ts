// @vitest-environment node
import { LibsqlError } from "@libsql/client";
import { DrizzleQueryError } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createDb, getDb, type Db } from "@/db/client";
import { ticketNoteComments, ticketNotes, tickets } from "@/db/schema";
import { createTestDb } from "@/test-utils/testDb";
import { addNote as saveNote, addNoteComment as saveComment, createTicket } from "@/tickets/ticketRepository";
import { addNote, addNoteComment, deleteNote, deleteNoteComment, submitTicket } from "./actions";

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
  getDb: vi.fn(() => mocks.db),
}));

const SAVE_ERROR = "Could not save the ticket to the database. Please try again.";
const validFields = {
  requesterName: "Ada Lovelace",
  requesterEmail: "ada@example.com",
  subject: "Broken invoice",
  description: "Totals are wrong",
  category: "Billing",
  priority: "high",
};

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

afterEach(() => {
  vi.restoreAllMocks();
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
      category: "",
      priority: "low",
    });
    expect(state?.formError).toBeUndefined();
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
        category: "  Billing  ",
        priority: "high",
      })),
    ).rejects.toThrow("NEXT_REDIRECT:/tickets");

    const saved = await db.select().from(tickets);
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({
      requesterName: "Ada Lovelace",
      requesterEmail: "ada@example.com",
      subject: "Broken invoice",
      category: "Billing",
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

  it("returns a category error and keeps the entered category when it is only spaces, and saves nothing", async () => {
    const state = await submitTicket(
      undefined,
      formData({ requesterName: "Ada", subject: "Hello", description: "Body", category: "   " }),
    );

    expect(state?.errors).toEqual({ category: ["Please enter a category."] });
    expect(state?.values.category).toBe("   ");
    expect(await db.select().from(tickets)).toHaveLength(0);
  });

  it("saves a ticket without a requester email", async () => {
    await expect(
      submitTicket(undefined, formData({ requesterName: "Grace", subject: "Phone call", description: "Invoice query", category: "Billing" })),
    ).rejects.toThrow("NEXT_REDIRECT");

    const [saved] = await db.select().from(tickets);
    expect(saved).toMatchObject({ requesterName: "Grace", requesterEmail: null });
  });

  it("gives a ticket sent with an empty priority the priority normal", async () => {
    await expect(
      submitTicket(undefined, formData({ requesterName: "Ada", subject: "Hello", description: "Body", category: "Billing", priority: "" })),
    ).rejects.toThrow("NEXT_REDIRECT");

    const [saved] = await db.select().from(tickets);
    expect(saved).toMatchObject({ priority: "normal" });
  });

  it("rejects an unknown priority sent directly, keeps the values and saves nothing", async () => {
    const state = await submitTicket(
      undefined,
      formData({ requesterName: "Ada", subject: "Hello", description: "Body", category: "Billing", priority: "urgent" }),
    );

    expect(Object.keys(state?.errors ?? {})).toEqual(["priority"]);
    expect(state?.values.priority).toBe("urgent");
    expect(await db.select().from(tickets)).toHaveLength(0);
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("ignores a status sent in the form", async () => {
    await expect(
      submitTicket(undefined, formData({ requesterName: "Ada", subject: "Spoof", description: "x", category: "Billing", status: "closed" })),
    ).rejects.toThrow("NEXT_REDIRECT");

    const [saved] = await db.select().from(tickets);
    expect(saved).toMatchObject({ status: "open" });
  });
});

describe("submitTicket when the ticket cannot be saved", () => {
  function readOnlyError() {
    return new DrizzleQueryError(
      "insert into tickets ...",
      ["Ada Lovelace", "ada@example.com"],
      new LibsqlError("attempt to write a readonly database", "SQLITE_READONLY"),
    );
  }

  it("returns a form error with the values and logs a real database error without its message", async () => {
    mocks.db = createDb(":memory:");
    const log = vi.spyOn(console, "error").mockImplementation(() => {});

    const state = await submitTicket(undefined, formData(validFields));

    expect(state).toEqual({ errors: {}, values: validFields, formError: SAVE_ERROR });
    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith("Failed to save ticket", { name: "Error", cause: "LibsqlError", code: "SQLITE_ERROR" });
  });

  it("does not redirect or save, and keeps the values and the error message out of the log, when the database is read-only", async () => {
    vi.spyOn(db, "insert").mockImplementationOnce(() => {
      throw readOnlyError();
    });
    const log = vi.spyOn(console, "error").mockImplementation(() => {});

    const state = await submitTicket(undefined, formData(validFields));

    expect(state).toEqual({ errors: {}, values: validFields, formError: SAVE_ERROR });
    expect(await db.select().from(tickets)).toHaveLength(0);
    expect(mocks.redirect).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith("Failed to save ticket", { name: "Error", cause: "LibsqlError", code: "SQLITE_READONLY" });
    const logged = JSON.stringify(log.mock.calls);
    for (const text of ["Ada Lovelace", "ada@example.com", "Broken invoice", "readonly database"]) expect(logged).not.toContain(text);
  });

  it("returns a form error when the database cannot be opened", async () => {
    vi.mocked(getDb).mockImplementationOnce(() => {
      throw new Error("Unable to open connection");
    });
    const log = vi.spyOn(console, "error").mockImplementation(() => {});

    const state = await submitTicket(undefined, formData(validFields));

    expect(state?.formError).toBe(SAVE_ERROR);
    expect(log).toHaveBeenCalledWith("Failed to save ticket", { name: "Error", cause: undefined, code: undefined });
  });

  it("returns a form error when something that is not an Error is thrown", async () => {
    vi.spyOn(db, "insert").mockImplementationOnce(() => {
      throw "boom";
    });
    const log = vi.spyOn(console, "error").mockImplementation(() => {});

    const state = await submitTicket(undefined, formData(validFields));

    expect(state?.formError).toBe(SAVE_ERROR);
    expect(log).toHaveBeenCalledWith("Failed to save ticket", { name: "string", cause: undefined, code: undefined });
  });

  it("saves the ticket and redirects when the same values are sent again after a failure", async () => {
    vi.spyOn(db, "insert").mockImplementationOnce(() => {
      throw readOnlyError();
    });
    vi.spyOn(console, "error").mockImplementation(() => {});

    await submitTicket(undefined, formData(validFields));
    await expect(submitTicket(undefined, formData(validFields))).rejects.toThrow("NEXT_REDIRECT:/tickets");

    expect(await db.select().from(tickets)).toHaveLength(1);
    expect(mocks.redirect).toHaveBeenCalledTimes(1);
    expect(mocks.redirect).toHaveBeenCalledWith("/tickets");
  });
});

const ticketGone = "This ticket no longer exists. Go back to the ticket list.";
const noteGone = "This note no longer exists.";
const commentGone = "This comment no longer exists.";
const malformedIds = ["01", "1e0", "abc", ""];

async function seed() {
  const ticket = await createTicket(db, { requesterName: "Ada", subject: "Subject", description: "d", priority: "normal" });
  const note = (await saveNote(db, ticket.id, "Existing note"))!;
  const comment = (await saveComment(db, note.id, "Existing comment"))!;
  return { ticket, note, comment };
}

describe("addNote", () => {
  it("saves the trimmed note, revalidates the ticket page and tells the form to empty", async () => {
    const { ticket } = await seed();

    const state = await addNote(undefined, formData({ ticketId: String(ticket.id), body: "  Called the customer  " }));

    expect(state).toEqual({ value: "", saved: true });
    expect(await db.select().from(ticketNotes)).toContainEqual(
      expect.objectContaining({ ticketId: ticket.id, body: "Called the customer" }),
    );
    expect(mocks.revalidatePath).toHaveBeenCalledWith(`/tickets/${ticket.id}`);
  });

  it.each([
    ["empty", "", "Please write a note."],
    ["only whitespace", "  \n ", "Please write a note."],
    ["over 500 characters", "x".repeat(501), "Note must be at most 500 characters."],
  ])("returns an error, keeps the text and saves nothing when the text is %s", async (_label, body, error) => {
    const { ticket } = await seed();

    const state = await addNote(undefined, formData({ ticketId: String(ticket.id), body }));

    expect(state).toEqual({ value: body, error });
    expect(await db.select().from(ticketNotes)).toHaveLength(1);
  });

  it("shows the ticket alert, keeps the text and saves nothing when the ticket does not exist", async () => {
    await seed();

    const state = await addNote(undefined, formData({ ticketId: "999", body: "Hello" }));

    expect(state).toEqual({ value: "Hello", alert: ticketGone });
    expect(await db.select().from(ticketNotes)).toHaveLength(1);
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it.each(malformedIds)("treats the ticket id %j like a missing ticket", async (ticketId) => {
    await seed();

    const state = await addNote(undefined, formData({ ticketId, body: "Hello" }));

    expect(state).toEqual({ value: "Hello", alert: ticketGone });
    expect(await db.select().from(ticketNotes)).toHaveLength(1);
  });

  it("shows only the alert when the ticket is missing and the text is empty", async () => {
    const state = await addNote(undefined, formData({ ticketId: "999", body: "" }));

    expect(state).toEqual({ value: "", alert: ticketGone });
  });
});

describe("addNoteComment", () => {
  it("saves the trimmed comment under its note and revalidates that note's ticket page", async () => {
    const { ticket, note } = await seed();

    const state = await addNoteComment(undefined, formData({ noteId: String(note.id), body: "  Thanks  " }));

    expect(state).toEqual({ value: "", saved: true });
    expect(await db.select().from(ticketNoteComments)).toContainEqual(
      expect.objectContaining({ noteId: note.id, body: "Thanks" }),
    );
    expect(mocks.revalidatePath).toHaveBeenCalledWith(`/tickets/${ticket.id}`);
  });

  it.each([
    ["empty", "", "Please write a comment."],
    ["only whitespace", "  ", "Please write a comment."],
    ["over 500 characters", "x".repeat(501), "Comment must be at most 500 characters."],
  ])("returns an error, keeps the text and saves nothing when the text is %s", async (_label, body, error) => {
    const { note } = await seed();

    const state = await addNoteComment(undefined, formData({ noteId: String(note.id), body }));

    expect(state).toEqual({ value: body, error });
    expect(await db.select().from(ticketNoteComments)).toHaveLength(1);
  });

  it.each(["999", ...malformedIds])("shows the note alert and revalidates all ticket pages for note id %j", async (noteId) => {
    await seed();

    const state = await addNoteComment(undefined, formData({ noteId, body: "Reply" }));

    expect(state).toEqual({ value: "Reply", alert: noteGone });
    expect(await db.select().from(ticketNoteComments)).toHaveLength(1);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/tickets/[id]", "page");
  });

  it("shows only the alert when the note is missing and the text is empty", async () => {
    const state = await addNoteComment(undefined, formData({ noteId: "999", body: "" }));

    expect(state).toEqual({ value: "", alert: noteGone });
  });
});

describe("deleteNote", () => {
  it("deletes the note and its comments and revalidates the ticket page", async () => {
    const { ticket, note } = await seed();

    const state = await deleteNote(undefined, formData({ noteId: String(note.id) }));

    expect(state).toEqual({});
    expect(await db.select().from(ticketNotes)).toEqual([]);
    expect(await db.select().from(ticketNoteComments)).toEqual([]);
    expect(mocks.revalidatePath).toHaveBeenCalledWith(`/tickets/${ticket.id}`);
  });

  it.each(["999", ...malformedIds])("shows the note alert, deletes nothing and revalidates all ticket pages for id %j", async (noteId) => {
    await seed();

    const state = await deleteNote(undefined, formData({ noteId }));

    expect(state).toEqual({ alert: noteGone });
    expect(await db.select().from(ticketNotes)).toHaveLength(1);
    expect(await db.select().from(ticketNoteComments)).toHaveLength(1);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/tickets/[id]", "page");
  });

  it("clears an earlier alert on success", async () => {
    const { note } = await seed();

    const state = await deleteNote({ alert: noteGone }, formData({ noteId: String(note.id) }));

    expect(state).toEqual({});
  });
});

describe("deleteNoteComment", () => {
  it("deletes only that comment and revalidates the ticket page", async () => {
    const { ticket, comment } = await seed();

    const state = await deleteNoteComment(undefined, formData({ commentId: String(comment.id) }));

    expect(state).toEqual({});
    expect(await db.select().from(ticketNoteComments)).toEqual([]);
    expect(await db.select().from(ticketNotes)).toHaveLength(1);
    expect(mocks.revalidatePath).toHaveBeenCalledWith(`/tickets/${ticket.id}`);
  });

  it.each(["999", ...malformedIds])("shows the comment alert, deletes nothing and revalidates all ticket pages for id %j", async (commentId) => {
    await seed();

    const state = await deleteNoteComment(undefined, formData({ commentId }));

    expect(state).toEqual({ alert: commentGone });
    expect(await db.select().from(ticketNoteComments)).toHaveLength(1);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/tickets/[id]", "page");
  });
});
