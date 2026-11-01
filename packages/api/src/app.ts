import express from 'express';
import type Database from 'better-sqlite3';
import { validateCreateCase } from './caseValidation.js';

interface CaseRow {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
}

interface CaseSummaryRow {
  id: number;
  title: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
}

export function createApp(connection: Database.Database) {
  const app = express();
  app.use(express.json());

  app.get('/api/health', (_request, response) => {
    connection.prepare('SELECT 1').get();
    response.json({ status: 'ok' });
  });

  app.get('/api/cases', (_request, response) => {
    const cases = connection
      .prepare(`
        SELECT id, title, category, priority, status, created_at AS createdAt
        FROM cases
        ORDER BY created_at DESC, id DESC
      `)
      .all() as CaseSummaryRow[];

    return response.json(cases);
  });

  app.post('/api/cases', (request, response) => {
    const validation = validateCreateCase(request.body);
    if (!validation.success) {
      return response.status(400).json({ error: validation.error });
    }

    const result = connection
      .prepare(`
        INSERT INTO cases (title, description, category, priority)
        VALUES (@title, @description, @category, @priority)
      `)
      .run(validation.value);
    const created = connection
      .prepare(`
        SELECT id, title, description, category, priority, status, created_at AS createdAt
        FROM cases WHERE id = ?
      `)
      .get(result.lastInsertRowid) as CaseRow | undefined;

    if (!created) {
      throw new Error('Created case could not be read from the database.');
    }

    return response.status(201).json(created);
  });

  return app;
}
