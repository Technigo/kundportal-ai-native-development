import { useEffect, useState } from "react";
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
      ) : (
        <CaseOverview onCreateCase={() => { window.location.hash = "#/new"; }} />
      )}
    </div>
  );
}
