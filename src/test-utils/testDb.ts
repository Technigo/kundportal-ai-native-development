import { migrate } from "drizzle-orm/libsql/migrator";
import { createDb, type Db } from "@/db/client";
import { migrationsFolder } from "@/db/migrationsFolder";

/** A fresh, migrated in-memory database. Create one per test so tests never share data. */
export async function createTestDb(): Promise<Db> {
  const db = createDb(":memory:");
  await migrate(db, { migrationsFolder });
  return db;
}
