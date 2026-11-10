import { useEffect, useState } from "react";
import CaseDetail from "./CaseDetail";
import CaseOverview from "./CaseOverview";
import CreateCaseForm from "./CreateCaseForm";

function readRoute() {
  return window.location.hash || "#/cases";
}

export default function App() {
  const [route, setRoute] = useState(readRoute);

  useEffect(() => {
    if (!window.location.hash) window.location.hash = "#/cases";
    const handleRouteChange = () => setRoute(readRoute());
    window.addEventListener("hashchange", handleRouteChange);
    return () => window.removeEventListener("hashchange", handleRouteChange);
  }, []);

  function navigateToOverview() {
    window.location.hash = "#/cases";
  }

  const detailMatch = route.match(/^#\/cases\/([^/]+)$/);
  const editMatch = route.match(/^#\/cases\/([^/]+)\/edit$/);
  const caseId = detailMatch ? decodeURIComponent(detailMatch[1]) : null;
  const editCaseId = editMatch ? decodeURIComponent(editMatch[1]) : null;

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand-button" type="button" onClick={navigateToOverview} aria-label="Go to Cases overview">
          <span className="brand-mark" aria-hidden="true">CS</span>
          <span>
            <span className="eyebrow">Customer service portal</span>
            <span className="brand-name">Support workspace</span>
          </span>
        </button>
        <span className="internal-badge">Internal</span>
      </header>

      {route === "#/new" ? (
        <CreateCaseForm onBack={navigateToOverview} />
      ) : editCaseId ? (
        <CreateCaseForm mode="edit" caseId={editCaseId} onBack={() => { window.location.hash = `#/cases/${encodeURIComponent(editCaseId)}`; }} />
      ) : caseId ? (
        <CaseDetail caseId={caseId} onBack={navigateToOverview} />
      ) : (
        <CaseOverview onCreateCase={() => { window.location.hash = "#/new"; }} />
      )}
    </div>
  );
}
