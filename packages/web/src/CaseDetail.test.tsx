import '@testing-library/jest-dom/vitest';
import { act, cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CaseDetail } from './CaseDetail';

const caseItem = {
  id: 7,
  title: 'Fiktivt fakturaärende',
  description: 'Hela beskrivningen.\nMed en andra rad.',
  category: 'Fakturering',
  priority: 'Hög',
  status: 'Pågående',
  note: null,
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
  it('[CASE-NOTE-003] keeps a confirmed status when a note response contains an older status', async () => {
    let resolveNote!: (response: Response) => void;
    const noteResponse = new Promise<Response>((resolve) => {
      resolveNote = resolve;
    });
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(jsonResponse(caseItem))
      .mockReturnValueOnce(noteResponse)
      .mockResolvedValueOnce(jsonResponse({ ...caseItem, note: 'Text.', status: 'Avslutat' })));
    const user = userEvent.setup();
    render(<CaseDetail caseId={7} />);
    await user.type(await screen.findByRole('textbox', { name: 'Intern anteckning' }), 'Text.');
    await user.click(screen.getByRole('button', { name: 'Spara anteckning' }));
    await user.selectOptions(screen.getByRole('combobox', { name: 'Ändra status' }), 'Avslutat');
    await user.click(screen.getByRole('button', { name: 'Spara status' }));
    await screen.findByText('Status sparad.');
    await act(async () => {
      resolveNote(jsonResponse({ ...caseItem, note: 'Text.' }));
    });

    expect(screen.getByText('Status', { selector: 'dt' }).nextElementSibling).toHaveTextContent('Avslutat');
  });

  it('[CASE-NOTE-003] reads the saved note after reopening the detail view', async () => {
    let stored = { ...caseItem, note: 'Första anteckningen.' };
    vi.stubGlobal('fetch', vi.fn().mockImplementation((_url: string, options?: RequestInit) => {
      if (options?.method === 'PATCH') {
        stored = { ...stored, note: 'Redigerad anteckning.' };
      }
      return Promise.resolve(jsonResponse(stored));
    }));
    const user = userEvent.setup();
    const { unmount } = render(<CaseDetail caseId={7} />);
    const editor = await screen.findByRole('textbox', { name: 'Intern anteckning' });
    await user.clear(editor);
    await user.type(editor, 'Redigerad anteckning.');
    await user.click(screen.getByRole('button', { name: 'Spara anteckning' }));
    await screen.findByText('Anteckning sparad.');
    unmount();

    render(<CaseDetail caseId={7} />);

    expect(await screen.findByRole('textbox', { name: 'Intern anteckning' }))
      .toHaveValue('Redigerad anteckning.');
  });

  it('[CASE-NOTE-003] preserves an unsaved note draft when status is saved', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(jsonResponse(caseItem))
      .mockResolvedValueOnce(jsonResponse({ ...caseItem, status: 'Avslutat' })));
    const user = userEvent.setup();
    render(<CaseDetail caseId={7} />);
    await user.type(await screen.findByRole('textbox', { name: 'Intern anteckning' }), 'Utkast.');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Ändra status' }), 'Avslutat');
    await user.click(screen.getByRole('button', { name: 'Spara status' }));
    await screen.findByText('Status sparad.');

    expect(screen.getByRole('textbox', { name: 'Intern anteckning' })).toHaveValue('Utkast.');
  });

  it('[CASE-STATUS-002] retains the displayed status when a save is rejected', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn()
        .mockResolvedValueOnce(jsonResponse(caseItem))
        .mockResolvedValueOnce(jsonResponse({ error: 'Välj en giltig status.' }, 400))
    );
    const user = userEvent.setup();
    render(<CaseDetail caseId={7} />);
    await user.selectOptions(await screen.findByRole('combobox', { name: 'Ändra status' }), 'Avslutat');
    await user.click(screen.getByRole('button', { name: 'Spara status' }));
    await screen.findByRole('alert');

    const term = screen.getByText('Status', { selector: 'dt' });
    expect(term.nextElementSibling).toHaveTextContent('Pågående');
  });

  it('[CASE-STATUS-003] displays the status saved from the detail view', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn()
        .mockResolvedValueOnce(jsonResponse(caseItem))
        .mockResolvedValueOnce(jsonResponse({ ...caseItem, status: 'Avslutat' }))
    );
    const user = userEvent.setup();
    render(<CaseDetail caseId={7} />);
    await user.selectOptions(await screen.findByRole('combobox', { name: 'Ändra status' }), 'Avslutat');
    await user.click(screen.getByRole('button', { name: 'Spara status' }));
    await screen.findByText('Status sparad.');

    const term = screen.getByText('Status', { selector: 'dt' });
    expect(term.nextElementSibling).toHaveTextContent('Avslutat');
  });

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
