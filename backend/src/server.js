import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';
import { openDatabase } from './db.js';

const PORT = Number(process.env.PORT) || 3000;
const DB_PATH = process.env.DB_PATH || fileURLToPath(new URL('../data/portal.db', import.meta.url));

const db = openDatabase(DB_PATH);
const server = http.createServer(createApp({ db }));

server.listen(PORT, () => {
  console.log(`Kundserviceportalen kör på http://localhost:${PORT}`);
  console.log(`Databas: ${DB_PATH}`);
});
