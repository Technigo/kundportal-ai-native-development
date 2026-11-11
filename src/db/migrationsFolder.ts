import { fileURLToPath } from "node:url";

/** Absolute path to the Drizzle migrations, so migrating works whatever folder the command runs from. */
export const migrationsFolder = fileURLToPath(new URL("../../drizzle", import.meta.url));
