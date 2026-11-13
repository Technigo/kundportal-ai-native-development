import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./schema";

/** The Drizzle database, plus the underlying libSQL client so callers can close it (`db.$client.close()`). */
export type Db = LibSQLDatabase<typeof schema> & { $client: Client };

export function createDb(url: string, authToken?: string): Db {
  return drizzle(createClient({ url, authToken: authToken || undefined }), { schema });
}

let db: Db | undefined;

/** The app's database, configured from DATABASE_URL (and an optional DATABASE_AUTH_TOKEN for remote libSQL). */
export function getDb(): Db {
  db ??= createDb(process.env.DATABASE_URL ?? "file:./data/dev.db", process.env.DATABASE_AUTH_TOKEN);
  return db;
}
