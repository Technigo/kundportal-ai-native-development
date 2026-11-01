import { useEffect, useState } from 'react';
import { CaseForm, type CreatedCase } from './CaseForm';

type ApiStatus = 'checking' | 'connected' | 'unavailable';

export function App() {
  const [apiStatus, setApiStatus] = useState<ApiStatus>('checking');
  const [createdCase, setCreatedCase] = useState<CreatedCase | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`API responded with ${response.status}`);
        }
        return response.json() as Promise<{ status: string }>;
      })
      .then(({ status }) => {
        setApiStatus(status === 'ok' ? 'connected' : 'unavailable');
      })
      .catch(() => {
        setApiStatus('unavailable');
      });
  }, []);

  return (
    <main className="shell">
      <header className="topbar">
        <span className="brand-mark" aria-hidden="true">K</span>
        <span>Kundserviceportalen</span>
      </header>
      <section className="welcome" aria-labelledby="welcome-title">
        <p className="eyebrow">INTERNT VERKTYG</p>
        <h1 id="welcome-title">Registrera ett kundärende.</h1>
        <p className="intro">Samla ärendeuppgifter på ett ställe.</p>
        <div className={`connection connection--${apiStatus}`} role="status">
          <span className="connection-dot" aria-hidden="true" />
          {apiStatus === 'checking' && 'Kontrollerar anslutning till API…'}
          {apiStatus === 'connected' && 'Frontend och API är anslutna'}
          {apiStatus === 'unavailable' && 'API:et kunde inte nås'}
        </div>
        {apiStatus === 'unavailable' && (
          <p className="form-message form-message--error" role="alert">
            Det går inte att nå tjänsten. Starta om projektet och försök igen.
          </p>
        )}
        <CaseForm onCreated={setCreatedCase} />
        {createdCase && (
          <p className="created-summary">
            Ärende #{createdCase.id} sparades med status {createdCase.status}.
          </p>
        )}
      </section>
    </main>
  );
}
