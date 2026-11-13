import type { Arende } from "../types/arende";
import { countByStatus } from "../utils/countByStatus";
import { StatusBadge } from "./StatusBadge";

interface Props {
  arenden: readonly Arende[];
}

// Counts all loaded cases, not only the filtered ones (SO-R2). Display only (SO-R4).
export function StatusOverview({ arenden }: Props) {
  return (
    <ul className="overview" aria-label="Antal ärenden per status">
      {countByStatus(arenden).map(({ status, count }) => (
        <li key={status}>
          <StatusBadge status={status} /> {count}
        </li>
      ))}
    </ul>
  );
}
