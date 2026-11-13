import { STATUSAR } from "../constants/arende";
import type { Arende, ArendeStatus } from "../types/arende";

export interface StatusCount {
  status: ArendeStatus;
  count: number;
}

// All four statuses in the spec's order, also those with 0 cases (SO-R1).
export function countByStatus(arenden: readonly Arende[]): StatusCount[] {
  return STATUSAR.map((status) => ({
    status,
    count: arenden.filter((a) => a.status === status).length,
  }));
}
