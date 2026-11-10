
// ÄGARE: Del 3 (Frontend – registreringsformuläret)   AK1–AK8, gränssnittssidan
// Laddar index.html i jsdom med en låtsas-fetch (samma sätt som smoke.test.js).
import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

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
  return dom.window;
}

// Låtsas-server: GET /api/arenden (listan som laddas vid start) ger en tom lista,
// POST /api/arenden ger det svar testet ber om.
function makeFetch(postResponse) {
  return vi.fn(async (url, options = {}) => {
    if (options.method === 'POST') return postResponse;
    return { ok: true, status: 200, json: async () => [] };
  });
}

function created201() {
  return {
    ok: true,
    status: 201,
    json: async () => ({
      arendenummer: '2026-3',
      rubrik: 'Kan inte logga in',
      beskrivning: 'Kunden får felmeddelande vid inloggning.',
      kategori: 'Digital tjänst och inloggning',
      prioritet: 3,
      status: 'Nytt',
      deadline: '2026-12-01',
    }),
  };
}

// Svar från låtsas-servern: 400 med fältfel, samma form som docs/API.md.
function badRequest(faltfel) {
  return {
    ok: false,
    status: 400,
    json: async () => ({ fel: 'Ärendet kunde inte sparas.', faltfel }),
  };
}

function errorAt(form, name) {
  return form.querySelector(`[data-error-for="${name}"]`).textContent;
}
function isInvalid(form, name) {
  return form.querySelector(`[name="${name}"]`).getAttribute('aria-invalid') === 'true';
}

// Öppnar formuläret och fyller i alla sex fält som en användare skulle göra.
function fillForm(window) {
  const { document } = window;
  document.querySelector('[data-nav="new"]').click();
  const form = document.querySelector('#view-new form');
  const set = (name, value) => {
    form.querySelector(`[name="${name}"]`).value = value;
  };
  set('rubrik', 'Kan inte logga in');
  set('beskrivning', 'Kunden får felmeddelande vid inloggning.');
  set('kategori', 'Digital tjänst och inloggning');
  set('prioritet', '3');
  set('status', 'Nytt');
  set('deadline', '2026-12-01');
  return form;
}

function submit(window, form) {
  form.dispatchEvent(
    new window.Event('submit', { bubbles: true, cancelable: true }),
  );
}

