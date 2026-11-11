import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { CaseDetail } from './CaseDetail';
import { isCaseSummary, type CaseSummary } from './caseTypes';

interface CaseListProps {
  refreshKey?: number;
  onCreateCase?: () => void;
}

export function CaseList({ refreshKey = 0, onCreateCase }: CaseListProps) {
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<number | null>(null);
  const [focusCaseButtonId, setFocusCaseButtonId] = useState<number | null>(null);
  const expandButtonRefs = useRef(new Map<number, HTMLButtonElement>());

  useLayoutEffect(() => {
    if (selectedCaseId === null && focusCaseButtonId !== null) {
      expandButtonRefs.current.get(focusCaseButtonId)?.focus();
      setFocusCaseButtonId(null);
    }
  }, [selectedCaseId, focusCaseButtonId]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);

    fetch('/api/cases')
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`API responded with ${response.status}`);
        }

        const body: unknown = await response.json();
        if (!Array.isArray(body) || !body.every(isCaseSummary)) {
          throw new Error('API returned an invalid case list.');
        }

        return body;
      })
      .then((loadedCases) => {
        if (active) {
          setCases(loadedCases);
        }
      })
      .catch(() => {
        if (active) {
          setError(true);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [refreshKey]);

  return (
    <div className="case-workspace">
      <section className="case-list" aria-label="Alla ärenden">
        {loading && <p role="status">Laddar ärenden…</p>}
        {error && (
          <p className="form-message form-message--error" role="alert">
            Ärendena kunde inte hämtas. Försök igen.
          </p>
        )}
        {!loading && !error && cases.length === 0 && (
          <div className="case-empty">
            <p>Du har inga ärenden ännu.</p>
            <p>Skapa ditt första ärende för att börja hålla ordning på kundernas frågor.</p>
            {onCreateCase && (
              <button className="primary-button" type="button" onClick={onCreateCase}>
                Skapa ditt första ärende
              </button>
            )}
          </div>
        )}
        {!loading && !error && cases.length > 0 && (
          <ul className="case-items" aria-label="Alla ärenden">
            {cases.map((caseItem) => (
              <li
                id={`case-item-${caseItem.id}`}
                className={`case-item${selectedCaseId === caseItem.id ? ' case-item--expanded' : ''}`}
                key={caseItem.id}
              >
                {selectedCaseId === caseItem.id ? (
                  <CaseDetail
                    key={caseItem.id}
                    caseId={caseItem.id}
                    onCollapse={() => {
                      setFocusCaseButtonId(caseItem.id);
                      setSelectedCaseId(null);
                    }}
                    onDeleted={() => {
                      setCases((current) => current.filter((item) => item.id !== caseItem.id));
                      setSelectedCaseId(null);
                    }}
                    onUpdated={(updated) => {
                      setCases((current) => current.map((item) =>
                        item.id === updated.id ? updated : item
                      ));
                    }}
                  />
                ) : (
                  <>
                    <div className="case-item__heading">
                      <div className="case-item__title">
                        <button
                          ref={(element) => {
                            if (element) {
                              expandButtonRefs.current.set(caseItem.id, element);
                            } else {
                              expandButtonRefs.current.delete(caseItem.id);
                            }
                          }}
                          className="case-expand-button"
                          type="button"
                          aria-label="Visa ärendedetaljer"
                          aria-expanded={false}
                          onClick={() => setSelectedCaseId(caseItem.id)}
                        >
                          <ChevronDown aria-hidden="true" size={18} strokeWidth={2} />
                        </button>
                        <h3>{caseItem.title}</h3>
                      </div>
                      <span className="case-status">{caseItem.status}</span>
                    </div>
                    <p className="case-item__description">{caseItem.description}</p>
                    <p className="case-item__details">
                      {caseItem.category} · Prioritet: {caseItem.priority} · Skapad{' '}
                      {new Date(caseItem.createdAt).toLocaleString('sv-SE')}
                    </p>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
