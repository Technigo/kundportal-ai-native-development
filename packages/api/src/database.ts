import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../');
const databasePath = process.env.DATABASE_PATH ?? resolve(projectRoot, 'data/kundportal.sqlite');

mkdirSync(dirname(databasePath), { recursive: true });

export const database = new Database(databasePath);
