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
    createdAt: '2026-02-01T10:00:00.000Z'
  },
  {
    id: 1,
    title: 'Äldre ärende',
    description: 'En beskrivning.',
    category: 'Konto',
    priority: 'Normal',
    status: 'Pågående',
    createdAt: '2026-01-01T10:00:00.000Z'
  }
];

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('CaseList', () => {
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

    await user.click(await screen.findByRole('button', { name: selectedCase.title }));

    expect(await screen.findByRole('region', { name: selectedCase.title })).toHaveTextContent(
      selectedCase.description
    );
  });

  it('[CASE-LIST-001] displays the summary fields returned by the API', async () => {
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

    const list = await screen.findByRole('list', { name: 'Ärenden' });
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

  it('[CASE-LIST-002] displays a clear empty state for an empty response', async () => {
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

    expect(await screen.findByText('Inga ärenden ännu.')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('[CASE-LIST-003] shows an error instead of an empty state when loading fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network unavailable')));

    render(<CaseList />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Ärendena kunde inte hämtas.');
    expect(screen.queryByText('Inga ärenden ännu.')).not.toBeInTheDocument();
  });
});
