import { getDb } from "./client";
import { tickets } from "./schema";

const db = getDb();
const day = 24 * 60 * 60 * 1000;
const daysAgo = (n: number) => new Date(Date.now() - n * day);

await db.insert(tickets).values([
  { requesterName: "Anna Berg", requesterEmail: "anna.berg@example.com", subject: "Invoice shows the wrong VAT rate", description: "Invoice 2026-0912 uses 25% instead of 12%.", category: "Billing", status: "open", priority: "high", createdAt: daysAgo(1) },
  { requesterName: "Erik Lindqvist", requesterEmail: "erik.lindqvist@example.com", subject: "Change delivery address", description: "Please ship future orders to our new office.", category: "Delivery", status: "in_progress", priority: "normal", createdAt: daysAgo(4) },
  { requesterName: "Maja Ek", subject: "Add a second user to our account", description: "Our accountant needs read access. Reported by phone.", category: "Account", status: "closed", priority: "low", createdAt: daysAgo(12) },
]);

console.log("Seeded 3 tickets.");
