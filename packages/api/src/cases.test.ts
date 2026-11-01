import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type Database from 'better-sqlite3';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from './app.js';
import { openDatabase } from './database.js';

const validCase = (overrides: Record<string, unknown> = {}): Record<string, unknown> => ({
  title: 'Inloggningsproblem',
  description: 'Kunden kan inte logga in.',
  category: 'Tekniskt',
  priority: 'Normal',
  ...overrides
});

describe('POST /api/cases', () => {
  let directory: string;
  let databasePath: string;
  let database: Database.Database;
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), 'kundportal-case-create-'));
    databasePath = join(directory, 'test.sqlite');
    database = openDatabase(databasePath);
    app = createApp(database);
  });

  afterEach(() => {
    database.close();
    rmSync(directory, { recursive: true, force: true });
  });

  it('[CASE-CREATE-001] trims valid titles and validates required and maximum length', async () => {
    const created = await request(app)
      .post('/api/cases')
      .send(validCase({ title: '  Inloggningsproblem  ' }))
      .expect(201);

    expect(created.body.title).toBe('Inloggningsproblem');

    for (const title of [undefined, '', '   ', 'x'.repeat(121)]) {
      const payload = validCase({ title });
      if (title === undefined) delete payload.title;
      await request(app).post('/api/cases').send(payload).expect(400);
    }

    await request(app)
      .post('/api/cases')
      .send(validCase({ title: 'x'.repeat(120) }))
      .expect(201);
  });

  it('[CASE-CREATE-002] trims valid descriptions and validates required and maximum length', async () => {
    const created = await request(app)
      .post('/api/cases')
      .send(validCase({ description: '  Kan inte logga in.  ' }))
      .expect(201);

    expect(created.body.description).toBe('Kan inte logga in.');

    for (const description of [undefined, '', '   ', 'x'.repeat(2001)]) {
      const payload = validCase({ description });
      if (description === undefined) delete payload.description;
      await request(app).post('/api/cases').send(payload).expect(400);
    }

    await request(app)
      .post('/api/cases')
      .send(validCase({ description: 'x'.repeat(2000) }))
      .expect(201);
  });

  it('[CASE-CREATE-003] accepts allowed categories and rejects unknown categories', async () => {
    for (const category of ['Konto', 'Fakturering', 'Tekniskt', 'Övrigt']) {
      await request(app).post('/api/cases').send(validCase({ category })).expect(201);
    }

    await request(app).post('/api/cases').send(validCase({ category: 'Annat' })).expect(400);
    await request(app).post('/api/cases').send(validCase({ category: '' })).expect(400);
  });

  it('[CASE-CREATE-004] accepts allowed priorities and rejects unknown priorities', async () => {
    for (const priority of ['Låg', 'Normal', 'Hög']) {
      await request(app).post('/api/cases').send(validCase({ priority })).expect(201);
    }

    await request(app).post('/api/cases').send(validCase({ priority: 'Kritisk' })).expect(400);
    await request(app).post('/api/cases').send(validCase({ priority: '' })).expect(400);
  });

  it('[CASE-CREATE-005] assigns new status and a system creation time', async () => {
    const response = await request(app).post('/api/cases').send(validCase()).expect(201);

    expect(response.body.status).toBe('Nytt');
    expect(Number.isNaN(Date.parse(response.body.createdAt))).toBe(false);
  });

  it('[CASE-CREATE-006] persists a case after reopening the database', async () => {
    const created = await request(app).post('/api/cases').send(validCase()).expect(201);
    database.close();

    const reopenedDatabase = openDatabase(databasePath);
    const persisted = reopenedDatabase.prepare('SELECT title FROM cases WHERE id = ?').get(created.body.id) as
      | { title: string }
      | undefined;
    reopenedDatabase.close();

    expect(persisted?.title).toBe('Inloggningsproblem');
    database = openDatabase(databasePath);
  });

  it('[CASE-CREATE-007] rejects invalid input without storing a case', async () => {
    await request(app).post('/api/cases').send(validCase({ title: '   ' })).expect(400);

    const result = database.prepare('SELECT COUNT(*) AS count FROM cases').get() as { count: number };
    expect(result.count).toBe(0);
  });

  it('[CASE-CREATE-008] creates a case without an internal note', async () => {
    const response = await request(app).post('/api/cases').send(validCase()).expect(201);

    expect(response.body.title).toBe('Inloggningsproblem');
  });
});
