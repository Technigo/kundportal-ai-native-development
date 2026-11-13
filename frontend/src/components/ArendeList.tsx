import type { Arende } from "../types/arende";
import { formatDate } from "../utils/formatDate";
import { StatusBadge } from "./StatusBadge";

interface Props {
  arenden: readonly Arende[];
  hasFilter: boolean;
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export function ArendeList({ arenden, hasFilter, selectedId, onSelect }: Props) {
  if (arenden.length === 0) {
    return (
      <p className="empty" role="status">
        {hasFilter ? "Inga ärenden matchar" : "Inga ärenden ännu"}
      </p>
    );
  }

  return (
    <table className="table">
      <thead>
        <tr>
          <th scope="col">Rubrik</th>
          <th scope="col">Status</th>
          <th scope="col">Prioritet</th>
          <th scope="col">Skapad</th>
        </tr>
      </thead>
      <tbody>
        {arenden.map((arende) => {
          const selected = arende.id === selectedId;
          return (
            // Whole row is clickable for mouse users; the title button gives keyboard access.
            <tr
              key={arende.id}
              className={selected ? "table__row table__row--selected" : "table__row"}
              onClick={() => onSelect(arende.id)}
            >
              <td>
                <button
                  type="button"
                  className="link"
                  aria-current={selected ? "true" : undefined}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(arende.id);
                  }}
                >
                  {arende.rubrik}
                </button>
              </td>
              <td>
                <StatusBadge status={arende.status} />
              </td>
              <td>{arende.prioritet}</td>
              <td>
                <time dateTime={arende.skapad}>{formatDate(arende.skapad)}</time>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
