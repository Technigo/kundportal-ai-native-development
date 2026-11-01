import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CaseForm } from './CaseForm';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('CaseForm', () => {
  it('[CASE-CREATE-003] only offers allowed categories in a required dropdown', () => {
    render(<CaseForm onCreated={vi.fn()} />);
    const category = screen.getByRole('combobox', { name: 'Kategori' });

    expect(category).toBeRequired();
    expect(within(category).getAllByRole('option').map((option) => option.textContent)).toEqual([
      'Välj kategori',
      'Konto',
      'Fakturering',
      'Tekniskt',
      'Övrigt'
    ]);
  });

  it('[CASE-CREATE-004] only offers allowed priorities in a required dropdown', () => {
    render(<CaseForm onCreated={vi.fn()} />);
    const priority = screen.getByRole('combobox', { name: 'Prioritet' });

    expect(priority).toBeRequired();
    expect(within(priority).getAllByRole('option').map((option) => option.textContent)).toEqual([
      'Välj prioritet',
      'Låg',
      'Normal',
      'Hög'
    ]);
  });

  it('[CASE-CREATE-001] and [CASE-CREATE-002] mark required text fields and maximum lengths', () => {
    render(<CaseForm onCreated={vi.fn()} />);

    expect(screen.getByRole('textbox', { name: 'Rubrik' })).toBeRequired();
    expect(screen.getByRole('textbox', { name: 'Rubrik' })).toHaveAttribute('maxLength', '120');
    expect(screen.getByRole('textbox', { name: 'Beskrivning' })).toBeRequired();
    expect(screen.getByRole('textbox', { name: 'Beskrivning' })).toHaveAttribute('maxLength', '2000');
  });

  it('[CASE-CREATE-001], [CASE-CREATE-002], [CASE-CREATE-003] and [CASE-CREATE-004] submits trimmed required values', async () => {
    const onCreated = vi.fn();
    const createdCase = {
      id: 1,
      title: 'Ärende',
      description: 'Beskrivning',
      category: 'Tekniskt',
      priority: 'Hög',
      status: 'Nytt',
      createdAt: '2026-11-01T12:00:00.000Z'
    };
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(createdCase), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      })
    );
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();

    render(<CaseForm onCreated={onCreated} />);
    await user.type(screen.getByRole('textbox', { name: 'Rubrik' }), ' Ärende ');
    await user.type(screen.getByRole('textbox', { name: 'Beskrivning' }), ' Beskrivning ');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Kategori' }), 'Tekniskt');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Prioritet' }), 'Hög');
    await user.click(screen.getByRole('button', { name: 'Skapa ärende' }));

    expect(fetchMock).toHaveBeenCalledWith('/api/cases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Ärende',
        description: 'Beskrivning',
        category: 'Tekniskt',
        priority: 'Hög'
      })
    });
    expect(await screen.findByText('Ärende skapat: Ärende')).toBeInTheDocument();
    expect(onCreated).toHaveBeenCalledWith(createdCase);
  });

  it('[CASE-CREATE-007] displays a readable API validation error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: 'Rubrik måste anges.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      )
    );
    const user = userEvent.setup();

    render(<CaseForm onCreated={vi.fn()} />);
    await user.type(screen.getByRole('textbox', { name: 'Rubrik' }), 'Ärende');
    await user.type(screen.getByRole('textbox', { name: 'Beskrivning' }), 'Beskrivning');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Kategori' }), 'Tekniskt');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Prioritet' }), 'Hög');
    await user.click(screen.getByRole('button', { name: 'Skapa ärende' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Rubrik måste anges.');
  });

  it('[CASE-CREATE-008] allows creation without an internal note field', () => {
    render(<CaseForm onCreated={vi.fn()} />);

    expect(screen.queryByRole('textbox', { name: 'Intern anteckning' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Skapa ärende' })).toBeInTheDocument();
  });
});
