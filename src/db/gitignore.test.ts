// @vitest-environment node
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));

// AC7.2: local database files must never be committed.
describe("local database files", () => {
  it.each(["data/dev.db", "data/e2e.db", "data/dev.db-wal"])("are ignored by git: %s", (path) => {
    // git check-ignore exits with an error (and the test fails) when the path is not ignored or is already tracked.
    const output = execFileSync("git", ["check-ignore", path], { cwd: repoRoot, encoding: "utf8" });
    expect(output.trim()).toBe(path);
  });
});
