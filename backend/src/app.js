import { readFile } from 'node:fs/promises';
import { ValidationError, NotFoundError, NotImplementedError } from './errors.js';
import { createCase } from './handlers/createCase.js';
import { listCases } from './handlers/listCases.js';
import { getCase } from './handlers/getCase.js';
import { updateStatus } from './handlers/updateStatus.js';
import { updateCase } from './handlers/updateCase.js';

const FRONTEND_FILE = new URL('../../frontend/index.html', import.meta.url);
const MAX_BODY_BYTES = 1_000_000;

// Routtabell. Lägg inte till nya rutter utan att uppdatera docs/API.md.
const ROUTES = [
  route('POST', '/api/arenden', createCase),
  route('GET', '/api/arenden', listCases),
  route('GET', '/api/arenden/:arendenummer', getCase),
  route('PATCH', '/api/arenden/:arendenummer/status', updateStatus),
  route('PATCH', '/api/arenden/:arendenummer', updateCase),
];

/**
 * Skapar en request-lyssnare för http.createServer().
 * `db` och `now` skickas in (inte globala) så att tester kan använda
 * en tillfällig databas och en fast klocka – viktigt för deadline-reglerna (AK7, AK8).
 */
export function createApp({ db, now = () => new Date() }) {
  return async function handleRequest(req, res) {
    try {
      const { pathname } = new URL(req.url, 'http://localhost');

      if (req.method === 'GET' && (pathname === '/' || pathname === '/index.html')) {
        const html = await readFile(FRONTEND_FILE);
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
        return;
      }

      const match = matchRoute(req.method, pathname);
      if (!match) return sendJson(res, 404, { fel: 'Sökvägen finns inte.' });

      const body = ['POST', 'PATCH', 'PUT'].includes(req.method) ? await readJsonBody(req) : undefined;
      const result = await match.route.handler({ db, now, params: match.params, body });
      sendJson(res, result.status ?? 200, result.body);
    } catch (err) {
      sendError(res, err);
    }
  };
}

function route(method, pattern, handler) {
  const regex = new RegExp('^' + pattern.replace(/:(\w+)/g, '(?<$1>[^/]+)') + '$');
  return { method, regex, handler };
}

function matchRoute(method, pathname) {
  for (const r of ROUTES) {
    if (r.method !== method) continue;
    const m = r.regex.exec(pathname);
    if (m) {
      const params = Object.fromEntries(
        Object.entries(m.groups ?? {}).map(([k, v]) => [k, decodeURIComponent(v)]),
      );
      return { route: r, params };
    }
  }
  return null;
}

async function readJsonBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw new ValidationError({}, 'Begäran är för stor.');
    chunks.push(chunk);
  }
  if (size === 0) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new ValidationError({}, 'Begäran innehåller ogiltig JSON.');
  }
}

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function sendError(res, err) {
  if (err instanceof ValidationError) return sendJson(res, 400, { fel: err.message, faltfel: err.faltfel });
  if (err instanceof NotFoundError) return sendJson(res, 404, { fel: err.message });
  if (err instanceof NotImplementedError) return sendJson(res, 501, { fel: err.message });
  console.error(err);
  return sendJson(res, 500, { fel: 'Något gick fel på servern. Försök igen.' });
}
