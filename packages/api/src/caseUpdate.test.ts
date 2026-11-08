import type Database from 'better-sqlite3';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from './app.js';
import { openDatabase } from './database.js';

const validCase = {
  title: 'Inloggningsproblem',
  description: 'Kunden kan inte logga in.',
  category: 'Tekniskt',
  priority: 'Normal'
};

describe('PATCH /api/cases/:id', () => {
  let database: Database.Database;
  let app: ReturnType<typeof createApp>;
  let caseId: number;

  beforeEach(async () => {
    database = openDatabase(':memory:');
    app = createApp(database);
    const created = await request(app).post('/api/cases').send(validCase).expect(201);
    caseId = created.body.id;
  });

  afterEach(() => {
    database.close();
  });

  it('[CASE-EDIT-001] updates all editable fields together and returns the saved case', async () => {
    const response = await request(app).patch(`/api/cases/${caseId}`).send({
      title: '  Uppdaterad rubrik  ',
      description: '  Uppdaterad beskrivning.  ',
      category: 'Konto',
      priority: 'Hög',
      status: 'Pågående',
      note: ' Intern anteckning '
    }).expect(200);

    expect(response.body).toMatchObject({
      id: caseId,
      title: 'Uppdaterad rubrik',
      description: 'Uppdaterad beskrivning.',
      category: 'Konto',
      priority: 'Hög',
      status: 'Pågående',
      note: 'Intern anteckning'
    });

  });

  it('[CASE-EDIT-011] keeps all updated values after reloading the case', async () => {
    const updates = {
      title: 'Uppdaterad rubrik',
      description: 'Uppdaterad beskrivning.',
      category: 'Konto',
      priority: 'Hög',
      status: 'Pågående',
      note: 'Intern anteckning'
    };
    await request(app).patch(`/api/cases/${caseId}`).send(updates).expect(200);

    const persisted = await request(app).get(`/api/cases/${caseId}`).expect(200);

    expect(persisted.body).toMatchObject(updates);
  });

  it.each([
    ['blank title', { title: '   ' }],
    ['overlong title', { title: 'x'.repeat(121) }],
    ['blank description', { description: '   ' }],
    ['overlong description', { description: 'x'.repeat(2001) }],
    ['unknown category', { category: 'Unknown' }],
    ['unknown priority', { priority: 'Critical' }],
    ['unknown status', { status: 'Invalid' }],
    ['overlong note', { note: 'x'.repeat(2001) }]
  ])('[CASE-EDIT-002] rejects %s without partially updating the case', async (_label, overrides) => {
    const original = await request(app).get(`/api/cases/${caseId}`).expect(200);

    await request(app).patch(`/api/cases/${caseId}`).send({
      ...validCase,
      status: 'Pågående',
      note: '',
      ...overrides
    }).expect(400);

    const unchanged = await request(app).get(`/api/cases/${caseId}`).expect(200);
    expect(unchanged.body).toEqual(original.body);
  });

  it('[CASE-EDIT-012] does not partially apply a rejected multi-field update', async () => {
    const original = await request(app).get(`/api/cases/${caseId}`).expect(200);

    await request(app).patch(`/api/cases/${caseId}`).send({
      ...validCase,
      title: 'New title',
      status: 'Pågående',
      note: 'New note',
      priority: 'Invalid'
    }).expect(400);

    const unchanged = await request(app).get(`/api/cases/${caseId}`).expect(200);
    expect(unchanged.body).toEqual(original.body);
  });

  it('[CASE-EDIT-006] reports a missing case without changing another case', async () => {
    const response = await request(app).patch('/api/cases/999').send({
      ...validCase,
      status: 'Nytt',
      note: ''
    }).expect(404);

    expect(response.body).toEqual({ error: 'Ärendet hittades inte.' });
  });

  it.each(['abc', '0', '-1'])('[CASE-EDIT-007] rejects invalid case ID %s', async (id) => {
    const response = await request(app).patch(`/api/cases/${id}`).send({
      ...validCase,
      status: 'Nytt',
      note: ''
    }).expect(400);

    expect(response.body).toEqual({ error: 'Ärende-ID måste vara ett positivt heltal.' });
  });
});
