// @vitest-environment node
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { migrate } from "drizzle-orm/libsql/migrator";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createTicket, getTicket, listTickets } from "@/tickets/ticketRepository";
import { createDb, type Db } from "./client";
import { migrationsFolder } from "./migrationsFolder";

// Decision 08: tickets are stored in a file, so a new connection to the same file sees them.
// This does not restart a process; the real restart is a manual check in docs/verification.md.
let dir: string;
let url: string;
let openDbs: Db[];

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "kundportal-persistence-"));
  url = `file:${join(dir, "app.db")}`;
  openDbs = [];
});

afterEach(() => {
  // Close every connection first: Windows cannot delete a file that is still open (EBUSY).
  for (const db of openDbs) db.$client.close();
  rmSync(dir, { recursive: true, force: true });
});

/** Opens a connection to the test file and remembers it so afterEach can close it. */
function openDb(): Db {
  const db = createDb(url);
  openDbs.push(db);
  return db;
}

describe("ticket persistence", () => {
  it("keeps a saved ticket when the database file is opened through a new connection", async () => {
    const firstConnection = openDb();
    await migrate(firstConnection, { migrationsFolder });
    const saved = await createTicket(firstConnection, {
      requesterName: "Ada Lovelace",
      requesterEmail: "ada@example.com",
      subject: "Invoice is missing",
      description: "Line one.\nLine two.",
      category: "Billing",
      priority: "high",
    });

    // A second connection to the same file, opened while the first one is still open.
    const secondConnection = openDb();

    expect(await getTicket(secondConnection, saved.id)).toEqual(saved);
    expect(await listTickets(secondConnection)).toEqual([saved]);
  });
});
