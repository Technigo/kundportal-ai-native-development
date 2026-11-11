import { useEffect, useRef, useState } from 'react';
import { CaseForm, type CreatedCase } from './CaseForm';
import { CaseList } from './CaseList';

type View = 'list' | 'create';

export function App() {
  const [view, setView] = useState<View>('list');
  const [createdCase, setCreatedCase] = useState<CreatedCase | null>(null);
  const [listRefresh, setListRefresh] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const focusHeadingAfterMenuNavigation = useRef(false);

  useEffect(() => {
    if (!focusHeadingAfterMenuNavigation.current) return;

    headingRef.current?.focus();
    document.title = view === 'list' ? 'Alla ärenden' : 'Skapa ärende';
    focusHeadingAfterMenuNavigation.current = false;
  }, [view]);

  function handleMenuNavigation(nextView: View) {
    if (nextView === view) return;

    focusHeadingAfterMenuNavigation.current = true;
    setView(nextView);
  }

  function handleCreated(caseItem: CreatedCase) {
    setCreatedCase(caseItem);
    setListRefresh((refresh) => refresh + 1);
    setView('list');
  }

  return (
    <main className="shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Kundserviceportalen – startsida" tabIndex={0}>
          <span className="brand-mark" aria-hidden="true">K</span>
          <span>Kundserviceportalen</span>
        </a>
        <nav className="main-nav main-nav--tabs" aria-label="Huvudmeny">
          <button
            className="main-nav__item case-edit-button"
            type="button"
            aria-current={view === 'list' ? 'page' : undefined}
            onClick={() => handleMenuNavigation('list')}
          >
            Alla ärenden
          </button>
          <button
            className="main-nav__item case-edit-button"
            type="button"
            aria-current={view === 'create' ? 'page' : undefined}
            onClick={() => handleMenuNavigation('create')}
          >
            Skapa ärende
          </button>
        </nav>
      </header>
      <section className="welcome" aria-labelledby="workspace-title">
        <div className="workspace-heading">
          <div>
            <h1 ref={headingRef} id="workspace-title" tabIndex={-1}>
              {view === 'list' ? 'Alla ärenden' : 'Skapa ärende'}
            </h1>
            <p className="intro">
              {view === 'list'
                ? 'Håll koll på inkomna kundärenden och deras status.'
                : 'Fyll i uppgifterna för att registrera ett nytt ärende.'}
            </p>
          </div>
        </div>
        <div className="workspace-content">
          {view === 'create' ? (
            <CaseForm onCreated={handleCreated} />
          ) : (
            <>
              {createdCase && (
                <p className="created-summary" role="status">
                  Ärende #{createdCase.id} sparades med status {createdCase.status}.
                </p>
              )}
              <CaseList refreshKey={listRefresh} onCreateCase={() => setView('create')} />
            </>
          )}
        </div>
      </section>
    </main>
  );
}
