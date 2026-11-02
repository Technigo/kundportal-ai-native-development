import '@testing-library/jest-dom/vitest';
import { act, cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CaseDetail } from './CaseDetail';

const caseItem = {
  id: 7,
  title: 'Fiktivt fakturaärende',
  description: 'Hela beskrivningen.\nMed en andra rad.',
  category: 'Fakturering',
  priority: 'Hög',
  status: 'Pågående',
  createdAt: '2026-02-01T10:00:00.000Z'
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

describe('CaseDetail', () => {
  it('[CASE-DETAIL-001] fetches the selected case from the detail endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(caseItem));
    vi.stubGlobal('fetch', fetchMock);

    render(<CaseDetail caseId={7} />);
    await screen.findByRole('heading', { name: caseItem.title });

    expect(fetchMock).toHaveBeenCalledWith('/api/cases/7');
  });

  it('[CASE-DETAIL-001] displays the selected title', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(caseItem)));

    render(<CaseDetail caseId={7} />);

    expect(await screen.findByRole('heading', { name: caseItem.title })).toBeInTheDocument();
  });

  it.each([
    ['Beskrivning', 'Hela beskrivningen. Med en andra rad.'],
    ['Kategori', 'Fakturering'],
    ['Prioritet', 'Hög'],
    ['Status', 'Pågående'],
    ['Skapad', new Date(caseItem.createdAt).toLocaleString('sv-SE')]
  ])('[CASE-DETAIL-001] displays %s for the selected case', async (label, value) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(caseItem)));

    render(<CaseDetail caseId={7} />);
    const detail = await screen.findByRole('region', { name: caseItem.title });
    const term = within(detail).getByText(label, { selector: 'dt' });

    expect(term.nextElementSibling).toHaveTextContent(value);
  });

  it('[CASE-DETAIL-001] announces loading while fetching details', () => {
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise<Response>(() => {})));

    render(<CaseDetail caseId={7} />);

    expect(screen.getByRole('status')).toHaveTextContent('Laddar ärende…');
  });

  it('[CASE-DETAIL-001] loads details when the selected case changes', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn()
        .mockResolvedValueOnce(jsonResponse(caseItem))
        .mockResolvedValueOnce(jsonResponse({ ...caseItem, id: 8, title: 'Nästa ärende' }))
    );
    const { rerender } = render(<CaseDetail caseId={7} />);
    await screen.findByRole('heading', { name: caseItem.title });

    rerender(<CaseDetail caseId={8} />);

    expect(await screen.findByRole('heading', { name: 'Nästa ärende' })).toBeInTheDocument();
  });

  it('[CASE-DETAIL-001] keeps the latest selection when an earlier request finishes late', async () => {
    let resolveEarlier!: (response: Response) => void;
    const earlier = new Promise<Response>((resolve) => {
      resolveEarlier = resolve;
    });
    vi.stubGlobal(
      'fetch',
      vi.fn()
        .mockReturnValueOnce(earlier)
        .mockResolvedValueOnce(jsonResponse({ ...caseItem, id: 8, title: 'Nästa ärende' }))
    );
    const { rerender } = render(<CaseDetail caseId={7} />);

    rerender(<CaseDetail caseId={8} />);
    await screen.findByRole('heading', { name: 'Nästa ärende' });
    await act(async () => {
      resolveEarlier(jsonResponse(caseItem));
    });

    expect(screen.getByRole('heading', { name: 'Nästa ärende' })).toBeInTheDocument();
  });

  it('[CASE-DETAIL-002] displays a readable message for a missing case', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ error: 'Ärendet hittades inte.' }, 404)));

    render(<CaseDetail caseId={7} />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Ärendet hittades inte.');
  });

  it('[CASE-DETAIL-003] displays a readable network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network unavailable')));

    render(<CaseDetail caseId={7} />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Ärendet kunde inte hämtas. Försök igen.');
  });

  it('[CASE-DETAIL-003] displays a fetch error for a server failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ error: 'Database failure' }, 500)));

    render(<CaseDetail caseId={7} />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Ärendet kunde inte hämtas. Försök igen.');
  });

  it('[CASE-DETAIL-003] displays a fetch error for incomplete detail data', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ id: 7, title: 'Ofullständigt' })));

    render(<CaseDetail caseId={7} />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Ärendet kunde inte hämtas. Försök igen.');
  });

  it('[CASE-DETAIL-003] displays a fetch error for invalid JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('invalid json')));

    render(<CaseDetail caseId={7} />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Ärendet kunde inte hämtas. Försök igen.');
  });
});
