import express from 'express';
import type Database from 'better-sqlite3';
import {
  isValidCaseId,
  validateCaseNote,
  validateCaseStatus,
  validateCreateCase,
  validateUpdateCase
} from './caseValidation.js';

interface CaseRow {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  note: string | null;
}

interface CaseSummaryRow {
  id: number;
  title: string;
  description: string;
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
        SELECT id, title, description, category, priority, status, created_at AS createdAt
        FROM cases
        ORDER BY created_at DESC, id DESC
      `)
      .all() as CaseSummaryRow[];

    return response.json(cases);
  });

  app.get('/api/cases/:id', (request, response) => {
    const id = Number(request.params.id);
    if (!isValidCaseId(request.params.id)) {
      return response.status(400).json({ error: 'Ärende-ID måste vara ett positivt heltal.' });
    }

    try {
      const caseItem = connection
        .prepare(`
          SELECT id, title, description, category, priority, status, created_at AS createdAt, note
          FROM cases WHERE id = ?
        `)
        .get(id) as CaseRow | undefined;

      if (!caseItem) {
        return response.status(404).json({ error: 'Ärendet hittades inte.' });
      }

      return response.json(caseItem);
    } catch (error) {
      console.error('Failed to load case details:', error);
      return response.status(500).json({ error: 'Ärendet kunde inte hämtas. Försök igen.' });
    }
  });

  app.delete('/api/cases/:id', (request, response) => {
    if (!isValidCaseId(request.params.id)) {
      return response.status(400).json({ error: 'Ärende-ID måste vara ett positivt heltal.' });
    }

    try {
      const result = connection.prepare('DELETE FROM cases WHERE id = ?')
        .run(Number(request.params.id));
      if (result.changes === 0) {
        return response.status(404).json({ error: 'Ärendet hittades inte.' });
      }

      return response.status(204).end();
    } catch (error) {
      console.error('Failed to delete case:', error);
      return response.status(500).json({ error: 'Ärendet kunde inte tas bort. Försök igen.' });
    }
  });

  app.patch('/api/cases/:id', (request, response) => {
    if (!isValidCaseId(request.params.id)) {
      return response.status(400).json({ error: 'Ärende-ID måste vara ett positivt heltal.' });
    }

    const validation = validateUpdateCase(request.body);
    if (!validation.success) {
      return response.status(400).json({ error: validation.error });
    }

    try {
      const updated = connection
        .prepare(`
          UPDATE cases
          SET title = @title, description = @description, category = @category,
              priority = @priority, status = @status, note = @note
          WHERE id = @id
          RETURNING id, title, description, category, priority, status, created_at AS createdAt, note
        `)
        .get({ ...validation.value, id: Number(request.params.id) }) as CaseRow | undefined;

      if (!updated) {
        return response.status(404).json({ error: 'Ärendet hittades inte.' });
      }

      return response.json(updated);
    } catch (error) {
      console.error('Failed to update case:', error);
      return response.status(500).json({ error: 'Ärendet kunde inte sparas. Försök igen.' });
    }
  });

  app.patch('/api/cases/:id/status', (request, response) => {
    if (!isValidCaseId(request.params.id)) {
      return response.status(400).json({ error: 'Ärende-ID måste vara ett positivt heltal.' });
    }

    const validation = validateCaseStatus(request.body);
    if (!validation.success) {
      return response.status(400).json({ error: validation.error });
    }

    try {
      const updated = connection
        .prepare(`
          UPDATE cases SET status = ? WHERE id = ?
          RETURNING id, title, description, category, priority, status, created_at AS createdAt, note
        `)
        .get(validation.value, Number(request.params.id)) as CaseRow | undefined;

      if (!updated) {
        return response.status(404).json({ error: 'Ärendet hittades inte.' });
      }

      return response.json(updated);
    } catch (error) {
      console.error('Failed to update case status:', error);
      return response.status(500).json({ error: 'Status kunde inte sparas. Försök igen.' });
    }
  });

  app.patch('/api/cases/:id/note', (request, response) => {
    if (!isValidCaseId(request.params.id)) {
      return response.status(400).json({ error: 'Ärende-ID måste vara ett positivt heltal.' });
    }

    const validation = validateCaseNote(request.body);
    if (!validation.success) {
      return response.status(400).json({ error: validation.error });
    }

    try {
      const updated = connection
        .prepare(`
          UPDATE cases SET note = ? WHERE id = ?
          RETURNING id, title, description, category, priority, status, created_at AS createdAt, note
        `)
        .get(validation.value, Number(request.params.id)) as CaseRow | undefined;

      if (!updated) {
        return response.status(404).json({ error: 'Ärendet hittades inte.' });
      }

      return response.json(updated);
    } catch (error) {
      console.error('Failed to update case note:', error);
      return response.status(500).json({ error: 'Anteckningen kunde inte sparas. Försök igen.' });
    }
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
        SELECT id, title, description, category, priority, status, created_at AS createdAt, note
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
