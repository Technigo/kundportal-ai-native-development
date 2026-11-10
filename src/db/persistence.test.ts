// @vitest-environment node
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { migrate } from "drizzle-orm/libsql/migrator";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createTicket, getTicket, listTickets } from "@/tickets/ticketRepository";
import { createDb } from "./client";

// Decision 07: tickets are stored in a file, so a new connection after a restart still sees them.
let dir: string;
let url: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "kundportal-persistence-"));
  url = `file:${join(dir, "app.db")}`;
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe("ticket persistence", () => {
  it("keeps a saved ticket when the app opens the database file again after a restart", async () => {
    const beforeRestart = createDb(url);
    await migrate(beforeRestart, { migrationsFolder: "./drizzle" });
    const saved = await createTicket(beforeRestart, {
      requesterName: "Ada Lovelace",
      requesterEmail: "ada@example.com",
      subject: "Invoice is missing",
      description: "Line one.\nLine two.",
      category: "Billing",
      priority: "high",
    });

    // A restart starts a new process, which opens a new connection to the same file.
    const afterRestart = createDb(url);

    expect(await getTicket(afterRestart, saved.id)).toEqual(saved);
    expect(await listTickets(afterRestart)).toEqual([saved]);
  });
});
