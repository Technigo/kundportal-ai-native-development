import { useEffect, useRef, useState } from "react";
import { ApiError, UNKNOWN_ERROR_MESSAGE } from "../api/apiError";
import { getArende } from "../api/arendenApi";
import type { Arende } from "../types/arende";
import { formatDate } from "../utils/formatDate";
import { StatusBadge } from "./StatusBadge";
import { StatusSelect } from "./StatusSelect";

interface Props {
  id: number;
  onClose: () => void;
  onChanged: (arende: Arende) => void;
}

type State =
  { kind: "loading" } | { kind: "error"; message: string } | { kind: "loaded"; arende: Arende };

function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : UNKNOWN_ERROR_MESSAGE;
}

export function ArendeDetail({ id, onClose, onChanged }: Props) {
  const [state, setState] = useState<State>({ kind: "loading" });
  const currentId = useRef(id);
  currentId.current = id;

  useEffect(() => {
    let active = true;
    setState({ kind: "loading" });
    getArende(id)
      .then((arende) => active && setState({ kind: "loaded", arende }))
      .catch(
        (error: unknown) => active && setState({ kind: "error", message: errorMessage(error) }),
      );
    return () => {
      active = false;
    };
  }, [id]);

  function handleChanged(arende: Arende) {
    // The user may have opened another case while the status request was in flight.
    if (arende.id === currentId.current) {
      setState({ kind: "loaded", arende });
    }
    onChanged(arende);
  }

  return (
    <div className="detail">
      <div className="panel__top">
        <p className="eyebrow">Ärende #{id}</p>
        <button type="button" className="icon-button" onClick={onClose} aria-label="Stäng">
          ×
        </button>
      </div>

      {state.kind === "loading" && <p role="status">Laddar ärende…</p>}

      {state.kind === "error" && (
        <p role="alert" className="alert">
          {state.message}
        </p>
      )}

      {state.kind === "loaded" && (
        <>
          <h2>{state.arende.rubrik}</h2>
          <dl className="details">
            <dt>Id</dt>
            <dd>{state.arende.id}</dd>
            <dt>Status</dt>
            <dd>
              <StatusBadge status={state.arende.status} />
            </dd>
            <dt>Kategori</dt>
            <dd>{state.arende.kategori}</dd>
            <dt>Prioritet</dt>
            <dd>{state.arende.prioritet}</dd>
            <dt>Skapad</dt>
            <dd>
              <time dateTime={state.arende.skapad}>{formatDate(state.arende.skapad)}</time>
            </dd>
            <dt>Beskrivning</dt>
            <dd className="details__text">{state.arende.beskrivning}</dd>
          </dl>

          <StatusSelect arende={state.arende} onChanged={handleChanged} />
        </>
      )}
    </div>
  );
}
