export type CaseStatus = "new" | "in_progress" | "waiting_for_customer" | "closed";

export const caseOptions = {
  categories: ["Account", "Billing", "Technical support", "Other"],
  priorities: ["Low", "Normal", "High", "Urgent"],
  statuses: [
    { value: "new", label: "New" },
    { value: "in_progress", label: "In progress" },
    { value: "waiting_for_customer", label: "Waiting for customer" },
    { value: "closed", label: "Closed" },
  ] satisfies ReadonlyArray<{ value: CaseStatus; label: string }>,
} as const;
