import { useEffect, useState } from 'react';
import { isCreatedCase, type CreatedCase } from './caseTypes';
import { CaseStatusForm } from './CaseStatusForm';
import { CaseNoteForm } from './CaseNoteForm';

type DetailState =
  | { status: 'loading' }
  | { status: 'loaded'; caseItem: CreatedCase }
  | { status: 'error'; message: string };

interface CaseDetailProps {
  caseId: number;
  onUpdated?: (caseItem: CreatedCase) => void;
}

export function CaseDetail({ caseId, onUpdated }: CaseDetailProps) {
  const [state, setState] = useState<DetailState>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    setState({ status: 'loading' });

    async function loadCase() {
      try {
        const response = await fetch(`/api/cases/${caseId}`);
        if (response.status === 404) {
          if (active) {
            setState({ status: 'error', message: 'Ärendet hittades inte.' });
          }
          return;
        }

        if (!response.ok) {
          throw new Error(`API responded with ${response.status}`);
        }

        const body: unknown = await response.json();
        if (!isCreatedCase(body)) {
          throw new Error('API returned invalid case details.');
        }

        if (active) {
          setState({ status: 'loaded', caseItem: body });
        }
      } catch {
        if (active) {
          setState({ status: 'error', message: 'Ärendet kunde inte hämtas. Försök igen.' });
        }
      }
    }

    void loadCase();
    return () => {
      active = false;
    };
  }, [caseId]);

  function handleUpdated(updated: CreatedCase, field: 'status' | 'note') {
    setState((current) =>
      current.status === 'loaded' && current.caseItem.id === updated.id
        ? { status: 'loaded', caseItem: { ...current.caseItem, [field]: updated[field] } }
        : current
    );
    if (field === 'status') {
      onUpdated?.(updated);
    }
  }

  return (
    <section
      className="case-detail"
      id="case-detail"
      aria-label={state.status === 'loaded' ? state.caseItem.title : 'Ärendedetalj'}
    >
      {state.status === 'loading' && <p role="status">Laddar ärende…</p>}
      {state.status === 'error' && (
        <p className="form-message form-message--error" role="alert">{state.message}</p>
      )}
      {state.status === 'loaded' && (
        <>
          <h2>{state.caseItem.title}</h2>
          <dl className="case-detail__fields">
            <dt>Beskrivning</dt>
            <dd className="case-detail__description">{state.caseItem.description}</dd>
            <dt>Kategori</dt>
            <dd>{state.caseItem.category}</dd>
            <dt>Prioritet</dt>
            <dd>{state.caseItem.priority}</dd>
            <dt>Status</dt>
            <dd><span className="case-status">{state.caseItem.status}</span></dd>
            <dt>Skapad</dt>
            <dd>
              <time dateTime={state.caseItem.createdAt}>
                {new Date(state.caseItem.createdAt).toLocaleString('sv-SE')}
              </time>
            </dd>
          </dl>
          <CaseStatusForm
            key={`status-${state.caseItem.id}`}
            caseItem={state.caseItem}
            onUpdated={(updated) => handleUpdated(updated, 'status')}
          />
          <CaseNoteForm
            key={`note-${state.caseItem.id}`}
            caseItem={state.caseItem}
            onUpdated={(updated) => handleUpdated(updated, 'note')}
          />
        </>
      )}
    </section>
  );
}
