// Placeholder values for the MVP. Confirm these option values with Daniel
// before connecting the form to the backend contract.
export const caseOptions = {
  categories: ["Account", "Billing", "Technical support", "Other"],
  priorities: ["Low", "Normal", "High", "Urgent"],
  statuses: ["New", "In progress", "Waiting for customer", "Closed"],
} as const;
