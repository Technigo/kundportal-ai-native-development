// @vitest-environment node
import { LibsqlError } from "@libsql/client";
import { DrizzleQueryError } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createDb, getDb, type Db } from "@/db/client";
import { tickets } from "@/db/schema";
import { createTestDb } from "@/test-utils/testDb";
import { submitTicket } from "./actions";

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
