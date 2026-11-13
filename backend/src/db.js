import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { KATEGORIER, STATUSAR, PRIORITET_MIN, PRIORITET_MAX } from './constants.js';

const sqlList = (values) => values.map((v) => `'${v}'`).join(', ');

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS arenden (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    arendenummer TEXT    NOT NULL UNIQUE,
    rubrik       TEXT    NOT NULL,
    beskrivning  TEXT    NOT NULL,
    kategori     TEXT    NOT NULL CHECK (kategori IN (${sqlList(KATEGORIER)})),
    prioritet    INTEGER NOT NULL CHECK (prioritet BETWEEN ${PRIORITET_MIN} AND ${PRIORITET_MAX}),
    status       TEXT    NOT NULL CHECK (status IN (${sqlList(STATUSAR)})),
    skapad       TEXT    NOT NULL,  -- ISO 8601, UTC, t.ex. 2026-11-02T10:00:00.000Z
    deadline     TEXT    NOT NULL   -- YYYY-MM-DD
  );
`;

/**
 * Öppnar (och skapar vid behov) databasen.
 * `path` = filväg, eller ':memory:' för en tillfällig databas (bra i tester).
 * Att öppna samma filväg igen motsvarar "applikationen startas om" (AK9).
 */
export function openDatabase(path = ':memory:') {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec(SCHEMA);
  return db;
}
