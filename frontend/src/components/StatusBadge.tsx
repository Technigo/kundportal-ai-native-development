import type { ArendeStatus } from "../types/arende";

const VARIANT: Record<ArendeStatus, string> = {
  Nytt: "new",
  Pågående: "progress",
  "Väntar på kund": "waiting",
  Avslutat: "closed",
};

export function StatusBadge({ status }: { status: ArendeStatus }) {
  return <span className={`badge badge--${VARIANT[status]}`}>{status}</span>;
}
