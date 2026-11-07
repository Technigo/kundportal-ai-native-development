// ÄGARE: Del 4 (Frontend – lista, detalj, status och redigering)   AK10–AK16, gränssnittssidan
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

const CASE_A = {
  arendenummer: '2026-1',
  rubrik: 'Kan inte logga in',
  beskrivning: 'Kunden får felmeddelande vid inloggning.',
  kategori: 'Digital tjänst och inloggning',
  prioritet: 3,
  status: 'Nytt',
  skapad: '2026-11-02T09:00:00.000Z',
  deadline: '2026-11-30',
};

const CASE_B = {
  arendenummer: '2026-2',
  rubrik: 'Saknar aktivitetsrapport',
  beskrivning: 'Kunden undrar hur rapporten skickas in.',
  kategori: 'Aktivitetsrapport',
  prioritet: 2,
  status: 'Pågående',
  skapad: '2026-11-03T10:00:00.000Z',
  deadline: '2026-12-01',
};

function jsonResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  };
}

async function flushView() {
  // onShowListView / onShowDetailView är async (api/fetch) – vänta tills vyn hunnit ritas.
  await new Promise((resolve) => setTimeout(resolve, 0));
  await new Promise((resolve) => setTimeout(resolve, 0));
}

async function loadPage(fetchStub) {
  const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    url: 'http://localhost/',
    beforeParse(window) {
      window.fetch = fetchStub;
    },
  });
  await new Promise((resolve) => dom.window.addEventListener('load', resolve));
  await flushView();
  return dom.window;
}

function requestPath(url) {
  return new URL(String(url), 'http://localhost').pathname;
}

function listText(document) {
  return document.getElementById('view-list').textContent;
}

function caseRow(document, arendenummer) {
  return [...document.querySelectorAll('#case-list tbody tr')].find((tr) =>
    tr.textContent.includes(arendenummer),
  );
}

function pressKey(window, element, key) {
  element.dispatchEvent(
    new window.KeyboardEvent('keydown', {
      key,
      bubbles: true,
      cancelable: true,
    }),
  );
}

function detailFetch(url) {
  const path = requestPath(url);
  if (path === '/api/arenden') return jsonResponse(200, [CASE_A, CASE_B]);
  if (path === `/api/arenden/${CASE_B.arendenummer}`) return jsonResponse(200, CASE_B);
  if (path === `/api/arenden/${CASE_A.arendenummer}`) return jsonResponse(200, CASE_A);
  return jsonResponse(404, { fel: 'Sökvägen finns inte.' });
}

const STATUS_ERROR = 'Ärendet kunde inte sparas. Rätta de markerade fälten.';
const STATUS_FIELD_ERROR = 'Status måste vara en av: Nytt, Pågående, Väntar på kund, Avslutat';

function createFetch(handle) {
  const calls = [];
  const stub = async (url, options = {}) => {
    const path = requestPath(url);
    const method = options.method || 'GET';
    const body = options.body === undefined ? undefined : JSON.parse(options.body);
    calls.push({ method, path, body });
    const custom = await handle({ method, path, body });
    if (custom != null) return custom;
    if (path === '/api/arenden') return jsonResponse(200, [CASE_A, CASE_B]);
    if (path === `/api/arenden/${CASE_A.arendenummer}`) return jsonResponse(200, CASE_A);
    if (path === `/api/arenden/${CASE_B.arendenummer}`) return jsonResponse(200, CASE_B);
    return jsonResponse(404, { fel: 'Sökvägen finns inte.' });
  };
  return { calls, stub };
}

function detailValue(document, label) {
  const dt = [...document.querySelectorAll('#view-detail dt')].find(
    (el) => el.textContent === label,
  );
  return dt?.nextElementSibling?.textContent;
}

function listField(document, arendenummer, field) {
  const row = caseRow(document, arendenummer);
  return row?.querySelector(`td[data-field="${field}"] .case-clip`)?.textContent;
}

function listStatus(document, arendenummer) {
  return listField(document, arendenummer, 'status');
}

function statusForm(document) {
  const detail = document.getElementById('view-detail');
  return {
    detail,
    select: detail.querySelector('select[name="status"]'),
    button: [...detail.querySelectorAll('button')].find((el) => el.textContent.trim() === 'Spara'),
    fieldError: detail.querySelector('[data-error-for="status"]'),
  };
}

async function openDetail(document, arendenummer) {
  const row = caseRow(document, arendenummer);
  expect(row, 'raden för valt ärende').toBeTruthy();
  (row.querySelector('button, a') ?? row).click();
  await flushView();
}

