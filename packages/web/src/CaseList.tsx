import { useEffect, useState } from 'react';

interface CaseSummary {
  id: number;
  title: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
}

interface CaseListProps {
  refreshKey?: number;
}

function isCaseSummary(value: unknown): value is CaseSummary {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  return (
    'id' in value &&
    typeof value.id === 'number' &&
    'title' in value &&
    typeof value.title === 'string' &&
    'category' in value &&
    typeof value.category === 'string' &&
    'priority' in value &&
    typeof value.priority === 'string' &&
    'status' in value &&
    typeof value.status === 'string' &&
    'createdAt' in value &&
    typeof value.createdAt === 'string'
  );
}

export function CaseList({ refreshKey = 0 }: CaseListProps) {
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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
    <section className="case-list" aria-labelledby="case-list-title">
      <h2 id="case-list-title">Ärenden</h2>
      {loading && <p role="status">Laddar ärenden…</p>}
      {error && (
        <p className="form-message form-message--error" role="alert">
          Ärendena kunde inte hämtas. Försök igen.
        </p>
      )}
      {!loading && !error && cases.length === 0 && <p>Inga ärenden ännu.</p>}
      {!loading && !error && cases.length > 0 && (
        <ul className="case-items" aria-labelledby="case-list-title">
          {cases.map((caseItem) => (
            <li className="case-item" key={caseItem.id}>
              <div className="case-item__heading">
                <h3>{caseItem.title}</h3>
                <span className="case-status">{caseItem.status}</span>
              </div>
              <p className="case-item__details">
                {caseItem.category} · Prioritet: {caseItem.priority} · Skapad{' '}
                {new Date(caseItem.createdAt).toLocaleString('sv-SE')}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
