import express from 'express';
import { database } from './database.js';

export const app = express();

app.get('/api/health', (_request, response) => {
  database.prepare('SELECT 1').get();
  response.json({ status: 'ok' });
});