describe('Registreringsformuläret', () => {
  it('AK1: lyckat svar (201) ger bekräftelse och formuläret nollställs', async () => {
    const fetchStub = makeFetch(created201());
    const window = await loadPage(fetchStub);
    const form = fillForm(window);

    submit(window, form);

    // Bekräftelsen visas i skelettets meddelanderuta, som ett "ok"-meddelande.
    const msg = window.document.getElementById('global-message');
    await vi.waitFor(() => expect(msg.hidden).toBe(false));
    expect(msg.dataset.kind).toBe('ok');
    expect(msg.textContent).toContain('2026-3');

    // Formuläret är tomt igen.
    expect(form.querySelector('[name="rubrik"]').value).toBe('');
    expect(form.querySelector('[name="beskrivning"]').value).toBe('');

    // Rätt anrop skickades: POST /api/arenden, prioritet som tal.
    const postCall = fetchStub.mock.calls.find(([, o]) => o?.method === 'POST');
    expect(postCall[0]).toBe('/api/arenden');
    const body = JSON.parse(postCall[1].body);
    expect(body.rubrik).toBe('Kan inte logga in');
    expect(body.prioritet).toBe(3);
  });

  it('AK2: tomt obligatoriskt fält visar serverns meddelande vid rätt fält', async () => {
    const window = await loadPage(makeFetch(badRequest({ rubrik: 'Rubrik måste fyllas i' })));
    const form = fillForm(window);
    form.querySelector('[name="rubrik"]').value = '';

    submit(window, form);

    await vi.waitFor(() => expect(errorAt(form, 'rubrik')).toBe('Rubrik måste fyllas i'));
    expect(isInvalid(form, 'rubrik')).toBe(true);
    expect(isInvalid(form, 'beskrivning')).toBe(false);
    // Det användaren redan skrivit finns kvar.
    expect(form.querySelector('[name="beskrivning"]').value).toContain('Kunden får');
  });

  it('AK3/AK4: svar om för lång rubrik/beskrivning visas vid rätt fält', async () => {
    const window = await loadPage(
      makeFetch(
        badRequest({
          rubrik: 'Rubrik får vara högst 100 tecken',
          beskrivning: 'Beskrivningen får vara högst 5000 tecken',
        }),
      ),
    );
    const form = fillForm(window);

    submit(window, form);

    await vi.waitFor(() => expect(errorAt(form, 'rubrik')).toContain('100'));
    expect(errorAt(form, 'beskrivning')).toContain('5000');
    expect(errorAt(form, 'deadline')).toBe('');
  });

  it('AK6/AK7: deadline-fel visas vid deadline-fältet', async () => {
    const window = await loadPage(
      makeFetch(badRequest({ deadline: 'Deadline kan inte ligga före dagens datum' })),
    );
    const form = fillForm(window);

    submit(window, form);

    await vi.waitFor(() => expect(errorAt(form, 'deadline')).toContain('dagens datum'));
    expect(isInvalid(form, 'deadline')).toBe(true);
    expect(isInvalid(form, 'rubrik')).toBe(false);
  });

  it('servern nås inte: begripligt meddelande visas, inget kraschar', async () => {
    const fetchStub = vi.fn(async (url, options = {}) => {
      if (options.method === 'POST') throw new Error('nätverk');
      return { ok: true, status: 200, json: async () => [] };
    });
    const window = await loadPage(fetchStub);
    const form = fillForm(window);

    submit(window, form);

    const msg = window.document.getElementById('global-message');
    await vi.waitFor(() => expect(msg.textContent).toContain('Kunde inte nå servern'));
    expect(msg.dataset.kind).toBe('error');
    expect(form.querySelector('[name="rubrik"]').value).toBe('Kan inte logga in');
    expect(form.querySelector('button[type="submit"]').disabled).toBe(false);
  });

  it('AK5: rubrik med bara mellanslag behandlas som tom (samma meddelande som AK2)', async () => {
    const fetchStub = makeFetch(badRequest({ rubrik: 'Rubrik måste fyllas i' }));
    const window = await loadPage(fetchStub);
    const form = fillForm(window);
    form.querySelector('[name="rubrik"]').value = '   ';

    submit(window, form);

    await vi.waitFor(() => expect(errorAt(form, 'rubrik')).toBe('Rubrik måste fyllas i'));
    expect(isInvalid(form, 'rubrik')).toBe(true);
    expect(isInvalid(form, 'beskrivning')).toBe(false);

    // Frontend skickar rubriken som den skrevs; servern avgör att den räknas som tom.
    const postCall = fetchStub.mock.calls.find(([, o]) => o?.method === 'POST');
    expect(JSON.parse(postCall[1].body).rubrik).toBe('   ');

    // Inget "registrerat"-besked, och det användaren skrivit finns kvar.
    const msg = window.document.getElementById('global-message');
    expect(msg.dataset.kind).toBe('error');
    expect(form.querySelector('[name="beskrivning"]').value).toContain('Kunden får');
  });

  it('AK8: deadline med dagens datum accepteras', async () => {
    // Dagens datum i lokal tid som YYYY-MM-DD (inte toISOString, som räknar i UTC).
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const today = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    const fetchStub = makeFetch(created201());
    const window = await loadPage(fetchStub);
    const form = fillForm(window);
    form.querySelector('[name="deadline"]').value = today;

    submit(window, form);

    const msg = window.document.getElementById('global-message');
    await vi.waitFor(() => expect(msg.hidden).toBe(false));
    expect(msg.dataset.kind).toBe('ok');
    expect(msg.textContent).toContain('2026-3');
    expect(errorAt(form, 'deadline')).toBe('');

    const postCall = fetchStub.mock.calls.find(([, o]) => o?.method === 'POST');
    expect(JSON.parse(postCall[1].body).deadline).toBe(today);
  });
});
