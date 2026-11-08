import type Database from 'better-sqlite3';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from './app.js';
import { openDatabase } from './database.js';

describe('DELETE /api/cases/:id', () => {
  let database: Database.Database;
  let app: ReturnType<typeof createApp>;
  let caseId: number;

  beforeEach(async () => {
    database = openDatabase(':memory:');
    app = createApp(database);
    const created = await request(app).post('/api/cases').send({
      title: 'Fiktivt ärende',
      description: 'En beskrivning.',
      category: 'Konto',
      priority: 'Normal'
    }).expect(201);
    caseId = created.body.id;
  });

  afterEach(() => {
    database.close();
  });

  it('[CASE-DELETE-001] removes the selected case from persistence', async () => {
    await request(app).delete(`/api/cases/${caseId}`).expect(204);

    await request(app).get(`/api/cases/${caseId}`).expect(404);
    const list = await request(app).get('/api/cases').expect(200);
    expect(list.body).toEqual([]);
  });

  it('[CASE-DELETE-004] returns not found for a missing case without changing other cases', async () => {
    const response = await request(app).delete('/api/cases/999').expect(404);

    expect(response.body).toEqual({ error: 'Ärendet hittades inte.' });
    await request(app).get(`/api/cases/${caseId}`).expect(200);
  });

  it.each(['abc', '0', '-1'])('[CASE-DELETE-005] rejects invalid case ID %s', async (id) => {
    const response = await request(app).delete(`/api/cases/${id}`).expect(400);

    expect(response.body).toEqual({ error: 'Ärende-ID måste vara ett positivt heltal.' });
    await request(app).get(`/api/cases/${caseId}`).expect(200);
  });
});
