// ÄGARE: gemensamt skelett. Kontrollerar bara att grunden fungerar – inga AK.
import { describe, it, expect, afterEach } from 'vitest';
import { startTestServer } from './helpers/testServer.js';
import { openDatabase } from '../src/db.js';

let server;
afterEach(async () => { if (server) await server.close(); server = undefined; });

describe('skelett', () => {
  it('serverar frontend/index.html på /', async () => {
    server = await startTestServer();
    const res = await server.api('GET', '/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Kundserviceportalen');
  });

  it('svarar 404 med JSON på okänd sökväg', async () => {
    server = await startTestServer();
    const res = await server.api('GET', '/finns-inte');
    expect(res.status).toBe(404);
    expect(res.body.fel).toBeTruthy();
  });

  it('skapar tabellen arenden', () => {
    const db = openDatabase(':memory:');
    const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='arenden'").get();
    expect(row.name).toBe('arenden');
    db.close();
  });
});
