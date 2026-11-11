import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';

const existingCase = {
  id: 2,
  title: 'Fiktivt ärende',
  description: 'En beskrivning.',
  category: 'Konto',
  priority: 'Normal',
  status: 'Nytt',
  note: null,
  createdAt: '2026-11-01T10:00:00.000Z'
};

const createdCase = {
  ...existingCase,
  id: 3,
  title: 'Nytt fiktivt ärende'
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

async function submitCase(user: ReturnType<typeof userEvent.setup>) {
  const navigation = screen.getByRole('navigation', { name: 'Huvudmeny' });
  await user.click(within(navigation).getByRole('button', { name: 'Skapa ärende' }));
  await user.type(screen.getByRole('textbox', { name: 'Rubrik' }), 'Nytt fiktivt ärende');
  await user.type(screen.getByRole('textbox', { name: 'Beskrivning' }), 'En beskrivning.');
  await user.selectOptions(screen.getByRole('combobox', { name: 'Kategori' }), 'Konto');
  await user.selectOptions(screen.getByRole('combobox', { name: 'Prioritet' }), 'Normal');
  await user.click(within(screen.getByRole('form', { name: 'Skapa ärende' }))
    .getByRole('button', { name: 'Skapa ärende' }));
}

describe('App', () => {
  it('[CASE-WORKSPACE-004] makes the brand keyboard reachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse([existingCase])));
    const user = userEvent.setup();
    render(<App />);

    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Kundserviceportalen – startsida' }));
  });

  it('[CASE-WORKSPACE-005] announces the active view in the main menu', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse([existingCase])));
    const user = userEvent.setup();
    render(<App />);

    const navigation = screen.getByRole('navigation', { name: 'Huvudmeny' });
    expect(within(navigation).getByRole('button', { name: 'Alla ärenden' }))
      .toHaveAttribute('aria-current', 'page');
    expect(within(navigation).getByRole('button', { name: 'Skapa ärende' }))
      .not.toHaveAttribute('aria-current');

    await user.click(within(navigation).getByRole('button', { name: 'Skapa ärende' }));

    expect(within(navigation).getByRole('button', { name: 'Skapa ärende' }))
      .toHaveAttribute('aria-current', 'page');
    expect(within(navigation).getByRole('button', { name: 'Alla ärenden' }))
      .not.toHaveAttribute('aria-current');
  });

  it('[ACCESSIBILITY-FORMS-006] focuses the create view heading and updates the page title after menu navigation', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse([existingCase])));
    const user = userEvent.setup();
    render(<App />);

    await screen.findByRole('list', { name: 'Alla ärenden' });
    const navigation = screen.getByRole('navigation', { name: 'Huvudmeny' });
    await user.click(within(navigation).getByRole('button', { name: 'Skapa ärende' }));

    const heading = screen.getByRole('heading', { name: 'Skapa ärende', level: 1 });
    expect.soft(heading).toHaveFocus();
    expect.soft(document.title).toContain('Skapa ärende');
  });

  it('[ACCESSIBILITY-FORMS-006] focuses the list view heading and updates the page title after returning through the main menu', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse([existingCase])));
    const user = userEvent.setup();
    render(<App />);

    await screen.findByRole('list', { name: 'Alla ärenden' });
    const navigation = screen.getByRole('navigation', { name: 'Huvudmeny' });
    await user.click(within(navigation).getByRole('button', { name: 'Skapa ärende' }));
    await screen.findByRole('heading', { name: 'Skapa ärende', level: 1 });
    await user.click(within(navigation).getByRole('button', { name: 'Alla ärenden' }));

    const heading = await screen.findByRole('heading', { name: 'Alla ärenden', level: 1 });
    expect.soft(heading).toHaveFocus();
    expect.soft(document.title).toContain('Alla ärenden');
  });

  it('[CASE-WORKSPACE-001] opens on the list with all cases', async () => {
    const fetchMock = vi.fn().mockImplementation((input: RequestInfo | URL) => {
      return Promise.resolve(jsonResponse([existingCase]));
    });
    vi.stubGlobal('fetch', fetchMock);
    render(<App />);

    expect(await screen.findByRole('list', { name: 'Alla ärenden' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Alla ärenden' })).toBeInTheDocument();
    expect(screen.getByText('Fiktivt ärende')).toBeInTheDocument();
  });

  it('[CASE-WORKSPACE-006] switches between the list and create views using the main menu', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => Promise.resolve(jsonResponse([existingCase]))));
    const user = userEvent.setup();
    render(<App />);

    await screen.findByRole('list', { name: 'Alla ärenden' });
    const navigation = screen.getByRole('navigation', { name: 'Huvudmeny' });
    await user.click(within(navigation).getByRole('button', { name: 'Skapa ärende' }));
    expect(screen.getByRole('heading', { name: 'Skapa ärende' })).toBeInTheDocument();
    await user.click(within(navigation).getByRole('button', { name: 'Alla ärenden' }));
    await user.click(within(navigation).getByRole('button', { name: 'Alla ärenden' }));
    expect(await screen.findByRole('list', { name: 'Alla ärenden' })).toBeInTheDocument();
  });

  it('[CASE-WORKSPACE-002] returns to the list after creating a case', async () => {
    const fetchMock = vi.fn().mockImplementation((input: RequestInfo | URL, options?: RequestInit) => {
      const url = String(input);
      if (url === '/api/cases' && options?.method === 'POST') {
        return Promise.resolve(jsonResponse(createdCase, 201));
      }
      return Promise.resolve(jsonResponse([createdCase]));
    });
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    render(<App />);

    await submitCase(user);

    expect(await screen.findByRole('list', { name: 'Alla ärenden' }))
      .toHaveTextContent('Nytt fiktivt ärende');
  });

  it('[CASE-WORKSPACE-007] confirms that a case was created', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation((input: RequestInfo | URL, options?: RequestInit) => {
      if (String(input) === '/api/cases' && options?.method === 'POST') {
        return Promise.resolve(jsonResponse(createdCase, 201));
      }
      return Promise.resolve(jsonResponse([createdCase]));
    }));
    const user = userEvent.setup();
    render(<App />);

    await submitCase(user);

    expect(await screen.findByText('Ärende #3 sparades med status Nytt.')).toBeInTheDocument();
  });

  it('[CASE-WORKSPACE-008] reloads the list after creating a case', async () => {
    const fetchMock = vi.fn().mockImplementation((input: RequestInfo | URL, options?: RequestInit) => {
      if (String(input) === '/api/cases' && options?.method === 'POST') {
        return Promise.resolve(jsonResponse(createdCase, 201));
      }
      return Promise.resolve(jsonResponse([createdCase]));
    });
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    render(<App />);

    await submitCase(user);
    await screen.findByRole('list', { name: 'Alla ärenden' });

    expect(fetchMock.mock.calls.filter(
      ([url, options]) => url === '/api/cases' && options?.method !== 'POST'
    )).toHaveLength(2);
  });
});