function statusPath(arendenummer) {
  return `/api/arenden/${encodeURIComponent(arendenummer)}/status`;
}

function chooseStatus(select, value) {
  select.value = value;
  select.dispatchEvent(new select.ownerDocument.defaultView.Event('change', { bubbles: true }));
}

describe('Ärendelistan och detaljvyn', () => {
  it('AK10: alla ärenden från servern visas i listan', async () => {
    const { document } = await loadPage(async (url) => {
      if (String(url).includes('/api/arenden')) return jsonResponse(200, [CASE_A, CASE_B]);
      return jsonResponse(404, { fel: 'Sökvägen finns inte.' });
    });

    const text = listText(document);
    expect(text).toContain(CASE_A.arendenummer);
    expect(text).toContain(CASE_B.arendenummer);
    expect(text).toContain(CASE_A.rubrik);
    expect(text).toContain(CASE_B.rubrik);
    expect(text).toContain(String(CASE_A.prioritet));
    expect(text).toContain(CASE_A.status);
    expect(text).toContain(CASE_A.deadline);
    expect(text).toContain('Ärendenummer');
    expect(text).toContain('Rubrik');
    expect(text).toContain('Prioritet');
    expect(text).toContain('Status');
    expect(text).toContain('Deadline');
  });

  it('AK10: tom lista visar ett begripligt meddelande', async () => {
    const { document } = await loadPage(async () => jsonResponse(200, []));
    expect(listText(document)).toContain('Inga ärenden ännu.');
  });

  it('AK10: fel från servern visas och listan kraschar inte', async () => {
    const { document } = await loadPage(async () => {
      throw new Error('nätverk');
    });
    const msg = document.getElementById('global-message');
    expect(msg.hidden).toBe(false);
    expect(msg.textContent).toContain('Kunde inte nå servern');
    expect(document.getElementById('view-list')).toBeTruthy();
  });

  it('AK11: klick på ett ärende visar alla åtta fält', async () => {
    const { document } = await loadPage(async (url) => {
      const path = requestPath(url);
      if (path === '/api/arenden') return jsonResponse(200, [CASE_A, CASE_B]);
      if (path === `/api/arenden/${CASE_B.arendenummer}`) return jsonResponse(200, CASE_B);
      return jsonResponse(404, { fel: 'Sökvägen finns inte.' });
    });

    expect(document.getElementById('view-list').hidden).toBe(false);
    expect(listText(document)).toContain(CASE_A.arendenummer);
    expect(listText(document)).toContain(CASE_B.arendenummer);

    const row = [...document.querySelectorAll('#case-list tbody tr')].find((tr) =>
      tr.textContent.includes(CASE_B.arendenummer),
    );
    expect(row, 'raden för valt ärende').toBeTruthy();
    (row.querySelector('button, a') ?? row).click();
    await flushView();

    const detail = document.getElementById('view-detail');
    expect(detail.hidden, 'detaljvyn ska visas').toBe(false);
    const text = detail.textContent;
    expect(text).toContain(CASE_B.arendenummer);
    expect(text).toContain(CASE_B.rubrik);
    expect(text).toContain(CASE_B.beskrivning);
    expect(text).toContain(CASE_B.kategori);
    expect(text).toContain(CASE_B.status);
    // 2026-11-03T10:00:00.000Z är 11:00 i Stockholm (CET, UTC+1).
    expect(text).toContain('2026-11-03 11:00');
    expect(text).not.toContain(CASE_B.skapad);
    expect(text).toContain(CASE_B.deadline);
    expect(text).not.toContain(CASE_A.rubrik);
    expect(text).not.toContain(CASE_A.beskrivning);

    const withoutOtherFields = [
      CASE_B.arendenummer,
      CASE_B.rubrik,
      CASE_B.beskrivning,
      CASE_B.kategori,
      CASE_B.status,
      '2026-11-03 11:00',
      CASE_B.deadline,
    ].reduce((acc, value) => acc.replaceAll(String(value), ''), text);
    expect(withoutOtherFields).toContain(String(CASE_B.prioritet));
  });
  it('AK12: statusbyte skickas till servern och ny status visas', async () => {
    const updated = {
      ...CASE_A,
      status: 'Pågående',
      rubrik: 'Rubrik <em>från servern</em>',
    };
    const { calls, stub } = createFetch(async ({ method, path, body }) => {
      if (method === 'PATCH' && path === statusPath(CASE_A.arendenummer)) {
        expect(body).toEqual({ status: 'Pågående' });
        return jsonResponse(200, updated);
      }
      return null;
    });
    const window = await loadPage(stub);
    const { document } = window;
    await openDetail(document, CASE_A.arendenummer);

    const { select, button, fieldError } = statusForm(document);
    expect(select, 'statusdropdown').toBeTruthy();
    expect(button, 'bekräftelseknapp').toBeTruthy();
    expect(fieldError, 'fältfel för status').toBeTruthy();
    expect([...select.options].map((option) => option.value)).toEqual([
      ...window.Portal.PORTAL_CONFIG.STATUSAR,
    ]);
    expect(select.value).toBe('Nytt');
    expect(listStatus(document, CASE_A.arendenummer)).toBe('Nytt');

    chooseStatus(select, 'Pågående');
    button.click();
    await flushView();

    const patches = calls.filter((call) => call.method === 'PATCH');
    expect(patches).toHaveLength(1);
    expect(patches[0].path).toBe(statusPath(CASE_A.arendenummer));
    expect(patches[0].body).toEqual({ status: 'Pågående' });
    expect(statusForm(document).select.value).toBe('Pågående');
    expect(detailValue(document, 'Rubrik')).toBe(updated.rubrik);
    expect(detailValue(document, 'Beskrivning')).toBe(CASE_A.beskrivning);
    expect(listField(document, CASE_A.arendenummer, 'rubrik')).toBe(updated.rubrik);
    expect(listStatus(document, CASE_A.arendenummer)).toBe('Pågående');

    const message = document.getElementById('detail-message');
    expect(message.hidden).toBe(false);
    expect(message.dataset.kind).toBe('ok');
    expect(message.textContent).toBe('Statusen är ändrad.');
    expect(document.getElementById('global-message').hidden).toBe(true);
  });

  it('AK12: ett pågående statusbyte skickas bara en gång', async () => {
    let release;
    const gate = new Promise((resolve) => {
      release = resolve;
    });
    const updated = { ...CASE_A, status: 'Pågående' };
    const { calls, stub } = createFetch(async ({ method }) => {
      if (method !== 'PATCH') return null;
      await gate;
      return jsonResponse(200, updated);
    });

    try {
      const { document } = await loadPage(stub);
      await openDetail(document, CASE_A.arendenummer);
      const { select, button } = statusForm(document);
      expect(select, 'statusdropdown').toBeTruthy();
      expect(button, 'bekräftelseknapp').toBeTruthy();
      chooseStatus(select, 'Pågående');
      button.click();
      select.form.dispatchEvent(
        new document.defaultView.Event('submit', { bubbles: true, cancelable: true }),
      );

      expect(calls.filter((call) => call.method === 'PATCH')).toHaveLength(1);
      release();
      await flushView();
      expect(listStatus(document, CASE_A.arendenummer)).toBe('Pågående');
    } finally {
      release();
    }
  });

  it('AK13: serverns felmeddelande vid ogiltig status visas och gamla statusen visas kvar', async () => {
    const { calls, stub } = createFetch(async ({ method }) => {
      if (method !== 'PATCH') return null;
      return jsonResponse(400, {
        fel: STATUS_ERROR,
        faltfel: { status: STATUS_FIELD_ERROR },
      });
    });
    const { document } = await loadPage(stub);
    await openDetail(document, CASE_A.arendenummer);

    const { select, button } = statusForm(document);
    expect(select, 'statusdropdown').toBeTruthy();
    expect(button, 'bekräftelseknapp').toBeTruthy();
    const invalidStatus = 'Stängd';
    select.append(new document.defaultView.Option(invalidStatus, invalidStatus));
    chooseStatus(select, invalidStatus);
    button.click();
    await flushView();

    const patches = calls.filter((call) => call.method === 'PATCH');
    expect(patches).toHaveLength(1);
    expect(patches[0].path).toBe(statusPath(CASE_A.arendenummer));
    expect(patches[0].body).toEqual({ status: invalidStatus });

    const message = document.getElementById('detail-message');
    expect(message.hidden).toBe(false);
    expect(message.dataset.kind).toBe('error');
    expect(message.textContent).toBe(STATUS_ERROR);
    expect(document.getElementById('global-message').hidden).toBe(true);
    const form = statusForm(document);
    expect(form.fieldError.textContent).toBe(STATUS_FIELD_ERROR);
    expect(form.select.getAttribute('aria-invalid')).toBe('true');
    expect(form.select.value).toBe('Nytt');
    expect(listStatus(document, CASE_A.arendenummer)).toBe('Nytt');
    expect(detailValue(document, 'Rubrik')).toBe(CASE_A.rubrik);
  });

  it.todo('AK14: sparad ändring av kategori/prioritet visas i detaljvyn');
  it.todo('AK15: serverns fältfel visas vid rätt fält vid ogiltig ändring');
});
