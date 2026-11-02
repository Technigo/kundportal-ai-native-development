import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type Database from 'better-sqlite3';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from './app.js';
import { openDatabase } from './database.js';

const createCase = (title: string) => ({
  title,
  description: `Beskrivning för ${title}.`,
  category: 'Tekniskt',
  priority: 'Normal'
});

describe('GET /api/cases', () => {
  let directory: string;
  let database: Database.Database;
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), 'kundportal-case-list-'));
    database = openDatabase(join(directory, 'test.sqlite'));
    app = createApp(database);
  });

  afterEach(() => {
    database.close();
    rmSync(directory, { recursive: true, force: true });
  });

  it('[CASE-LIST-001] returns case summaries newest first', async () => {
    const older = await request(app).post('/api/cases').send(createCase('Äldre')).expect(201);
    const newer = await request(app).post('/api/cases').send(createCase('Nyare')).expect(201);

    database
      .prepare('UPDATE cases SET created_at = ? WHERE id = ?')
      .run('2026-01-01T10:00:00.000Z', older.body.id);
    database
      .prepare('UPDATE cases SET created_at = ? WHERE id = ?')
      .run('2026-02-01T10:00:00.000Z', newer.body.id);

    const response = await request(app).get('/api/cases').expect(200);

    expect(response.body.map((item: { title: string }) => item.title)).toEqual(['Nyare', 'Äldre']);
    expect(response.body[0]).toMatchObject({
      id: newer.body.id,
      title: 'Nyare',
      category: 'Tekniskt',
      priority: 'Normal',
      status: 'Nytt',
      createdAt: '2026-02-01T10:00:00.000Z'
    });
  });

  it('[CASE-LIST-002] returns an empty list when no cases exist', async () => {
    const response = await request(app).get('/api/cases').expect(200);

    expect(response.body).toEqual([]);
  });
});
