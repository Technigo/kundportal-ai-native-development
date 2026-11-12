import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import Database from 'better-sqlite3';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from './app.js';
import { openDatabase } from './database.js';

const payload = {
  title: 'Fiktivt ärende',
  description: 'En fiktiv beskrivning.',
  category: 'Konto',
  priority: 'Normal'
};

describe('Internal case note', () => {
  let directory: string;
  let path: string;
  let database: Database.Database;
  let app: ReturnType<typeof createApp>;
  let id: number;

  beforeEach(async () => {
    directory = mkdtempSync(join(tmpdir(), 'kundportal-case-note-'));
    path = join(directory, 'test.sqlite');
    database = openDatabase(path);
    app = createApp(database);
    const created = await request(app).post('/api/cases').send(payload).expect(201);
    id = created.body.id;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    database.close();
    rmSync(directory, { recursive: true, force: true });
  });

  it('[CASE-NOTE-001] creates a case with an empty note value', async () => {
    const response = await request(app).post('/api/cases').send(payload).expect(201);

    expect(response.body.note).toBeNull();
  });

  it('[CASE-NOTE-001] reads a case without a note', async () => {
    const response = await request(app).get(`/api/cases/${id}`).expect(200);

    expect(response.body).toMatchObject({ title: payload.title, note: null });
  });

  it('[CASE-NOTE-013] upgrades an existing database while preserving its cases', async () => {
    database.close();
    database = new Database(path);
    database.exec('ALTER TABLE cases DROP COLUMN note');
    database.close();
    database = openDatabase(path);
    app = createApp(database);

    const response = await request(app).get(`/api/cases/${id}`).expect(200);

    expect(response.body).toMatchObject({ title: payload.title, note: null });
  });

  it('[CASE-NOTE-002] trims and saves a note on the chosen case', async () => {
    const response = await request(app).patch(`/api/cases/${id}/note`)
      .send({ note: '  Kontakta kunden.\nNästa vecka.  ' }).expect(200);

    expect(response.body.note).toBe('Kontakta kunden.\nNästa vecka.');
  });

  it('[CASE-NOTE-009] saves a note only on the selected case', async () => {
    const other = await request(app).post('/api/cases').send(payload).expect(201);
    await request(app).patch(`/api/cases/${id}/note`).send({ note: 'Bara valt ärende.' }).expect(200);

    const response = await request(app).get(`/api/cases/${other.body.id}`).expect(200);

    expect(response.body.note).toBeNull();
  });

  it('[CASE-NOTE-010] accepts a 2000-character note after trimming', async () => {
    const response = await request(app).patch(`/api/cases/${id}/note`)
      .send({ note: `  ${'x'.repeat(2000)}  ` }).expect(200);

    expect(response.body.note).toBe('x'.repeat(2000));
  });

  it('[CASE-NOTE-003] persists an edited note after reopening the database', async () => {
    await request(app).patch(`/api/cases/${id}/note`).send({ note: 'Första texten.' }).expect(200);
    await request(app).patch(`/api/cases/${id}/note`).send({ note: 'Redigerad text.' }).expect(200);
    database.close();
    database = openDatabase(path);
    app = createApp(database);

    const response = await request(app).get(`/api/cases/${id}`).expect(200);

    expect(response.body.note).toBe('Redigerad text.');
  });

  it('[CASE-NOTE-011] preserves the note during a status update', async () => {
    await request(app).patch(`/api/cases/${id}/note`).send({ note: 'Sparad anteckning.' }).expect(200);

    const response = await request(app).patch(`/api/cases/${id}/status`)
      .send({ status: 'Avslutat' }).expect(200);

    expect(response.body.note).toBe('Sparad anteckning.');
  });

  it('[CASE-NOTE-012] preserves other case fields when saving a note', async () => {
    const original = await request(app).get(`/api/cases/${id}`).expect(200);

    const response = await request(app).patch(`/api/cases/${id}/note`)
      .send({ note: 'Anteckning.' }).expect(200);

    expect(response.body).toEqual({ ...original.body, note: 'Anteckning.' });
  });

  it.each(['', ' \n\t '])('[CASE-NOTE-004] deletes a saved note using %j', async (note) => {
    await request(app).patch(`/api/cases/${id}/note`).send({ note: 'Sparad text.' }).expect(200);
    await request(app).patch(`/api/cases/${id}/note`).send({ note }).expect(200);
    database.close();
    database = openDatabase(path);
    app = createApp(database);

    const response = await request(app).get(`/api/cases/${id}`).expect(200);

    expect(response.body.note).toBeNull();
  });

  it('[CASE-NOTE-005] rejects 2001 characters with a readable error', async () => {
    const response = await request(app).patch(`/api/cases/${id}/note`)
      .send({ note: 'x'.repeat(2001) }).expect(400);

    expect(response.body).toEqual({ error: 'Anteckningen får innehålla högst 2000 tecken.' });
  });

  it('[CASE-NOTE-005] preserves the saved note after an invalid length', async () => {
    await request(app).patch(`/api/cases/${id}/note`).send({ note: 'Behåll texten.' }).expect(200);
    await request(app).patch(`/api/cases/${id}/note`).send({ note: 'x'.repeat(2001) }).expect(400);

    const response = await request(app).get(`/api/cases/${id}`).expect(200);

    expect(response.body.note).toBe('Behåll texten.');
  });

  it('[CASE-NOTE-007] does not change a saved note when an invalid note is rejected', async () => {
    await request(app).patch(`/api/cases/${id}/note`).send({ note: 'Behåll texten.' }).expect(200);
    await request(app).patch(`/api/cases/${id}/note`).send({ note: 'x'.repeat(2001) }).expect(400);

    const unchanged = await request(app).get(`/api/cases/${id}`).expect(200);

    expect(unchanged.body.note).toBe('Behåll texten.');
  });

  it.each([{}, { note: null }, { note: 123 }, { note: [] }, []])(
    '[CASE-NOTE-005] rejects invalid note input %j',
    async (body) => {
      const response = await request(app).patch(`/api/cases/${id}/note`).send(body).expect(400);

      expect(response.body).toEqual({ error: 'Anteckningen måste skickas som text.' });
    }
  );

  it('[CASE-NOTE-006] reports a missing case', async () => {
    const response = await request(app).patch('/api/cases/999999/note')
      .send({ note: 'Anteckning.' }).expect(404);

    expect(response.body).toEqual({ error: 'Ärendet hittades inte.' });
  });

  it.each(['abc', '0', '-1', '1.5', '9007199254740992'])(
    '[CASE-NOTE-008] rejects invalid case ID %s',
    async (invalidId) => {
      const response = await request(app).patch(`/api/cases/${invalidId}/note`)
        .send({ note: 'Anteckning.' }).expect(400);

      expect(response.body).toEqual({ error: 'Ärende-ID måste vara ett positivt heltal.' });
    }
  );

  it('[CASE-NOTE-008] returns a bad-request error for an invalid case ID', async () => {
    const response = await request(app).patch('/api/cases/0/note')
      .send({ note: 'Anteckning.' }).expect(400);

    expect(response.body).toEqual({ error: 'Ärende-ID måste vara ett positivt heltal.' });
  });

  it('[CASE-NOTE-003] reports a database save failure', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(database, 'prepare').mockImplementationOnce(() => {
      throw new Error('Database failure');
    });

    const response = await request(app).patch(`/api/cases/${id}/note`)
      .send({ note: 'Anteckning.' }).expect(500);

    expect(response.body).toEqual({ error: 'Anteckningen kunde inte sparas. Försök igen.' });
  });
});
