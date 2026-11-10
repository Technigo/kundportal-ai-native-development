import { describe, expect, it } from "vitest";
import { newTicketSchema, statusChangeSchema, ticketStatuses } from "./ticketSchema";

const valid = { requesterName: "Ada Lovelace", subject: "Cannot download invoice", description: "The PDF link returns an error.", category: "Billing" };

describe("newTicketSchema", () => {
  it("accepts a valid ticket and defaults priority to normal", () => {
    const result = newTicketSchema.safeParse(valid);
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ ...valid, priority: "normal" });
  });

  it("trims whitespace around subject and description", () => {
    const result = newTicketSchema.safeParse({ requesterName: "Ada", subject: "  Hello there  ", description: "  Body  ", category: "Billing" });
    expect(result.data).toMatchObject({ subject: "Hello there", description: "Body" });
  });

  it.each([
    ["empty", ""],
    ["too short", "ab"],
    ["too long", "x".repeat(121)],
  ])("rejects a subject that is %s", (_case, subject) => {
    const result = newTicketSchema.safeParse({ ...valid, subject });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["subject"]);
  });

  it.each([
    ["requesterName", "Please enter who contacted us."],
    ["subject", "Subject must be at least 3 characters."],
    ["description", "Please describe the problem."],
  ])("rejects %s with only spaces with a clear message", (field, message) => {
    const result = newTicketSchema.safeParse({ ...valid, [field]: "   " });
    expect(result.error?.issues).toEqual([expect.objectContaining({ path: [field], message })]);
  });

  it("accepts a subject of 3 characters and rejects 2 with a clear message", () => {
    expect(newTicketSchema.safeParse({ ...valid, subject: "abc" }).success).toBe(true);
    const result = newTicketSchema.safeParse({ ...valid, subject: "ab" });
    expect(result.error?.issues).toEqual([
      expect.objectContaining({ path: ["subject"], message: "Subject must be at least 3 characters." }),
    ]);
  });

  it.each([
    ["requesterName", 120, "Name must be at most 120 characters."],
    ["subject", 120, "Subject must be at most 120 characters."],
    ["description", 5000, "Description must be at most 5000 characters."],
  ])("accepts %s at %i characters and rejects one more with a clear message", (field, max, message) => {
    expect(newTicketSchema.safeParse({ ...valid, [field]: "x".repeat(max) }).success).toBe(true);
    const result = newTicketSchema.safeParse({ ...valid, [field]: "x".repeat(max + 1) });
    expect(result.error?.issues).toEqual([expect.objectContaining({ path: [field], message })]);
  });

  it("rejects an empty description and one over 5000 characters", () => {
    expect(newTicketSchema.safeParse({ ...valid, description: "" }).success).toBe(false);
    expect(newTicketSchema.safeParse({ ...valid, description: "x".repeat(5001) }).success).toBe(false);
  });

  it.each([
    ["empty", ""],
    ["only spaces", "   "],
  ])("rejects a category that is %s with a clear message", (_case, category) => {
    const result = newTicketSchema.safeParse({ ...valid, category });
    expect(result.error?.issues).toEqual([
      expect.objectContaining({ path: ["category"], message: "Please enter a category." }),
    ]);
  });

  it("accepts a category of 50 characters after trimming and rejects 51 with a clear message", () => {
    expect(newTicketSchema.safeParse({ ...valid, category: "x".repeat(50) }).success).toBe(true);
    expect(newTicketSchema.safeParse({ ...valid, category: ` ${"x".repeat(50)} ` }).success).toBe(true);
    const result = newTicketSchema.safeParse({ ...valid, category: "x".repeat(51) });
    expect(result.error?.issues).toEqual([
      expect.objectContaining({ path: ["category"], message: "Category must be at most 50 characters." }),
    ]);
  });

  it("trims whitespace around the category", () => {
    expect(newTicketSchema.safeParse({ ...valid, category: "  Billing  " }).data?.category).toBe("Billing");
  });

  it("accepts known priorities and rejects unknown ones", () => {
    expect(newTicketSchema.safeParse({ ...valid, priority: "high" }).data?.priority).toBe("high");
    expect(newTicketSchema.safeParse({ ...valid, priority: "urgent" }).success).toBe(false);
  });

  it("requires a requester name and trims it", () => {
    expect(newTicketSchema.safeParse({ ...valid, requesterName: "" }).error?.issues[0]?.path).toEqual(["requesterName"]);
    expect(newTicketSchema.safeParse({ ...valid, requesterName: "x".repeat(121) }).success).toBe(false);
    expect(newTicketSchema.safeParse({ ...valid, requesterName: "  Ada  " }).data?.requesterName).toBe("Ada");
  });

  it("treats the requester email as optional but rejects an invalid one", () => {
    expect(newTicketSchema.safeParse(valid).data?.requesterEmail).toBeUndefined();
    expect(newTicketSchema.safeParse({ ...valid, requesterEmail: "" }).data?.requesterEmail).toBeUndefined();
    expect(newTicketSchema.safeParse({ ...valid, requesterEmail: " ada@example.com " }).data?.requesterEmail).toBe(
      "ada@example.com",
    );
    const result = newTicketSchema.safeParse({ ...valid, requesterEmail: "not-an-email" });
    expect(result.error?.issues[0]?.path).toEqual(["requesterEmail"]);
  });

  it("accepts an email of 254 characters and rejects 255 with a clear message", () => {
    const email = (end: number) => `${"a".repeat(64)}@${"b".repeat(63)}.${"c".repeat(63)}.${"d".repeat(end)}.com`;
    expect(email(57)).toHaveLength(254);
    expect(newTicketSchema.safeParse({ ...valid, requesterEmail: email(57) }).success).toBe(true);
    const result = newTicketSchema.safeParse({ ...valid, requesterEmail: email(58) });
    expect(result.error?.issues).toEqual([
      expect.objectContaining({ path: ["requesterEmail"], message: "Email must be at most 254 characters." }),
    ]);
  });

  it("rejects an invalid email with a clear message and treats one with only spaces as no email", () => {
    const result = newTicketSchema.safeParse({ ...valid, requesterEmail: "not-an-email" });
    expect(result.error?.issues).toEqual([
      expect.objectContaining({ path: ["requesterEmail"], message: "Please enter a valid email address." }),
    ]);
    expect(newTicketSchema.safeParse({ ...valid, requesterEmail: "   " }).data?.requesterEmail).toBeUndefined();
  });

  it("strips unknown fields such as status", () => {
    const result = newTicketSchema.safeParse({ ...valid, status: "closed" });
    expect(result.data).not.toHaveProperty("status");
  });
});

describe("statusChangeSchema", () => {
  it.each(ticketStatuses)("accepts the status %s", (status) => {
    const result = statusChangeSchema.safeParse({ ticketId: 1, status });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ ticketId: 1, status });
  });

  it.each([
    ["resolved", "resolved"],
    ["an empty string", ""],
  ])('rejects %s with "Invalid status."', (_case, status) => {
    const result = statusChangeSchema.safeParse({ ticketId: 1, status });
    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual([
      expect.objectContaining({ path: ["status"], message: "Invalid status." }),
    ]);
  });
});
