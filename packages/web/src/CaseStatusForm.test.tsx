import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CaseStatusForm } from './CaseStatusForm';

const caseItem = {
  id: 7,
  title: 'Fiktivt ärende',
  description: 'En fiktiv beskrivning.',
  category: 'Konto',
  priority: 'Normal',
  status: 'Nytt',
  note: null,
  createdAt: '2026-02-01T10:00:00.000Z'
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

async function submitStatus() {
  const user = userEvent.setup();
  await user.selectOptions(screen.getByRole('combobox', { name: 'Ändra status' }), 'Avslutat');
  await user.click(screen.getByRole('button', { name: 'Spara status' }));
}

describe('CaseStatusForm', () => {
  it('[ACCESSIBILITY-FORMS-001] gives the status selector an accessible name', () => {
    render(<CaseStatusForm caseItem={caseItem} onUpdated={vi.fn()} />);

    expect(screen.getByRole('combobox', { name: 'Ändra status' })).toBeInTheDocument();
  });

  it('[CASE-STATUS-001] offers exactly the allowed statuses', () => {
    render(<CaseStatusForm caseItem={caseItem} onUpdated={vi.fn()} />);

    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
      'Nytt', 'Pågående', 'Väntar på kund', 'Avslutat'
    ]);
  });

  it('[CASE-STATUS-001] selects the current status initially', () => {
    render(<CaseStatusForm caseItem={caseItem} onUpdated={vi.fn()} />);

    expect(screen.getByRole('combobox', { name: 'Ändra status' })).toHaveValue('Nytt');
  });

  it('[CASE-STATUS-001] sends the selected status to the API', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ...caseItem, status: 'Avslutat' }));
    vi.stubGlobal('fetch', fetchMock);
    render(<CaseStatusForm caseItem={caseItem} onUpdated={vi.fn()} />);

    await submitStatus();

    expect(fetchMock).toHaveBeenCalledWith('/api/cases/7/status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Avslutat' })
    });
  });

  it('[CASE-STATUS-003] publishes the saved case returned by the API', async () => {
    const updated = { ...caseItem, status: 'Avslutat' };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(updated)));
    const onUpdated = vi.fn();
    render(<CaseStatusForm caseItem={caseItem} onUpdated={onUpdated} />);

    await submitStatus();

    await waitFor(() => expect(onUpdated).toHaveBeenCalledWith(updated));
  });

  it('[CASE-STATUS-003] confirms a successful save', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ ...caseItem, status: 'Avslutat' })));
    render(<CaseStatusForm caseItem={caseItem} onUpdated={vi.fn()} />);

    await submitStatus();

    expect(await screen.findByRole('status')).toHaveTextContent('Status sparad.');
  });

  it('[CASE-STATUS-003] prevents duplicate submissions while saving', async () => {
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise<Response>(() => {})));
    render(<CaseStatusForm caseItem={caseItem} onUpdated={vi.fn()} />);

    await submitStatus();

    expect(screen.getByRole('button', { name: 'Sparar…' })).toBeDisabled();
  });

  it.each([
    { status: 400, error: 'Välj en giltig status.', requirement: 'CASE-STATUS-002' },
    { status: 404, error: 'Ärendet hittades inte.', requirement: 'CASE-STATUS-004' }
  ])('[$requirement] displays API error for HTTP $status', async ({ status, error }) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ error }, status)));
    render(<CaseStatusForm caseItem={caseItem} onUpdated={vi.fn()} />);

    await submitStatus();

    expect(await screen.findByRole('alert')).toHaveTextContent(error);
  });

  it('[CASE-STATUS-003] displays a readable network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network unavailable')));
    render(<CaseStatusForm caseItem={caseItem} onUpdated={vi.fn()} />);

    await submitStatus();

    expect(await screen.findByRole('alert')).toHaveTextContent('Status kunde inte sparas. Försök igen.');
  });

  it('[CASE-STATUS-003] displays a readable server failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ error: 'Database failure' }, 500)));
    render(<CaseStatusForm caseItem={caseItem} onUpdated={vi.fn()} />);

    await submitStatus();

    expect(await screen.findByRole('alert')).toHaveTextContent('Status kunde inte sparas. Försök igen.');
  });

  it('[CASE-STATUS-003] displays an error for invalid JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('invalid json')));
    render(<CaseStatusForm caseItem={caseItem} onUpdated={vi.fn()} />);

    await submitStatus();

    expect(await screen.findByRole('alert')).toHaveTextContent('Status kunde inte sparas. Försök igen.');
  });

  it('[CASE-STATUS-003] allows retrying after a failed save', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn()
        .mockRejectedValueOnce(new Error('Network unavailable'))
        .mockResolvedValueOnce(jsonResponse({ ...caseItem, status: 'Avslutat' }))
    );
    render(<CaseStatusForm caseItem={caseItem} onUpdated={vi.fn()} />);
    await submitStatus();
    await screen.findByRole('alert');

    await userEvent.click(screen.getByRole('button', { name: 'Spara status' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Status sparad.');
  });

  it.each([
    { id: 7 },
    { ...caseItem, id: 8, status: 'Avslutat' },
    { ...caseItem, status: 'Okänd' }
  ])('[CASE-STATUS-003] reports an invalid saved-case response %j', async (body) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(body)));
    render(<CaseStatusForm caseItem={caseItem} onUpdated={vi.fn()} />);

    await submitStatus();

    expect(await screen.findByRole('alert')).toHaveTextContent('Status kunde inte sparas. Försök igen.');
  });
});
