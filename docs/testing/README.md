# Testing

Everything QA-specific is in this folder: the QA tasks in [testing-spec.md](testing-spec.md) and the
proof behind QA results (run logs, defect reports and attachments from manual checks). Requirements,
the traceability table and recorded results stay in the team's documents, and this folder only
links to them.

## Where things are

| What                                           | Where                                                                                     |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Requirements and acceptance criteria (R#, A#)  | [kravspec.md](../specs/kravspec.md)                                                       |
| Search and filter criteria (SF-R#, SF-A#)      | [sok-filter.md](../specs/sok-filter.md)                                                   |
| Which test covers which criterion              | [verifieringsplan.md, Spårbarhet](../verifieringsplan.md#spårbarhet)                      |
| Manual checks and their recorded runs          | [verifieringsplan.md, Manuella kontroller](../verifieringsplan.md#manuella-kontroller)    |
| Recorded test runs                             | [verifieringsplan.md, Resultat](../verifieringsplan.md#resultat)                          |
| QA tasks QA-1 to QA-7                          | [testing-spec.md](testing-spec.md)                                                        |
| Agent assignments                              | [agentuppdrag/](../agentuppdrag/)                                                         |
| Postman collection                             | [api/README.md](../api/README.md)                                                         |

## Folders

- [testing-spec.md](testing-spec.md) – QA tasks QA-1 to QA-7, their status and open items.
- [evidence/](evidence/) – raw run logs.
- [defects/](defects/README.md) – one file per defect.
- [manual/](manual/README.md) – attachments for manual checks.

## Rules

- **Link, don't copy.** Never copy a requirement, a table or a result into this folder. Write the
  outcome in the verification plan or testing-spec.md and link here for the proof.
- **Every file is linked.** Each file here is linked from the verification plan, testing-spec.md,
  an agent assignment or a defect report. A file that nothing links to should be removed.
- **Names:** `YYYY-MM-DD-<id>-<what>.<ext>`, for example `2026-11-10-A2-can-fail.txt`. Use the
  A#, SF-A#, K# or QA-# id, or `baseline` for a run of the whole suite.
- **Header:** every log starts with the date, branch and commit, the exact command and the result.
  A proof that a test can fail also states the temporary change and that it was undone.
- **Clean output:** run commands with `FORCE_COLOR=0` and save as UTF-8, so the log has no color
  codes or garbled characters. In PowerShell 5.1, piping to a file gives UTF-16, so use Bash.
- **Made-up data only**, as everywhere in the project.
