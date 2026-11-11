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
  it('[ACCESSIBILITY-FORMS-001] gives every edit field an accessible name', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(caseItem)));
    const user = userEvent.setup();
    render(<CaseDetail caseId={7} />);

    await user.click(await screen.findByRole('button', { name: 'Redigera ärende' }));

    for (const [label, role] of [
      ['Rubrik', 'textbox'],
      ['Beskrivning', 'textbox'],
      ['Kategori', 'combobox'],
      ['Prioritet', 'combobox'],
      ['Status', 'combobox'],
      ['Intern anteckning', 'textbox']
    ]) {
      expect(screen.getByRole(role, { name: label })).toBeInTheDocument();
    }
  });

  it('[CASE-EDIT-003] displays details in read-only mode before editing starts', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      jsonResponse({ ...caseItem, note: 'Privat anteckning.' })
    ));
    const user = userEvent.setup();
    render(<CaseDetail caseId={7} />);

    const detail = await screen.findByRole('region', { name: caseItem.title });
    const table = within(detail).getByRole('table', { name: 'Ärendeuppgifter' });
    expect(within(table).getByRole('rowheader', { name: 'Intern anteckning' }).parentElement)
      .toHaveTextContent('Privat anteckning.');
    expect(within(table).getByRole('rowheader', { name: 'Rubrik' }).parentElement)
      .toHaveTextContent(caseItem.title);
    expect(within(table).getByRole('rowheader', { name: 'Beskrivning' }).parentElement)
      .toHaveTextContent(caseItem.description.replace('\n', ' '));
    expect(within(detail).queryByRole('textbox')).not.toBeInTheDocument();
    expect(within(detail).queryByRole('combobox')).not.toBeInTheDocument();

    await user.click(within(detail).getByRole('button', { name: 'Redigera ärende' }));

    const editForm = within(detail).getByRole('form', { name: 'Redigera ärende' });
    expect(editForm).toContainElement(table);
    expect(within(editForm).getByRole('textbox', { name: 'Intern anteckning' }))
      .toHaveValue('Privat anteckning.');
    const createdRow = within(editForm).getByRole('rowheader', { name: 'Skapad' }).parentElement!;
    expect(within(createdRow)
      .queryByRole('textbox')).not.toBeInTheDocument();
    expect(within(editForm).getByRole('rowheader', { name: 'Rubrik' }).parentElement)
      .toContainElement(within(editForm).getByRole('textbox', { name: 'Rubrik' }));
  });

  it('[CASE-EDIT-001] edits all case fields and saves them in one request', async () => {
    const updatedCase = {
      ...caseItem,
      title: 'Uppdaterad rubrik',
      description: 'Uppdaterad beskrivning.',
      category: 'Konto',
      priority: 'Normal',
      status: 'Avslutat',
      note: 'Uppdaterad anteckning.'
    };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse(caseItem))
      .mockResolvedValueOnce(jsonResponse(updatedCase));
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    render(<CaseDetail caseId={7} />);

    await user.click(await screen.findByRole('button', { name: 'Redigera ärende' }));
    await user.clear(screen.getByRole('textbox', { name: 'Rubrik' }));
    await user.type(screen.getByRole('textbox', { name: 'Rubrik' }), updatedCase.title);
    await user.clear(screen.getByRole('textbox', { name: 'Beskrivning' }));
    await user.type(screen.getByRole('textbox', { name: 'Beskrivning' }), updatedCase.description);
    await user.selectOptions(screen.getByRole('combobox', { name: 'Kategori' }), updatedCase.category);
    await user.selectOptions(screen.getByRole('combobox', { name: 'Prioritet' }), updatedCase.priority);
    await user.selectOptions(screen.getByRole('combobox', { name: 'Status' }), updatedCase.status);
    await user.clear(screen.getByRole('textbox', { name: 'Intern anteckning' }));
    await user.type(screen.getByRole('textbox', { name: 'Intern anteckning' }), updatedCase.note);
    await user.click(screen.getByRole('button', { name: 'Spara ändringar' }));

    expect(await screen.findByRole('button', { name: 'Redigera ärende' })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenLastCalledWith('/api/cases/7', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: updatedCase.title,
        description: updatedCase.description,
        category: updatedCase.category,
        priority: updatedCase.priority,
        status: updatedCase.status,
        note: updatedCase.note
      })
    });
  });

  it('[CASE-EDIT-002] [CASE-EDIT-005] [ACCESSIBILITY-FORMS-002] explains an invalid required title and blocks the update', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(jsonResponse(caseItem));
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    render(<CaseDetail caseId={7} />);

    await user.click(await screen.findByRole('button', { name: 'Redigera ärende' }));
    const title = screen.getByRole('textbox', { name: 'Rubrik' });
    await user.clear(title);
    await user.click(screen.getByRole('button', { name: 'Spara ändringar' }));

    expect(title).toBeRequired();
    expect(title).toHaveAttribute('aria-invalid', 'true');
    const errorId = title.getAttribute('aria-describedby');
    expect(errorId).toBeTruthy();
    expect(document.getElementById(errorId!)).toHaveTextContent('Ange en rubrik.');
    expect(fetchMock).not.toHaveBeenCalledWith(
      '/api/cases/7',
      expect.objectContaining({ method: 'PATCH' })
    );
  });


  it('[ACCESSIBILITY-FORMS-005] focuses the first invalid field when saving an invalid edit', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(jsonResponse(caseItem)));
    const user = userEvent.setup();
    render(<CaseDetail caseId={7} />);

    await user.click(await screen.findByRole('button', { name: 'Redigera ärende' }));
    const title = screen.getByRole('textbox', { name: 'Rubrik' });
    await user.clear(title);
    await user.click(screen.getByRole('button', { name: 'Spara ändringar' }));

    expect(await screen.findByText('Ange en rubrik.')).toBeInTheDocument();
    expect(document.activeElement).toBe(title);
  });

  it('[ACCESSIBILITY-FORMS-008] focuses the title field when editing starts', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(caseItem)));
    const user = userEvent.setup();
    render(<CaseDetail caseId={7} />);

    await user.click(await screen.findByRole('button', { name: 'Redigera ärende' }));

    expect(screen.getByRole('textbox', { name: 'Rubrik' })).toHaveFocus();
  });

  it('[ACCESSIBILITY-FORMS-008] returns focus to the edit toggle when editing is cancelled', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(caseItem)));
    const user = userEvent.setup();
    render(<CaseDetail caseId={7} />);

    const editButton = await screen.findByRole('button', { name: 'Redigera ärende' });
    await user.click(editButton);
    await user.click(screen.getByRole('button', { name: 'Avbryt redigering' }));

    expect(screen.queryByRole('textbox', { name: 'Rubrik' })).not.toBeInTheDocument();
    expect(editButton).toHaveFocus();
  });

  it('[CASE-EDIT-010] displays the internal note in the read-only detail', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      jsonResponse({ ...caseItem, note: 'Privat anteckning.' })
    ));
    render(<CaseDetail caseId={7} />);

    const detail = await screen.findByRole('region', { name: caseItem.title });
    const noteRow = within(detail).getByRole('rowheader', { name: 'Intern anteckning' }).parentElement!;
    expect(within(noteRow).getByRole('cell')).toHaveTextContent('Privat anteckning.');
  });

  it('[CASE-EDIT-008] only shows editable fields after entering edit mode', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(caseItem)));
    const user = userEvent.setup();
    render(<CaseDetail caseId={7} />);

    const detail = await screen.findByRole('region', { name: caseItem.title });
    expect(within(detail).queryByRole('textbox')).not.toBeInTheDocument();
    expect(within(detail).queryByRole('combobox')).not.toBeInTheDocument();

    await user.click(within(detail).getByRole('button', { name: 'Redigera ärende' }));

    expect(within(detail).getByRole('textbox', { name: 'Rubrik' })).toBeInTheDocument();
    expect(within(detail).getByRole('combobox', { name: 'Status' })).toBeInTheDocument();
  });

  it('[CASE-EDIT-009] keeps the creation time read-only during editing', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(caseItem)));
    render(<CaseDetail caseId={7} />);

    const detail = await screen.findByRole('region', { name: caseItem.title });
    const createdRow = within(detail).getByRole('rowheader', { name: 'Skapad' }).parentElement!;
    const time = createdRow.querySelector('time')!;

    expect(time).toBeInTheDocument();
    expect(time).toHaveAttribute('datetime', caseItem.createdAt);
    expect(within(createdRow).queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('[CASE-DELETE-009] focuses the cancel action when confirmation opens', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(caseItem));
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    render(<CaseDetail caseId={7} onDeleted={vi.fn()} />);

    const detail = await screen.findByRole('region', { name: caseItem.title });
    expect(within(detail).queryByRole('button', { name: 'Ta bort ärende' })).not.toBeInTheDocument();

    await user.click(within(detail).getByRole('button', { name: 'Redigera ärende' }));
    await user.click(within(detail).getByRole('button', { name: 'Ta bort ärende' }));

    const confirmation = within(detail).getByRole('alertdialog', { name: 'Ta bort ärende?' });
    expect(confirmation).toHaveTextContent(caseItem.title);
    const cancelButton = within(confirmation).getByRole('button', { name: 'Avbryt' });
    expect(cancelButton).toHaveFocus();
  });

  it('[CASE-DELETE-011] closes confirmation without sending a delete request when cancelled', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(caseItem));
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    render(<CaseDetail caseId={7} onDeleted={vi.fn()} />);

    const detail = await screen.findByRole('region', { name: caseItem.title });
    await user.click(within(detail).getByRole('button', { name: 'Redigera ärende' }));
    await user.click(within(detail).getByRole('button', { name: 'Ta bort ärende' }));
    const confirmation = within(detail).getByRole('alertdialog', { name: 'Ta bort ärende?' });
    await user.click(within(confirmation).getByRole('button', { name: 'Avbryt' }));

    expect(within(detail).queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(within(detail).getByRole('table', { name: 'Ärendeuppgifter' })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('[ACCESSIBILITY-FORMS-009] closes the deletion dialog with Escape without deleting and returns focus to its opener', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(caseItem));
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    render(<CaseDetail caseId={7} onDeleted={vi.fn()} />);

    const detail = await screen.findByRole('region', { name: caseItem.title });
    await user.click(within(detail).getByRole('button', { name: 'Redigera ärende' }));
    const deleteButton = within(detail).getByRole('button', { name: 'Ta bort ärende' });
    await user.click(deleteButton);
    expect(screen.getByRole('alertdialog', { name: 'Ta bort ärende?' })).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('alertdialog', { name: 'Ta bort ärende?' })).not.toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalledWith('/api/cases/7', { method: 'DELETE' });
    expect(deleteButton).toHaveFocus();
  });

  it('[ACCESSIBILITY-FORMS-009] returns focus to the deletion opener when Avbryt is clicked', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(caseItem));
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    render(<CaseDetail caseId={7} onDeleted={vi.fn()} />);

    const detail = await screen.findByRole('region', { name: caseItem.title });
    await user.click(within(detail).getByRole('button', { name: 'Redigera ärende' }));
    const deleteButton = within(detail).getByRole('button', { name: 'Ta bort ärende' });
    await user.click(deleteButton);
    const confirmation = screen.getByRole('alertdialog', { name: 'Ta bort ärende?' });
    await user.click(within(confirmation).getByRole('button', { name: 'Avbryt' }));

    expect(screen.queryByRole('alertdialog', { name: 'Ta bort ärende?' })).not.toBeInTheDocument();
    expect(deleteButton).toHaveFocus();
  });

  it('[CASE-DELETE-008] shows a confirmation dialog with cancel and confirm actions', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(caseItem)));
    const user = userEvent.setup();
    render(<CaseDetail caseId={7} />);

    const detail = await screen.findByRole('region', { name: caseItem.title });
    await user.click(within(detail).getByRole('button', { name: 'Redigera ärende' }));
    await user.click(within(detail).getByRole('button', { name: 'Ta bort ärende' }));

    const dialog = within(detail).getByRole('alertdialog', { name: 'Ta bort ärende?' });
    expect(within(dialog).getByRole('button', { name: 'Avbryt' })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Ta bort på riktigt' })).toBeInTheDocument();
  });

  it('[CASE-DELETE-002] and [CASE-DELETE-008] makes deletion available in edit mode and requires confirmation', async () => {
    const onDeleted = vi.fn();
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse(caseItem))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    render(<CaseDetail caseId={7} onDeleted={onDeleted} />);

    const detail = await screen.findByRole('region', { name: caseItem.title });
    await user.click(within(detail).getByRole('button', { name: 'Redigera ärende' }));
    await user.click(within(detail).getByRole('button', { name: 'Ta bort ärende' }));
    await user.click(within(screen.getByRole('alertdialog', { name: 'Ta bort ärende?' }))
      .getByRole('button', { name: 'Ta bort på riktigt' }));

    expect(fetchMock).toHaveBeenLastCalledWith('/api/cases/7', { method: 'DELETE' });
    expect(onDeleted).toHaveBeenCalledOnce();
  });

  it('[CASE-DELETE-007] keeps the confirmation open and reports a delete failure', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(jsonResponse(caseItem))
      .mockResolvedValueOnce(jsonResponse({ error: 'Ärendet hittades inte.' }, 404)));
    const user = userEvent.setup();
    render(<CaseDetail caseId={7} onDeleted={vi.fn()} />);

    await user.click(await screen.findByRole('button', { name: 'Redigera ärende' }));
    await user.click(screen.getByRole('button', { name: 'Ta bort ärende' }));
    await user.click(within(screen.getByRole('alertdialog', { name: 'Ta bort ärende?' }))
      .getByRole('button', { name: 'Ta bort på riktigt' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Ärendet hittades inte.');
    expect(screen.getByRole('alertdialog', { name: 'Ta bort ärende?' })).toBeInTheDocument();
  });

  it('[CASE-DELETE-006] confirms deletion in standalone detail view when no list callback is supplied', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(jsonResponse(caseItem))
      .mockResolvedValueOnce(new Response(null, { status: 204 })));
    const user = userEvent.setup();
    render(<CaseDetail caseId={7} />);

    await user.click(await screen.findByRole('button', { name: 'Redigera ärende' }));
    await user.click(screen.getByRole('button', { name: 'Ta bort ärende' }));
    await user.click(within(screen.getByRole('alertdialog', { name: 'Ta bort ärende?' }))
      .getByRole('button', { name: 'Ta bort på riktigt' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Ärendet har tagits bort.');
    expect(screen.queryByRole('table', { name: 'Ärendeuppgifter' })).not.toBeInTheDocument();
  });

  it('[CASE-DELETE-010] allows retrying deletion after an API failure', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(jsonResponse(caseItem))
      .mockResolvedValueOnce(jsonResponse({ error: 'Försök igen.' }, 500))
      .mockResolvedValueOnce(new Response(null, { status: 204 })));
    const user = userEvent.setup();
    render(<CaseDetail caseId={7} />);

    await user.click(await screen.findByRole('button', { name: 'Redigera ärende' }));
    await user.click(screen.getByRole('button', { name: 'Ta bort ärende' }));
    const confirmButton = within(screen.getByRole('alertdialog', { name: 'Ta bort ärende?' }))
      .getByRole('button', { name: 'Ta bort på riktigt' });
    await user.click(confirmButton);

    expect(await screen.findByRole('alert')).toHaveTextContent('Försök igen.');
    expect(screen.getByRole('alertdialog', { name: 'Ta bort ärende?' })).toBeInTheDocument();
    await user.click(within(screen.getByRole('alertdialog', { name: 'Ta bort ärende?' }))
      .getByRole('button', { name: 'Ta bort på riktigt' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Ärendet har tagits bort.');
  });

  it('[CASE-EDIT-002] displays validation errors returned by the update API', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(jsonResponse(caseItem))
      .mockResolvedValueOnce(jsonResponse({ error: 'Välj en giltig kategori.' }, 400)));
    const user = userEvent.setup();
    render(<CaseDetail caseId={7} />);

    await user.click(await screen.findByRole('button', { name: 'Redigera ärende' }));
    await user.selectOptions(screen.getByRole('combobox', { name: 'Kategori' }), 'Konto');
    await user.click(screen.getByRole('button', { name: 'Spara ändringar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Välj en giltig kategori.');
    expect(screen.getByRole('textbox', { name: 'Rubrik' })).toBeInTheDocument();
  });

  it('[ACCESSIBILITY-FORMS-004] exposes API validation errors as accessible feedback', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(jsonResponse(caseItem))
      .mockResolvedValueOnce(jsonResponse({ error: 'Välj en giltig kategori.' }, 400)));
    const user = userEvent.setup();
    render(<CaseDetail caseId={7} />);

    await user.click(await screen.findByRole('button', { name: 'Redigera ärende' }));
    await user.selectOptions(screen.getByRole('combobox', { name: 'Kategori' }), 'Konto');
    await user.click(screen.getByRole('button', { name: 'Spara ändringar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Välj en giltig kategori.');
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
    const term = within(detail).getByRole('rowheader', { name: label });

    if (label === 'Skapad') {
      expect(term.parentElement!.querySelector('time')).toHaveAttribute('datetime', caseItem.createdAt);
      return;
    }

    expect(term.parentElement).toHaveTextContent(value);
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
