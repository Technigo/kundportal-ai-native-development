import { useEffect, useState } from 'react';

type ApiStatus = 'checking' | 'connected' | 'unavailable';

export function App() {
  const [apiStatus, setApiStatus] = useState<ApiStatus>('checking');

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
        <h1 id="welcome-title">En tydligare överblick över kundärenden.</h1>
        <p className="intro">Här samlar vi arbetet med kundserviceportalen.</p>
        <div className={`connection connection--${apiStatus}`} role="status">
          <span className="connection-dot" aria-hidden="true" />
          {apiStatus === 'checking' && 'Kontrollerar anslutning till API…'}
          {apiStatus === 'connected' && 'Frontend och API är anslutna'}
          {apiStatus === 'unavailable' && 'API:et kunde inte nås'}
        </div>
        <p className="coming-soon">Ärendehantering kommer i nästa steg.</p>
      </section>
    </main>
  );
}
