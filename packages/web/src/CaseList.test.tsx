import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CaseList } from './CaseList';

const cases = [
  {
    id: 2,
    title: 'Nyare ärende',
    description: 'En beskrivning.',
    category: 'Tekniskt',
    priority: 'Hög',
    status: 'Nytt',
    note: null,
    createdAt: '2026-02-01T10:00:00.000Z'
  },
  {
    id: 1,
    title: 'Äldre ärende',
    description: 'En beskrivning.',
    category: 'Konto',
    priority: 'Normal',
    status: 'Pågående',
    note: null,
    createdAt: '2026-01-01T10:00:00.000Z'
  }
];

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('CaseList', () => {
  it('[CASE-LIST-009] shows a short description in each collapsed case card', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify(cases)))
    );

    render(<CaseList />);

    const list = await screen.findByRole('list', { name: 'Alla ärenden' });
    expect(within(list).getAllByText('En beskrivning.')).toHaveLength(2);
  });

  it('[CASE-STATUS-003] updates the list status after saving from the detail view', async () => {
    const selectedCase = cases[1];
    const updatedCase = { ...selectedCase, status: 'Avslutat' };
    vi.stubGlobal(
      'fetch',
      vi.fn()
        .mockResolvedValueOnce(new Response(JSON.stringify(cases)))
        .mockResolvedValueOnce(new Response(JSON.stringify(selectedCase)))
        .mockResolvedValueOnce(new Response(JSON.stringify(updatedCase)))
    );
    const user = userEvent.setup();
    render(<CaseList />);
    const list = await screen.findByRole('list', { name: 'Alla ärenden' });
    const item = within(list).getAllByRole('listitem')[1];
    await user.click(within(item).getByRole('button', { name: 'Visa ärendedetaljer' }));
    await user.click(await screen.findByRole('button', { name: 'Redigera ärende' }));
    await user.selectOptions(await screen.findByRole('combobox', { name: 'Status' }), 'Avslutat');
    await user.click(screen.getByRole('button', { name: 'Spara ändringar' }));

    const detail = await screen.findByRole('region', { name: selectedCase.title });
    expect(within(detail).getByRole('rowheader', { name: 'Status' }).parentElement)
      .toHaveTextContent('Avslutat');
  });

  it('[CASE-DETAIL-001] opens details for the case chosen from the list', async () => {
    const selectedCase = cases[1];
    vi.stubGlobal(
      'fetch',
      vi.fn()
        .mockResolvedValueOnce(new Response(JSON.stringify(cases)))
        .mockResolvedValueOnce(new Response(JSON.stringify(selectedCase)))
    );
    const user = userEvent.setup();
    render(<CaseList />);

    const list = await screen.findByRole('list', { name: 'Alla ärenden' });
    const item = within(list).getAllByRole('listitem')[1];
    await user.click(within(item).getByRole('button', { name: 'Visa ärendedetaljer' }));

    expect(await screen.findByRole('region', { name: selectedCase.title })).toHaveTextContent(
      selectedCase.description
    );
  });

  it('[CASE-DETAIL-004] and [CASE-EDIT-003] expands to show full details in read-only mode', async () => {
    const selectedCase = { ...cases[1], note: 'Intern information.' };
    vi.stubGlobal(
      'fetch',
      vi.fn()
        .mockResolvedValueOnce(new Response(JSON.stringify(cases)))
        .mockResolvedValueOnce(new Response(JSON.stringify(selectedCase)))
    );
    const user = userEvent.setup();
    render(<CaseList />);

    const list = await screen.findByRole('list', { name: 'Alla ärenden' });
    const item = within(list).getAllByRole('listitem')[1];
    const expandButton = within(item).getByRole('button', { name: 'Visa ärendedetaljer' });
    await user.click(expandButton);

    const detail = await screen.findByRole('region', { name: selectedCase.title });
    const table = within(detail).getByRole('table', { name: 'Ärendeuppgifter' });
    for (const field of ['Rubrik', 'Beskrivning', 'Kategori', 'Prioritet', 'Status', 'Skapad', 'Intern anteckning']) {
      expect(within(table).getByRole('rowheader', { name: field })).toBeInTheDocument();
    }
    expect(within(table).getByRole('rowheader', { name: 'Intern anteckning' }).parentElement)
      .toHaveTextContent('Intern information.');
    expect(within(table).getByRole('rowheader', { name: 'Beskrivning' }).parentElement)
      .toHaveTextContent(selectedCase.description);
    expect(detail).not.toHaveTextContent('Prioritet: Normal');
    expect(screen.queryByRole('textbox', { name: 'Intern anteckning' })).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'Ändra status' })).not.toBeInTheDocument();
    expect(within(item).getAllByText(selectedCase.description)).toHaveLength(1);
    expect(await screen.findByRole('button', { name: 'Redigera ärende' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Fäll ihop ärendet' }));

    expect(screen.queryByRole('region', { name: selectedCase.title })).not.toBeInTheDocument();
  });

  it('[CASE-DETAIL-006] collapses an expanded case detail', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn()
        .mockResolvedValueOnce(new Response(JSON.stringify(cases)))
        .mockResolvedValueOnce(new Response(JSON.stringify(cases[0])))
    );
    const user = userEvent.setup();
    render(<CaseList />);

    const list = await screen.findByRole('list', { name: 'Alla ärenden' });
    await user.click(within(within(list).getAllByRole('listitem')[0])
      .getByRole('button', { name: 'Visa ärendedetaljer' }));
    await screen.findByRole('region', { name: cases[0].title });
    await user.click(screen.getByRole('button', { name: 'Fäll ihop ärendet' }));

    expect(screen.queryByRole('region', { name: cases[0].title })).not.toBeInTheDocument();
  });

  it('[CASE-DELETE-003] removes the confirmed case from the list', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(cases)))
      .mockResolvedValueOnce(new Response(JSON.stringify(cases[0])))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    render(<CaseList />);

    const list = await screen.findByRole('list', { name: 'Alla ärenden' });
    const item = within(list).getAllByRole('listitem')[0];
    await user.click(within(item).getByRole('button', { name: 'Visa ärendedetaljer' }));
    await user.click(await screen.findByRole('button', { name: 'Redigera ärende' }));
    await user.click(screen.getByRole('button', { name: 'Ta bort ärende' }));
    await user.click(within(screen.getByRole('alertdialog', { name: 'Ta bort ärende?' }))
      .getByRole('button', { name: 'Ta bort på riktigt' }));

    expect(await screen.findByRole('list', { name: 'Alla ärenden' })).toHaveTextContent('Äldre ärende');
    expect(screen.queryByText('Nyare ärende')).not.toBeInTheDocument();
    expect(within(list).getAllByRole('listitem')).toHaveLength(1);
    expect(fetchMock).toHaveBeenLastCalledWith('/api/cases/2', { method: 'DELETE' });
  });

  it('[CASE-LIST-001] and [ACCESSIBILITY-FORMS-003] displays the status as text in the case summary', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(cases), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      )
    );

    render(<CaseList />);

    const list = await screen.findByRole('list', { name: 'Alla ärenden' });
    const items = within(list).getAllByRole('listitem');

    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('Nyare ärende');
    expect(items[0]).toHaveTextContent('Tekniskt');
    expect(items[0]).toHaveTextContent('Hög');
    expect(items[0]).toHaveTextContent('Nytt');
    expect(items[0]).toHaveTextContent('2026');
    expect(items[1]).toHaveTextContent('Äldre ärende');
    expect(items[1]).toHaveTextContent('Pågående');
  });

  it('[CASE-LIST-006] displays the newest case first', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify(cases)))
    );

    render(<CaseList />);

    const list = await screen.findByRole('list', { name: 'Alla ärenden' });
    const items = within(list).getAllByRole('listitem');
    expect(items[0]).toHaveTextContent('Nyare ärende');
    expect(items[1]).toHaveTextContent('Äldre ärende');
  });

  it('[CASE-LIST-004] explains why the empty list has no cases', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('[]', {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      )
    );

    render(<CaseList />);

    expect(await screen.findByText('Du har inga ärenden ännu.')).toBeInTheDocument();
  });

  it('[CASE-LIST-007] renders the empty state when the API returns no cases', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('[]', {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      )
    );

    render(<CaseList />);

    expect(await screen.findByText('Du har inga ärenden ännu.')).toBeInTheDocument();
  });

  it('[CASE-LIST-008] offers an action to create the first case from the empty state', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('[]', {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      )
    );

    const onCreateCase = vi.fn();
    const user = userEvent.setup();
    render(<CaseList onCreateCase={onCreateCase} />);

    await screen.findByText('Du har inga ärenden ännu.');
    await user.click(screen.getByRole('button', { name: 'Skapa ditt första ärende' }));
    expect(onCreateCase).toHaveBeenCalledOnce();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('[CASE-LIST-003] shows an error instead of an empty state when loading fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network unavailable')));

    render(<CaseList />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Ärendena kunde inte hämtas.');
    expect(screen.queryByText('Inga ärenden ännu.')).not.toBeInTheDocument();
  });
});
