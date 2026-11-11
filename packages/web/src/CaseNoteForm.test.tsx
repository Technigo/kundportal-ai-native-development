import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CaseNoteForm } from './CaseNoteForm';

const caseItem = {
  id: 7,
  title: 'Fiktivt ärende',
  description: 'En fiktiv beskrivning.',
  category: 'Konto',
  priority: 'Normal',
  status: 'Nytt',
  createdAt: '2026-02-01T10:00:00.000Z',
  note: null
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('CaseNoteForm', () => {
  it('[ACCESSIBILITY-FORMS-001] gives the note editor an accessible name', () => {
    render(<CaseNoteForm caseItem={caseItem} onUpdated={vi.fn()} />);

    expect(screen.getByRole('textbox', { name: 'Intern anteckning' })).toBeInTheDocument();
  });

  it('[CASE-NOTE-001] offers an empty editor for a case without a note', () => {
    render(<CaseNoteForm caseItem={caseItem} onUpdated={vi.fn()} />);

    expect(screen.getByRole('textbox', { name: 'Intern anteckning' })).toHaveValue('');
  });

  it('[CASE-NOTE-002] limits the editor to 2000 characters', () => {
    render(<CaseNoteForm caseItem={caseItem} onUpdated={vi.fn()} />);

    expect(screen.getByRole('textbox', { name: 'Intern anteckning' })).toHaveAttribute('maxLength', '2000');
  });

  it('[CASE-NOTE-002] sends note text to the selected case endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ...caseItem, note: 'Ny text.' }));
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    render(<CaseNoteForm caseItem={caseItem} onUpdated={vi.fn()} />);
    await user.type(screen.getByRole('textbox', { name: 'Intern anteckning' }), 'Ny text.');
    await user.click(screen.getByRole('button', { name: 'Spara anteckning' }));

    expect(fetchMock).toHaveBeenCalledWith('/api/cases/7/note', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: 'Ny text.' })
    });
  });

  it('[CASE-NOTE-003] preloads the saved note for editing', () => {
    render(<CaseNoteForm caseItem={{ ...caseItem, note: 'Sparad text.' }} onUpdated={vi.fn()} />);

    expect(screen.getByRole('textbox', { name: 'Intern anteckning' })).toHaveValue('Sparad text.');
  });

  it('[CASE-NOTE-003] publishes the confirmed edited case', async () => {
    const updated = { ...caseItem, note: 'Redigerad text.' };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(updated)));
    const onUpdated = vi.fn();
    const user = userEvent.setup();
    render(<CaseNoteForm caseItem={{ ...caseItem, note: 'Gammal text.' }} onUpdated={onUpdated} />);
    await user.clear(screen.getByRole('textbox', { name: 'Intern anteckning' }));
    await user.type(screen.getByRole('textbox', { name: 'Intern anteckning' }), updated.note);
    await user.click(screen.getByRole('button', { name: 'Spara anteckning' }));

    await waitFor(() => expect(onUpdated).toHaveBeenCalledWith(updated));
  });

  it('[CASE-NOTE-003] displays a save confirmation', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ ...caseItem, note: 'Text.' })));
    const user = userEvent.setup();
    render(<CaseNoteForm caseItem={caseItem} onUpdated={vi.fn()} />);
    await user.type(screen.getByRole('textbox', { name: 'Intern anteckning' }), 'Text.');
    await user.click(screen.getByRole('button', { name: 'Spara anteckning' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Anteckning sparad.');
  });

  it.each(['', '   '])('[CASE-NOTE-004] deletes a note by saving %j', async (note) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(caseItem)));
    const user = userEvent.setup();
    render(<CaseNoteForm caseItem={{ ...caseItem, note: 'Sparad text.' }} onUpdated={vi.fn()} />);
    await user.clear(screen.getByRole('textbox', { name: 'Intern anteckning' }));
    if (note) await user.type(screen.getByRole('textbox', { name: 'Intern anteckning' }), note);
    await user.click(screen.getByRole('button', { name: 'Spara anteckning' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Anteckning raderad.');
  });

  it.each([
    { status: 400, error: 'Anteckningen får innehålla högst 2000 tecken.', requirement: 'CASE-NOTE-005' },
    { status: 404, error: 'Ärendet hittades inte.', requirement: 'CASE-NOTE-006' },
    { status: 500, error: 'Anteckningen kunde inte sparas. Försök igen.', requirement: 'CASE-NOTE-003' }
  ])('[$requirement] reports HTTP $status', async ({ status, error }) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ error }, status)));
    const user = userEvent.setup();
    render(<CaseNoteForm caseItem={caseItem} onUpdated={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: 'Spara anteckning' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(error);
  });

  it('[CASE-NOTE-003] prevents duplicate saves while waiting for the API', async () => {
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise<Response>(() => {})));
    const user = userEvent.setup();
    render(<CaseNoteForm caseItem={caseItem} onUpdated={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: 'Spara anteckning' }));

    expect(screen.getByRole('button', { name: 'Sparar anteckning…' })).toBeDisabled();
  });

  it('[CASE-NOTE-003] keeps the draft after a network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network unavailable')));
    const user = userEvent.setup();
    render(<CaseNoteForm caseItem={caseItem} onUpdated={vi.fn()} />);
    await user.type(screen.getByRole('textbox', { name: 'Intern anteckning' }), 'Behåll utkast.');
    await user.click(screen.getByRole('button', { name: 'Spara anteckning' }));
    await screen.findByRole('alert');

    expect(screen.getByRole('textbox', { name: 'Intern anteckning' })).toHaveValue('Behåll utkast.');
  });

  it('[CASE-NOTE-003] allows retrying a failed save', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockRejectedValueOnce(new Error('Network unavailable'))
      .mockResolvedValueOnce(jsonResponse({ ...caseItem, note: 'Text.' })));
    const user = userEvent.setup();
    render(<CaseNoteForm caseItem={caseItem} onUpdated={vi.fn()} />);
    await user.type(screen.getByRole('textbox', { name: 'Intern anteckning' }), 'Text.');
    await user.click(screen.getByRole('button', { name: 'Spara anteckning' }));
    await screen.findByRole('alert');
    await user.click(screen.getByRole('button', { name: 'Spara anteckning' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Anteckning sparad.');
  });

  it.each([{ ...caseItem, id: 8 }, { ...caseItem, note: 42 }, { id: 7 }])(
    '[CASE-NOTE-003] reports invalid saved-case data %j',
    async (body) => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(body)));
      const user = userEvent.setup();
      render(<CaseNoteForm caseItem={caseItem} onUpdated={vi.fn()} />);
      await user.click(screen.getByRole('button', { name: 'Spara anteckning' }));

      expect(await screen.findByRole('alert')).toHaveTextContent('Anteckningen kunde inte sparas. Försök igen.');
    }
  );
});
