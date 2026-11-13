// Mutation check: break the code on purpose and confirm that the right tests fail.
// Each mutation changes one line, runs the tests that should catch it, then restores the file.
// Usage: npm run test:mutation           (Vitest only)
//        npm run test:mutation -- --e2e  (also Playwright, one production build per mutation)
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ACTIONS = "src/app/(portal)/tickets/actions.ts";
const ACTIONS_TEST = "src/app/(portal)/tickets/actions.test.ts";
const TICKETS_E2E = "e2e/tickets.spec.ts";

const mutations = [
  {
    name: "Saving is disconnected (AC1.1)",
    file: ACTIONS,
    from: "  await createTicket(getDb(), parsed.data);",
    to: "",
    vitest: { files: [ACTIONS_TEST], mustFail: ["saves a valid ticket with its requester, revalidates the list and redirects to it"] },
    e2e: { files: [TICKETS_E2E], mustFail: ["submitting a valid ticket shows it at the top of the list"] },
  },
  {
    // A misspelled field name still builds, unlike removing the line, which TypeScript stops.
    name: "The action reads the category from a misspelled field (AC1.1, AC1.7)",
    file: ACTIONS,
    from: 'formData.get("category")',
    to: 'formData.get("categry")',
    vitest: { files: [ACTIONS_TEST], mustFail: ["returns a category error and keeps the entered category when it is only spaces, and saves nothing"] },
    e2e: { files: [TICKETS_E2E], mustFail: ["submitting a valid ticket shows it at the top of the list"] },
  },
  {
    name: "The category is not saved, so the database default General hides it (AC1.7)",
    file: ACTIONS,
    from: "await createTicket(getDb(), parsed.data);",
    to: "await createTicket(getDb(), { ...parsed.data, category: undefined as never });",
    vitest: { files: [ACTIONS_TEST], mustFail: ["saves a valid ticket with its requester, revalidates the list and redirects to it"] },
    // No e2e: the ticket list does not show the category, so only the action test can catch this.
  },
  {
    // redirect throws to work, so inside the try it is caught and shown as a database error.
    name: "redirect is called inside the try, so the redirect is caught as a save error (AC1.8)",
    file: ACTIONS,
    from: "  } catch (error) {",
    to: '    redirect("/tickets");\n  } catch (error) {',
    vitest: { files: [ACTIONS_TEST], mustFail: ["saves the ticket and redirects when the same values are sent again after a failure"] },
    // No e2e: AC1.8 has no e2e test (decision 07).
  },
];

const withE2e = process.argv.includes("--e2e");
const workDir = mkdtempSync(join(tmpdir(), "mutation-check-"));

// The file currently mutated, so it can be restored on Ctrl+C as well.
let active;

function restore() {
  if (!active) return;
  writeFileSync(active.file, active.original);
  if (readFileSync(active.file, "utf8") !== active.original) {
    console.error(`Could not restore ${active.file}. Check it with git diff.`);
    process.exit(2);
  }
  active = undefined;
}

process.on("SIGINT", () => {
  restore();
  process.exit(130);
});

const BINS = { vitest: "node_modules/vitest/vitest.mjs", playwright: "node_modules/@playwright/test/cli.js" };

// Run the CLI with node directly: spawning npx needs a shell on Windows (npx.cmd).
function run(command, args, env = {}) {
  return spawnSync(process.execPath, [BINS[command], ...args], { encoding: "utf8", env: { ...process.env, ...env } });
}

function readReport(path, result) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return { missing: (result.stderr || result.stdout || "no report written").trim().split("\n").slice(-3).join(" ") };
  }
}

/** Titles of the Vitest tests that failed, or an error if the tests did not run. */
function failedVitest(files) {
  const out = join(workDir, "vitest.json");
  const report = readReport(out, run("vitest", ["run", ...files, "--reporter=json", `--outputFile=${out}`]));
  if (report.missing) return { error: report.missing };
  const broken = report.testResults.find((file) => file.status === "failed" && file.assertionResults.length === 0);
  if (broken) return { error: broken.message };
  if (report.numTotalTests === 0) return { error: "no tests ran" };
  return { failed: report.testResults.flatMap((file) => file.assertionResults.filter((t) => t.status === "failed").map((t) => t.title)) };
}

/** Titles of the Playwright tests that failed, or an error if the tests did not run. */
function failedE2e(files) {
  const out = join(workDir, "playwright.json");
  const report = readReport(out, run("playwright", ["test", ...files, "--reporter=json"], { PLAYWRIGHT_JSON_OUTPUT_NAME: out }));
  if (report.missing) return { error: report.missing };
  if (report.errors?.length) return { error: report.errors.map((e) => e.message).join(" ") };
  const specs = (suite) => [...(suite.specs ?? []), ...(suite.suites ?? []).flatMap(specs)];
  const all = report.suites.flatMap(specs);
  if (all.length === 0) return { error: "no tests ran" };
  return { failed: all.filter((spec) => !spec.ok).map((spec) => spec.title) };
}

function check(level, expected, { failed, error }) {
  if (error) {
    // No tests ran, so the run says nothing about whether the tests catch the mutation.
    console.log(`  ${level}: ERROR, the tests did not run: ${error}`);
    return "ERROR";
  }
  const missed = expected.mustFail.filter((title) => !failed.includes(title));
  const result = missed.length === 0 ? "CAUGHT" : "MISSED";
  console.log(`  ${level}: ${result} (${failed.length} failing test(s))`);
  for (const title of expected.mustFail) console.log(`    ${missed.includes(title) ? "still passes" : "fails     "}  ${title}`);
  return result;
}

const results = [];
try {
  for (const mutation of mutations) {
    const original = readFileSync(mutation.file, "utf8");
    if (original.split(mutation.from).length !== 2) {
      console.log(`\n${mutation.name}\n  SKIPPED: the line to mutate was not found exactly once in ${mutation.file}`);
      results.push({ name: mutation.name, level: "-", result: "SKIPPED" });
      continue;
    }

    console.log(`\n${mutation.name}`);
    active = { file: mutation.file, original };
    writeFileSync(mutation.file, original.replace(mutation.from, mutation.to));

    results.push({ name: mutation.name, level: "Vitest", result: check("Vitest", mutation.vitest, failedVitest(mutation.vitest.files)) });
    if (withE2e && mutation.e2e) {
      results.push({ name: mutation.name, level: "E2E", result: check("E2E", mutation.e2e, failedE2e(mutation.e2e.files)) });
    }

    restore();
  }
} finally {
  restore();
  rmSync(workDir, { recursive: true, force: true });
}

console.log("\nSummary");
console.table(results);

if (results.some((r) => r.result !== "CAUGHT")) process.exit(1);
