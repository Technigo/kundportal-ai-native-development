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

const CASE_EDIT = {
  arendenummer: '2026-3',
  rubrik: 'Logga <b>in</b>',
  beskrivning: 'Fel <b>meddelande</b>',
  kategori: 'Övrigt',
  prioritet: 2,
  status: 'Nytt',
  skapad: '2026-11-02T09:00:00.000Z',
  deadline: '2026-11-30',
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

// docs/API.md (400-svaret) och standardtexten i ValidationError, backend/src/errors.js.
const STATUS_ERROR = 'Ärendet kunde inte sparas. Rätta de markerade fälten.';
const STATUS_FIELD_ERROR = 'Status måste vara en av: Nytt, Pågående, Väntar på kund, Avslutat';
// docs/API.md, valideringstabellen. validateRubrik('') i backend/src/validation/fields.js.
const RUBRIK_FEL = 'Rubrik måste fyllas i';
// docs/API.md. validateKategori i backend/src/validation/fields.js.
const KATEGORI_FEL = 'Kategori måste vara en av kategorierna i listan';
// docs/API.md. validatePrioritet i fields.js, PRIORITET_MIN 1 och PRIORITET_MAX 5 i constants.js.
const PRIORITET_FEL = 'Prioritet måste vara ett heltal från 1 till 5';
// api() i skelettet när fetch kastar: svar med status 0.
const NETWORK_FEL = 'Kunde inte nå servern. Kontrollera att den är igång.';
// formatCreatedAt sätter timeZone Europe/Stockholm. 09:00 UTC är 10:00 där (CET, UTC+1).
const SKAPAD_VISNING = '2026-11-02 10:00';

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

function detailLabels(document, label) {
  return [...document.querySelectorAll('#view-detail dt, #view-detail label')].filter(
    (el) => el.textContent === label,
  );
}

function controlForLabel(document, label) {
  const labels = detailLabels(document, label);
  const labelEl = labels.find((el) => el.tagName === 'LABEL');
  if (labelEl?.htmlFor) {
    const control = document.getElementById(labelEl.htmlFor);
    if (control) return control;
  }
  const dt = labels.find((el) => el.tagName === 'DT');
  return dt?.nextElementSibling?.querySelector('input, textarea, select') ?? null;
}

function detailValue(document, label) {
  const control = controlForLabel(document, label);
  if (control) return control.value;
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
  const form = detail.querySelector('#detail-status-form');
  return {
    detail,
    select: form?.querySelector('select[name="status"]') ?? null,
    button: detail.querySelector('button[form="detail-status-form"]'),
    fieldError: form?.querySelector('[data-error-for="status"]') ?? null,
  };
}

function casePath(arendenummer) {
  return `/api/arenden/${encodeURIComponent(arendenummer)}`;
}

function patchesTo(calls, path) {
  return calls.filter((call) => call.method === 'PATCH' && call.path === path);
}

function setControl(control, value) {
  control.value = value;
  const view = control.ownerDocument.defaultView;
  const eventName = control.tagName === 'SELECT' ? 'change' : 'input';
  control.dispatchEvent(new view.Event(eventName, { bubbles: true }));
}

function resetButton(document) {
  return [...document.querySelectorAll('#view-detail button')].find(
    (button) => button.textContent === 'Återställ',
  );
}

function clickReset(document) {
  const button = resetButton(document);
  expect(button, 'knapp Återställ').toBeTruthy();
  button.click();
}

function editForm(document) {
  const form = document.getElementById('detail-edit-form');
  const button = form
    ? (form.querySelector('button[type="submit"]') ??
      document.querySelector('#view-detail button[form="detail-edit-form"]'))
    : null;
  return {
    form,
    button,
    rubrik: form?.querySelector('[name="rubrik"]'),
    beskrivning: form?.querySelector('[name="beskrivning"]'),
    kategori: form?.querySelector('[name="kategori"]'),
    prioritet: form?.querySelector('[name="prioritet"]'),
    fieldError: (name) => form?.querySelector(`[data-error-for="${name}"]`),
  };
}

function requireEditForm(document) {
  const edit = editForm(document);
  const config = document.defaultView.Portal.PORTAL_CONFIG;
  expect(edit.form, 'redigeringsformulär #detail-edit-form').toBeTruthy();
  expect(edit.rubrik, 'fält rubrik').toBeTruthy();
  expect(edit.beskrivning, 'fält beskrivning').toBeTruthy();
  expect(edit.kategori, 'fält kategori').toBeTruthy();
  expect(edit.prioritet, 'fält prioritet').toBeTruthy();
  expect(edit.button, 'sparknapp för övriga fält').toBeTruthy();
  expect(edit.fieldError('rubrik'), 'fältfel för rubrik').toBeTruthy();
  expect(edit.fieldError('beskrivning'), 'fältfel för beskrivning').toBeTruthy();
  expect(edit.fieldError('kategori'), 'fältfel för kategori').toBeTruthy();
  expect(edit.fieldError('prioritet'), 'fältfel för prioritet').toBeTruthy();
  expect([...edit.kategori.options].map((option) => option.value)).toEqual([...config.KATEGORIER]);
  expect([...edit.prioritet.options].map((option) => option.value)).toEqual(
    config.PRIORITETER.map(String),
  );
  expect(edit.rubrik.value).toBe(CASE_EDIT.rubrik);
  expect(edit.beskrivning.value).toBe(CASE_EDIT.beskrivning);
  expect(edit.kategori.value).toBe(CASE_EDIT.kategori);
  expect(edit.prioritet.value).toBe(String(CASE_EDIT.prioritet));
  expect(document.querySelector('#view-detail [name="deadline"]')).toBeNull();
  expect(document.querySelector('#view-detail [name="arendenummer"]')).toBeNull();
  expect(document.querySelector('#view-detail [name="skapad"]')).toBeNull();
  return edit;
}

function expectDetailError(document, text) {
  const dialog = document.querySelector('#view-detail .detail-dialog');
  const message = document.getElementById('detail-message');
  const visible = [...dialog.querySelectorAll('.detail-message, .detail-edit-message')].filter(
    (el) => !el.hidden,
  );
  expect(dialog.contains(message), 'felrutan ligger i dialogen').toBe(true);
  expect(message.hidden).toBe(false);
  expect(message.textContent).toBe(text);
  expect(message.dataset.kind).toBe('error');
  expect(visible).toEqual([message]);
  expect(document.getElementById('global-message').hidden).toBe(true);
}

function expectFieldState(edit, name, { value, message }) {
  expect(edit[name].value).toBe(value);
  const slot = edit.fieldError(name);
  expect(slot, `fältfel för ${name}`).toBeTruthy();
  expect(slot.textContent).toBe(message);
  expect(edit[name].getAttribute('aria-invalid')).toBe(message ? 'true' : null);
}

async function loadEdit(handlePatch) {
  const { calls, stub } = createFetch(async (request) => {
    if (request.method === 'GET' && request.path === '/api/arenden') {
      return jsonResponse(200, [CASE_EDIT]);
    }
    if (request.method === 'GET' && request.path === casePath(CASE_EDIT.arendenummer)) {
      return jsonResponse(200, CASE_EDIT);
    }
    if (handlePatch) {
      const custom = await handlePatch(request);
      if (custom != null) return custom;
    }
    return null;
  });
  const window = await loadPage(stub);
  await openDetail(window.document, CASE_EDIT.arendenummer);
  return { window, document: window.document, calls };
}

async function saveEdit(edit) {
  edit.button.click();
  await flushView();
}

async function openEditAndStatusCase() {
  return loadEdit(async ({ method, path }) => {
    if (method !== 'PATCH') return null;
    if (path === statusPath(CASE_EDIT.arendenummer)) {
      return jsonResponse(400, {
        fel: STATUS_ERROR,
        faltfel: { status: STATUS_FIELD_ERROR },
      });
    }
    if (path === casePath(CASE_EDIT.arendenummer)) {
      return jsonResponse(400, { fel: STATUS_ERROR, faltfel: { rubrik: RUBRIK_FEL } });
    }
    return null;
  });
}

async function failStatus(document) {
  const status = statusForm(document);
  const invalidStatus = 'Stängd';
  status.select.append(new document.defaultView.Option(invalidStatus, invalidStatus));
  chooseStatus(status.select, invalidStatus);
  status.button.click();
  await flushView();
}

async function failRubrik(document) {
  const edit = requireEditForm(document);
  setControl(edit.rubrik, '');
  await saveEdit(edit);
}

function expectEditAndStatusErrors(document) {
  const edit = editForm(document);
  const status = statusForm(document);
  expectFieldState(edit, 'rubrik', { value: '', message: RUBRIK_FEL });
  expect(status.fieldError, 'fältfel för status').toBeTruthy();
  expect(status.fieldError.textContent).toBe(STATUS_FIELD_ERROR);
  expect(status.select.getAttribute('aria-invalid')).toBe('true');
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

    await openDetail(document, CASE_B.arendenummer);

    const detail = document.getElementById('view-detail');
    expect(detail.hidden, 'detaljvyn ska visas').toBe(false);
    for (const label of ['Rubrik', 'Beskrivning', 'Kategori', 'Prioritet']) {
      const found = detailLabels(document, label);
      expect(found, label).toHaveLength(1);
      expect(found[0].tagName, label).toBe('LABEL');
    }

    const edit = editForm(document);
    expect(edit.rubrik.value).toBe(CASE_B.rubrik);
    expect(edit.beskrivning.value).toBe(CASE_B.beskrivning);
    expect(edit.kategori.value).toBe(CASE_B.kategori);
    expect(edit.prioritet.value).toBe(String(CASE_B.prioritet));
    expect(statusForm(document).select.value).toBe(CASE_B.status);
    expect(detailValue(document, 'Ärendenummer')).toBe(CASE_B.arendenummer);
    // 2026-11-03T10:00:00.000Z är 11:00 i Stockholm (CET, UTC+1).
    expect(detailValue(document, 'Skapad')).toBe('2026-11-03 11:00');
    expect(detailValue(document, 'Deadline')).toBe(CASE_B.deadline);
    expect(detail.textContent).not.toContain(CASE_B.skapad);
    expect(detail.textContent).not.toContain(CASE_A.rubrik);
    expect(detail.textContent).not.toContain(CASE_A.beskrivning);
  });
  it('AK12: statusbyte skickas till servern och ny status visas', async () => {
    const updated = { ...CASE_A, status: 'Pågående' };
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
    const edit = editForm(document);
    expect(edit.rubrik.value).toBe(CASE_A.rubrik);
    expect(edit.beskrivning.value).toBe(CASE_A.beskrivning);
    expect(edit.kategori.value).toBe(CASE_A.kategori);
    expect(edit.prioritet.value).toBe(String(CASE_A.prioritet));
    expect(listField(document, CASE_A.arendenummer, 'rubrik')).toBe(CASE_A.rubrik);
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

  it('AK14: sparad ändring av kategori och prioritet visas och övriga fält är oförändrade', async () => {
    const updated = {
      ...CASE_EDIT,
      kategori: 'Ersättning och stöd',
      prioritet: 4,
    };
    const { document, calls } = await loadEdit(async ({ method, path }) => {
      if (method === 'PATCH' && path === casePath(CASE_EDIT.arendenummer)) {
        return jsonResponse(200, updated);
      }
      return null;
    });
    const edit = requireEditForm(document);
    setControl(edit.kategori, 'Ersättning och stöd');
    setControl(edit.prioritet, '4');
    await saveEdit(edit);

    const patches = patchesTo(calls, casePath(CASE_EDIT.arendenummer));
    expect(patches).toHaveLength(1);
    expect(patches[0].body).toEqual({ kategori: 'Ersättning och stöd', prioritet: 4 });

    const after = editForm(document);
    expect(after.kategori.value).toBe('Ersättning och stöd');
    expect(after.prioritet.value).toBe('4');
    expect(after.rubrik.value).toBe(CASE_EDIT.rubrik);
    expect(after.beskrivning.value).toBe(CASE_EDIT.beskrivning);
    expect(detailValue(document, 'Ärendenummer')).toBe(CASE_EDIT.arendenummer);
    expect(detailValue(document, 'Skapad')).toBe(SKAPAD_VISNING);
    expect(detailValue(document, 'Deadline')).toBe(CASE_EDIT.deadline);
    expect(statusForm(document).select.value).toBe(CASE_EDIT.status);
    expect(listField(document, CASE_EDIT.arendenummer, 'prioritet')).toBe('4');
    expect(listField(document, CASE_EDIT.arendenummer, 'rubrik')).toBe(CASE_EDIT.rubrik);
    expect(listField(document, CASE_EDIT.arendenummer, 'deadline')).toBe(CASE_EDIT.deadline);
    expect(listStatus(document, CASE_EDIT.arendenummer)).toBe(CASE_EDIT.status);
    expect(document.getElementById('global-message').hidden).toBe(true);

    setControl(after.kategori, 'Jobb och sökning');
    clickReset(document);
    expect(editForm(document).kategori.value).toBe('Ersättning och stöd');
    expect(patchesTo(calls, casePath(CASE_EDIT.arendenummer))).toHaveLength(1);
  });

  it('AK14: rubrik och beskrivning med taggar visas som text', async () => {
    const { document } = await loadEdit(async ({ method, path }) => {
      if (method === 'PATCH' && path === casePath(CASE_EDIT.arendenummer)) {
        return jsonResponse(200, {
          ...CASE_EDIT,
          kategori: 'Ersättning och stöd',
          prioritet: 4,
        });
      }
      return null;
    });
    const edit = requireEditForm(document);
    setControl(edit.kategori, 'Ersättning och stöd');
    setControl(edit.prioritet, '4');
    await saveEdit(edit);

    const after = editForm(document);
    expect(after.rubrik.value).toBe(CASE_EDIT.rubrik);
    expect(after.beskrivning.value).toBe(CASE_EDIT.beskrivning);
    expect(document.querySelector('#view-detail b')).toBeNull();
    expect(caseRow(document, CASE_EDIT.arendenummer).querySelector('b')).toBeNull();
    expect(listField(document, CASE_EDIT.arendenummer, 'rubrik')).toBe(CASE_EDIT.rubrik);
  });

  it('AK15: tom rubrik avvisas, inmatningen står kvar och sparade värden är oförändrade', async () => {
    const { document, calls } = await loadEdit(async ({ method, path }) => {
      if (method === 'PATCH' && path === casePath(CASE_EDIT.arendenummer)) {
        return jsonResponse(400, { fel: STATUS_ERROR, faltfel: { rubrik: RUBRIK_FEL } });
      }
      return null;
    });
    const edit = requireEditForm(document);
    setControl(edit.rubrik, '');
    await saveEdit(edit);

    expect(patchesTo(calls, casePath(CASE_EDIT.arendenummer))).toEqual([
      { method: 'PATCH', path: casePath(CASE_EDIT.arendenummer), body: { rubrik: '' } },
    ]);
    const again = editForm(document);
    expectFieldState(again, 'rubrik', { value: '', message: RUBRIK_FEL });
    expectFieldState(again, 'kategori', { value: CASE_EDIT.kategori, message: '' });
    expectFieldState(again, 'prioritet', { value: String(CASE_EDIT.prioritet), message: '' });
    expect(listField(document, CASE_EDIT.arendenummer, 'rubrik')).toBe(CASE_EDIT.rubrik);
    expect(listField(document, CASE_EDIT.arendenummer, 'prioritet')).toBe(
      String(CASE_EDIT.prioritet),
    );
    expectDetailError(document, STATUS_ERROR);
  });

  it('AK15: simulerat serversvar med flera fältfel visas vid rätt fält', async () => {
    // Klienten skickar giltig kategori och prioritet 4. Prioritet 6 och okänd kategori
    // går inte att välja, så faltfel för dem kommer från mocken.
    const typed = { rubrik: 'Ny rubrik', kategori: 'Ersättning och stöd', prioritet: 4 };
    const { document, calls } = await loadEdit(async ({ method, path }) => {
      if (method === 'PATCH' && path === casePath(CASE_EDIT.arendenummer)) {
        return jsonResponse(400, {
          fel: STATUS_ERROR,
          faltfel: { rubrik: RUBRIK_FEL, kategori: KATEGORI_FEL, prioritet: PRIORITET_FEL },
        });
      }
      return null;
    });
    const edit = requireEditForm(document);
    setControl(edit.rubrik, typed.rubrik);
    setControl(edit.kategori, typed.kategori);
    setControl(edit.prioritet, String(typed.prioritet));
    await saveEdit(edit);

    expect(patchesTo(calls, casePath(CASE_EDIT.arendenummer))[0].body).toEqual(typed);
    const again = editForm(document);
    expectFieldState(again, 'rubrik', { value: typed.rubrik, message: RUBRIK_FEL });
    expectFieldState(again, 'kategori', { value: typed.kategori, message: KATEGORI_FEL });
    expectFieldState(again, 'prioritet', {
      value: String(typed.prioritet),
      message: PRIORITET_FEL,
    });
    expect(listField(document, CASE_EDIT.arendenummer, 'rubrik')).toBe(CASE_EDIT.rubrik);
    expect(listField(document, CASE_EDIT.arendenummer, 'prioritet')).toBe(
      String(CASE_EDIT.prioritet),
    );
    expectDetailError(document, STATUS_ERROR);
  });

  it('AK16: ärendenummer och skapad är text, går inte att redigera och skickas inte med', async () => {
    const { document, calls } = await loadEdit(async ({ method, path }) => {
      if (method === 'PATCH' && path === casePath(CASE_EDIT.arendenummer)) {
        return jsonResponse(200, {
          ...CASE_EDIT,
          kategori: 'Ersättning och stöd',
          prioritet: 4,
        });
      }
      return null;
    });
    const detail = document.getElementById('view-detail');
    expect(detail.querySelector('[contenteditable="true"]')).toBeNull();
    expect(detailValue(document, 'Ärendenummer')).toBe(CASE_EDIT.arendenummer);
    expect(detailValue(document, 'Skapad')).toBe(SKAPAD_VISNING);

    const edit = requireEditForm(document);
    setControl(edit.kategori, 'Ersättning och stöd');
    setControl(edit.prioritet, '4');
    await saveEdit(edit);

    const patch = patchesTo(calls, casePath(CASE_EDIT.arendenummer))[0];
    expect(patch.body).toEqual({ kategori: 'Ersättning och stöd', prioritet: 4 });
    expect(patch.body).not.toHaveProperty('arendenummer');
    expect(patch.body).not.toHaveProperty('skapad');
    expect(patch.body).not.toHaveProperty('deadline');
    expect(detailValue(document, 'Ärendenummer')).toBe(CASE_EDIT.arendenummer);
    expect(detailValue(document, 'Skapad')).toBe(SKAPAD_VISNING);
  });

  it('oförändrade fält skickar inget PATCH', async () => {
    // docs/API.md: kroppen för PATCH /api/arenden/:arendenummer är "de fält som ändras".
    // Ett anrop utan ändrade fält beskrivs inte, därför skickas inget PATCH.
    const { document, calls } = await loadEdit();
    const edit = requireEditForm(document);
    await saveEdit(edit);

    expect(calls.filter((call) => call.method === 'PATCH')).toHaveLength(0);
    expect(detailValue(document, 'Kategori')).toBe(CASE_EDIT.kategori);
    expect(detailValue(document, 'Prioritet')).toBe(String(CASE_EDIT.prioritet));
    expect(detailValue(document, 'Deadline')).toBe(CASE_EDIT.deadline);
  });

  it('nätverksfel (status 0) visas och inget visas som sparat', async () => {
    const typed = { beskrivning: 'Ny beskrivning', kategori: 'Ersättning och stöd' };
    const { document, calls } = await loadEdit(async ({ method, path }) => {
      if (method === 'PATCH' && path === casePath(CASE_EDIT.arendenummer)) {
        throw new Error('nätverk');
      }
      return null;
    });
    const edit = requireEditForm(document);
    setControl(edit.beskrivning, typed.beskrivning);
    setControl(edit.kategori, typed.kategori);
    await saveEdit(edit);

    expect(patchesTo(calls, casePath(CASE_EDIT.arendenummer))).toHaveLength(1);
    expectDetailError(document, NETWORK_FEL);
    const again = editForm(document);
    expect(again.beskrivning.value).toBe(typed.beskrivning);
    expect(again.kategori.value).toBe(typed.kategori);
    expect(again.rubrik.value).toBe(CASE_EDIT.rubrik);
    expect(again.prioritet.value).toBe(String(CASE_EDIT.prioritet));
    expect(again.button.disabled).toBe(false);
    expect(listField(document, CASE_EDIT.arendenummer, 'rubrik')).toBe(CASE_EDIT.rubrik);
    expect(listField(document, CASE_EDIT.arendenummer, 'prioritet')).toBe(
      String(CASE_EDIT.prioritet),
    );
    expect(listStatus(document, CASE_EDIT.arendenummer)).toBe(CASE_EDIT.status);

    clickReset(document);
    const restored = editForm(document);
    expect(restored.rubrik.value).toBe(CASE_EDIT.rubrik);
    expect(restored.beskrivning.value).toBe(CASE_EDIT.beskrivning);
    expect(restored.kategori.value).toBe(CASE_EDIT.kategori);
    expect(restored.prioritet.value).toBe(String(CASE_EDIT.prioritet));
    expect(document.getElementById('detail-message').hidden).toBe(true);
    expect(patchesTo(calls, casePath(CASE_EDIT.arendenummer))).toHaveLength(1);
  });

  it('Återställ efter 400 återställer alla fyra fälten och rör inte status eller lista', async () => {
    const typed = { beskrivning: 'Ny beskrivning', kategori: 'Ersättning och stöd' };
    const { document, calls } = await loadEdit(async ({ method, path }) => {
      if (method === 'PATCH' && path === casePath(CASE_EDIT.arendenummer)) {
        return jsonResponse(400, { fel: STATUS_ERROR, faltfel: { kategori: KATEGORI_FEL } });
      }
      return null;
    });
    const edit = requireEditForm(document);
    setControl(edit.beskrivning, typed.beskrivning);
    setControl(edit.kategori, typed.kategori);
    await saveEdit(edit);

    const draft = editForm(document);
    expect(draft.beskrivning.value).toBe(typed.beskrivning);
    expect(draft.kategori.value).toBe(typed.kategori);

    clickReset(document);

    const restored = editForm(document);
    expect(restored.rubrik.value).toBe(CASE_EDIT.rubrik);
    expect(restored.beskrivning.value).toBe(CASE_EDIT.beskrivning);
    expect(restored.kategori.value).toBe(CASE_EDIT.kategori);
    expect(restored.prioritet.value).toBe(String(CASE_EDIT.prioritet));
    expect(patchesTo(calls, casePath(CASE_EDIT.arendenummer))).toEqual([
      { method: 'PATCH', path: casePath(CASE_EDIT.arendenummer), body: typed },
    ]);
    expect(statusForm(document).select.value).toBe(CASE_EDIT.status);
    expect(listField(document, CASE_EDIT.arendenummer, 'rubrik')).toBe(CASE_EDIT.rubrik);
    expect(listField(document, CASE_EDIT.arendenummer, 'prioritet')).toBe(
      String(CASE_EDIT.prioritet),
    );
    expect(listField(document, CASE_EDIT.arendenummer, 'deadline')).toBe(CASE_EDIT.deadline);
    expect(listStatus(document, CASE_EDIT.arendenummer)).toBe(CASE_EDIT.status);
  });

  it('Återställ efter 400 rensar rubrikens fältfel och detaljmeddelandet', async () => {
    const { document } = await loadEdit(async ({ method, path }) => {
      if (method === 'PATCH' && path === casePath(CASE_EDIT.arendenummer)) {
        return jsonResponse(400, { fel: STATUS_ERROR, faltfel: { rubrik: RUBRIK_FEL } });
      }
      return null;
    });
    const edit = requireEditForm(document);
    setControl(edit.rubrik, '');
    await saveEdit(edit);

    expectFieldState(editForm(document), 'rubrik', { value: '', message: RUBRIK_FEL });
    expectDetailError(document, STATUS_ERROR);

    clickReset(document);

    const restored = editForm(document);
    expectFieldState(restored, 'rubrik', { value: CASE_EDIT.rubrik, message: '' });
    expect(document.getElementById('detail-message').hidden).toBe(true);
    expect(document.getElementById('detail-message').textContent).toBe('');
  });

  it('Återställ rensar meddelandet Statusen är ändrad.', async () => {
    const { document } = await loadEdit(async ({ method, path }) => {
      if (method === 'PATCH' && path === statusPath(CASE_EDIT.arendenummer)) {
        return jsonResponse(200, { ...CASE_EDIT, status: 'Pågående' });
      }
      return null;
    });
    const status = statusForm(document);
    chooseStatus(status.select, 'Pågående');
    status.button.click();
    await flushView();

    const message = document.getElementById('detail-message');
    expect(message.hidden).toBe(false);
    expect(message.textContent).toBe('Statusen är ändrad.');
    clickReset(document);
    expect(document.getElementById('detail-message').hidden).toBe(true);
  });

  it('Återställ är inaktiv medan en sparning pågår', async () => {
    let release;
    const gate = new Promise((resolve) => {
      release = resolve;
    });
    try {
      const pending = await loadEdit(async ({ method, path }) => {
        if (method !== 'PATCH' || path !== casePath(CASE_EDIT.arendenummer)) return null;
        await gate;
        return jsonResponse(200, { ...CASE_EDIT, kategori: 'Jobb och sökning' });
      });
      const edit = requireEditForm(pending.document);
      const reset = resetButton(pending.document);
      expect(reset, 'knapp Återställ').toBeTruthy();
      setControl(edit.kategori, 'Jobb och sökning');
      edit.button.click();
      expect(reset.disabled).toBe(true);
      release();
      await flushView();
    } finally {
      release();
    }
  });

  it('Robusthet: ett pågående sparande skickas bara en gång och knappen är aktiv efter 400 och status 0', async () => {
    let release;
    const gate = new Promise((resolve) => {
      release = resolve;
    });
    try {
      const pending = await loadEdit(async ({ method, path }) => {
        if (method !== 'PATCH' || path !== casePath(CASE_EDIT.arendenummer)) return null;
        await gate;
        return jsonResponse(200, { ...CASE_EDIT, kategori: 'Jobb och sökning' });
      });
      const edit = requireEditForm(pending.document);
      setControl(edit.kategori, 'Jobb och sökning');
      edit.button.click();
      edit.form.dispatchEvent(
        new pending.document.defaultView.Event('submit', { bubbles: true, cancelable: true }),
      );
      expect(patchesTo(pending.calls, casePath(CASE_EDIT.arendenummer))).toHaveLength(1);
      release();
      await flushView();
    } finally {
      release();
    }

    const rejected = await loadEdit(async ({ method, path }) => {
      if (method === 'PATCH' && path === casePath(CASE_EDIT.arendenummer)) {
        return jsonResponse(400, { fel: STATUS_ERROR, faltfel: { rubrik: RUBRIK_FEL } });
      }
      return null;
    });
    const rejectedEdit = requireEditForm(rejected.document);
    setControl(rejectedEdit.rubrik, 'Rättad rubrik');
    await saveEdit(rejectedEdit);
    const afterReject = editForm(rejected.document);
    expect(afterReject.button.disabled).toBe(false);
    expect(afterReject.rubrik.value).toBe('Rättad rubrik');
    await saveEdit(afterReject);
    expect(patchesTo(rejected.calls, casePath(CASE_EDIT.arendenummer))).toHaveLength(2);

    const offline = await loadEdit(async ({ method, path }) => {
      if (method === 'PATCH' && path === casePath(CASE_EDIT.arendenummer)) {
        throw new Error('nätverk');
      }
      return null;
    });
    const offlineEdit = requireEditForm(offline.document);
    setControl(offlineEdit.kategori, 'Jobb och sökning');
    await saveEdit(offlineEdit);
    const afterOffline = editForm(offline.document);
    expect(afterOffline.button.disabled).toBe(false);
    expect(afterOffline.kategori.value).toBe('Jobb och sökning');
    await saveEdit(afterOffline);
    expect(patchesTo(offline.calls, casePath(CASE_EDIT.arendenummer))).toHaveLength(2);
  });

  it('ett allmänt fel ersätter det förra och rensas när nästa sparning startar', async () => {
    const statusFel = 'Statusen kunde inte ändras.';
    let hold = false;
    let release = () => {};
    let gate = Promise.resolve();
    const { document } = await loadEdit(async ({ method, path }) => {
      if (method === 'PATCH' && path === statusPath(CASE_EDIT.arendenummer)) {
        return jsonResponse(400, { fel: statusFel, faltfel: { status: STATUS_FIELD_ERROR } });
      }
      if (method === 'PATCH' && path === casePath(CASE_EDIT.arendenummer)) {
        if (hold) await gate;
        return jsonResponse(400, { fel: STATUS_ERROR, faltfel: { rubrik: RUBRIK_FEL } });
      }
      return null;
    });

    await failStatus(document);
    expectDetailError(document, statusFel);
    await failRubrik(document);
    expectDetailError(document, STATUS_ERROR);

    await failStatus(document);
    expectDetailError(document, statusFel);

    hold = true;
    gate = new Promise((resolve) => {
      release = resolve;
    });
    const edit = editForm(document);
    setControl(edit.rubrik, 'Ny rubrik');
    edit.button.click();
    expect(document.getElementById('detail-message').hidden).toBe(true);
    release();
    await flushView();
    expectDetailError(document, STATUS_ERROR);
  });

  it('fältfel i redigering rensar inte statusfel', async () => {
    const { document } = await openEditAndStatusCase();
    await failStatus(document);
    expect(statusForm(document).fieldError.textContent).toBe(STATUS_FIELD_ERROR);
    await failRubrik(document);
    expectEditAndStatusErrors(document);
  });

  it('fältfel i status rensar inte redigeringsfel', async () => {
    const { document } = await openEditAndStatusCase();
    await failRubrik(document);
    expect(editForm(document).fieldError('rubrik').textContent).toBe(RUBRIK_FEL);
    await failStatus(document);
    expectEditAndStatusErrors(document);
  });
});
