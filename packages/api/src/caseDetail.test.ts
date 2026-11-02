import type Database from 'better-sqlite3';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from './app.js';
import { openDatabase } from './database.js';

describe('GET /api/cases/:id', () => {
  let database: Database.Database;
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    database = openDatabase(':memory:');
    app = createApp(database);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    database.close();
  });

  it('[CASE-DETAIL-001] returns the selected case with all detail fields', async () => {
    const payload = {
      title: 'Fiktivt fakturaärende',
      description: 'En fullständig beskrivning av det fiktiva ärendet.',
      category: 'Fakturering',
      priority: 'Hög'
    };
    const created = await request(app).post('/api/cases').send(payload).expect(201);
    await request(app).post('/api/cases').send({ ...payload, title: 'Annat ärende' }).expect(201);

    const response = await request(app).get(`/api/cases/${created.body.id}`).expect(200);

    expect(response.body).toEqual(created.body);
  });

  it('[CASE-DETAIL-002] returns a readable not-found error for a missing case', async () => {
    const response = await request(app).get('/api/cases/999').expect(404);

    expect(response.body).toEqual({ error: 'Ärendet hittades inte.' });
  });

  it.each(['abc', '0', '-1', '1.5', '1abc', '9007199254740992'])(
    '[CASE-DETAIL-002] rejects invalid case ID %s',
    async (id) => {
      const response = await request(app).get(`/api/cases/${id}`).expect(400);

      expect(response.body).toEqual({ error: 'Ärende-ID måste vara ett positivt heltal.' });
    }
  );

  it('[CASE-DETAIL-003] returns a fetch error when the database query fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(database, 'prepare').mockImplementationOnce(() => {
      throw new Error('Database query failed');
    });

    const response = await request(app).get('/api/cases/1').expect(500);

    expect(response.body).toEqual({ error: 'Ärendet kunde inte hämtas. Försök igen.' });
  });
});
