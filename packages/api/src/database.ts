import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../');
const databasePath = process.env.DATABASE_PATH ?? resolve(projectRoot, 'data/kundportal.sqlite');

export function openDatabase(path = databasePath): Database.Database {
  if (path !== ':memory:') {
    mkdirSync(dirname(path), { recursive: true });
  }

  const connection = new Database(path);
  connection.exec(`
    CREATE TABLE IF NOT EXISTS cases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      priority TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Nytt',
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    )
  `);
  return connection;
}

export const database = openDatabase();
