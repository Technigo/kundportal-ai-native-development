import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type Database from 'better-sqlite3';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from './app.js';
import { openDatabase } from './database.js';

const statuses = ['Nytt', 'Pågående', 'Väntar på kund', 'Avslutat'];
const transitions = statuses.flatMap((from) => statuses.map((to) => ({ from, to })));

describe('PATCH /api/cases/:id/status', () => {
  let directory: string;
  let database: Database.Database;
  let app: ReturnType<typeof createApp>;
  let id: number;

  beforeEach(async () => {
    directory = mkdtempSync(join(tmpdir(), 'kundportal-case-status-'));
    database = openDatabase(join(directory, 'test.sqlite'));
    app = createApp(database);
    const response = await request(app).post('/api/cases').send({
      title: 'Fiktivt ärende',
      description: 'En fiktiv beskrivning.',
      category: 'Konto',
      priority: 'Normal'
    }).expect(201);
    id = response.body.id;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    database.close();
    rmSync(directory, { recursive: true, force: true });
  });

  it.each(transitions)('[CASE-STATUS-001] changes $from to $to', async ({ from, to }) => {
    database.prepare('UPDATE cases SET status = ? WHERE id = ?').run(from, id);

    const response = await request(app).patch(`/api/cases/${id}/status`).send({ status: to }).expect(200);

    expect(response.body.status).toBe(to);
  });

  it.each([{}, { status: 'Okänd' }, { status: '' }, { status: null }, { status: 1 }, []])(
    '[CASE-STATUS-002] rejects invalid status input %j with a readable error',
    async (body) => {
      const response = await request(app).patch(`/api/cases/${id}/status`).send(body).expect(400);

      expect(response.body).toEqual({ error: 'Välj en giltig status.' });
    }
  );

  it('[CASE-STATUS-002] preserves the stored status after invalid input', async () => {
    await request(app).patch(`/api/cases/${id}/status`).send({ status: 'Okänd' }).expect(400);

    const response = await request(app).get(`/api/cases/${id}`).expect(200);

    expect(response.body.status).toBe('Nytt');
  });

  it('[CASE-STATUS-005] leaves the stored case unchanged when a status is rejected', async () => {
    const original = await request(app).get(`/api/cases/${id}`).expect(200);
    await request(app).patch(`/api/cases/${id}/status`).send({ status: 'Okänd' }).expect(400);

    const unchanged = await request(app).get(`/api/cases/${id}`).expect(200);

    expect(unchanged.body).toEqual(original.body);
  });

  it('[CASE-STATUS-003] preserves the updated status after reopening the database', async () => {
    await request(app).patch(`/api/cases/${id}/status`).send({ status: 'Avslutat' }).expect(200);
    database.close();
    database = openDatabase(join(directory, 'test.sqlite'));
    app = createApp(database);

    const response = await request(app).get(`/api/cases/${id}`).expect(200);

    expect(response.body.status).toBe('Avslutat');
  });

  it('[CASE-STATUS-008] preserves other case fields alongside the updated status', async () => {
    const original = await request(app).get(`/api/cases/${id}`).expect(200);

    const response = await request(app).patch(`/api/cases/${id}/status`).send({ status: 'Pågående' }).expect(200);

    expect(response.body).toEqual({ ...original.body, status: 'Pågående' });
  });

  it('[CASE-STATUS-007] includes the updated status in the case list', async () => {
    await request(app).patch(`/api/cases/${id}/status`).send({ status: 'Väntar på kund' }).expect(200);

    const response = await request(app).get('/api/cases').expect(200);

    expect(response.body[0].status).toBe('Väntar på kund');
  });

  it('[CASE-STATUS-004] returns a readable error for a missing case', async () => {
    const response = await request(app).patch('/api/cases/999999/status').send({ status: 'Nytt' }).expect(404);

    expect(response.body).toEqual({ error: 'Ärendet hittades inte.' });
  });

  it.each(['abc', '0', '-1', '1.5', '9007199254740992'])(
    '[CASE-STATUS-006] rejects invalid case ID %s',
    async (invalidId) => {
      const response = await request(app).patch(`/api/cases/${invalidId}/status`).send({ status: 'Nytt' }).expect(400);

      expect(response.body).toEqual({ error: 'Ärende-ID måste vara ett positivt heltal.' });
    }
  );

  it('[CASE-STATUS-006] returns a bad-request error for an invalid case ID', async () => {
    const response = await request(app).patch('/api/cases/0/status')
      .send({ status: 'Nytt' }).expect(400);

    expect(response.body).toEqual({ error: 'Ärende-ID måste vara ett positivt heltal.' });
  });

  it('[CASE-STATUS-003] reports a database failure explicitly', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(database, 'prepare').mockImplementationOnce(() => {
      throw new Error('Database failure');
    });

    const response = await request(app).patch(`/api/cases/${id}/status`).send({ status: 'Avslutat' }).expect(500);

    expect(response.body).toEqual({ error: 'Status kunde inte sparas. Försök igen.' });
  });
});
