# Improving the test-cases skill: v1 compared with v2

Owner: Jessica Swahn · 2026-11-12 · Branch: `jessica/improve-test-cases-skill`

Version 2 of [`.claude/skills/test-cases/SKILL.md`](../../../.claude/skills/test-cases/SKILL.md) roughly halves the longest table row and asked no question the spec had already settled. The sample is small: one run per version and criterion.

## Problem

Four runs of version 1 (AC-S3, AC-S6, AC-S4 and AC-S1) showed three weaknesses:

1. The table was too wide and was cut off in the terminal every time.
2. The skill asked about things already decided in the spec. For AC-S1 I had to write "Already decided" in the prompt to avoid it.
3. It proposed test cases that only tested a library (zod), for example `" open "` and wrong casing for AC-S3, although the skill says to leave those out.

## Change

- **A. Short table cells.** Every cell is at most about 60 characters. Longer details go in a numbered Details list under the table.
- **C. Read Decisions first.** Step 1 reads the spec's Decisions table first. Step 5 says not to ask about anything it already settles, and to name the decision instead.
- **Not chosen: B, a list instead of a table.** The table makes it easy to pick rows by number.

The diff was proposed by Claude Code and reviewed before it was applied. It adds 2 lines. Claude Code put the Decisions rule in step 5 rather than under Rules, because step 5 is where questions are written, and I accepted that.

## Method

- The metrics were decided before the comparison (table below).
- Metric 1 was first "is the table cut off in the terminal". I changed it, because that depends on the window width and not only on the skill. Line length is an exact number.
- The same two criteria for both versions: AC-S5 and AC-S2 from [status-change.md](../../specs/status-change.md).
- The same prompt, `/test-cases <id>`, in a new session for every run. The answer was then saved to a file in a second message.
- Line lengths were counted with a script. Metrics 2 and 3 are my own judgement.

| # | Metric | How it is counted | Good result |
|---|---|---|---|
| 1 | Line length | Characters in the longest row of the table | Shorter than v1 |
| 2 | Unnecessary questions | Questions about something already under Decisions in the spec | 0 |
| 3 | Unnecessary test cases | Cases that only test a library (e.g. zod), not our code | 0 |
| 4 | Number of test cases | Rows in the table | About the same as v1 (control) |

## Results

| Run | 1. Longest table row | 2. Unnecessary questions | 3. Unnecessary cases | 4. Cases | File |
|---|---|---|---|---|---|
| v1, AC-S5 | 285 | 1 of 3 | 0 | 6 | [v1-AC-S5.md](v1-AC-S5.md) |
| v2, AC-S5 | 157 | 0 of 3 | 1 | 6 | [v2-AC-S5.md](v2-AC-S5.md) |
| v1, AC-S2 | 368 | 0 of 3 | 0 | 6 | [v1-AC-S2.md](v1-AC-S2.md) |
| v2, AC-S2 | 163 | 0 of 3 | 0 | 7 | [v2-AC-S2.md](v2-AC-S2.md) |

- The v1 AC-S5 question that counted as unnecessary asked whether the page should show anything. The decision "Silently ignored" already answers that.
- The unnecessary case in v2 AC-S5 is row 4, which sends `IN_PROGRESS` with the wrong casing. It mainly tests zod's exact match, the same kind of case as in AC-S3.
- Cells over 60 characters went from 11 to 1 (AC-S5) and from 10 to 4 (AC-S2). The ones left are 64–65 characters.

## Benefit

- **A worked clearly.** The longest table row was 45 % shorter for AC-S5 and 56 % shorter for AC-S2. The number of cases stayed the same, so the shorter table did not come from proposing less.
- **C seems to work.** v2 named the decisions it relied on in Details, for example "Relies on the decision 'Any status to any other status'". For AC-S2 it listed no assumptions at all, against 2 in v1.

## Limitations

- **Small sample.** One run per version and criterion, and both criteria come from the same spec. Claude does not answer the same way twice: the v1 run of AC-S5 was already better than earlier v1 runs. 1 unnecessary question against 0 is too little to prove that C works.
- **The text moved, it did not disappear.** The longest line in the whole answer for AC-S5 grew from 310 to 400 characters, in Details. Plain text wraps in the terminal and a table does not, so this is still better to read, but the answer is not much shorter overall.
- **Metric 3 did not improve.** v2 proposed a library-only case again. The skill already said to leave those out, and neither A nor C targets it.
- **Off-criterion rows.** Row 6 in v2 AC-S2 belongs to AC-S3. The skill pointed this out itself and asked whether to move it.
- **Metrics 2 and 3 are judgement calls** by the person who made the change.

## When this way of working fits

- When the same AI-assisted step is repeated often enough that a small fix to the instructions pays off, like proposing test cases for every criterion.
- When the weakness is about form, like the table width. A concrete rule (60 characters) gave a clear, measurable result.
- It fits less well for judgement, like which cases are useful. A rule that already existed did not stop a library-only case, so that still needs a person to review the proposal.
- To show a real improvement, decide the metrics first, keep the prompt the same and run each version more than once.
