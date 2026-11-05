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

  it.todo('AK2: tomt obligatoriskt fält visar serverns meddelande vid rätt fält');
  it.todo('AK3/AK4: svar om för lång rubrik/beskrivning visas vid rätt fält');
  it.todo('AK6/AK7: deadline-fel visas vid deadline-fältet');
  it.todo('servern nås inte: begripligt meddelande visas, inget kraschar');
});