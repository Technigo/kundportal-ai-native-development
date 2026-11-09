import { describe, expect, it } from "vitest";
import { newTicketSchema, statusChangeSchema, ticketStatuses } from "./ticketSchema";

const valid = { requesterName: "Ada Lovelace", subject: "Cannot download invoice", description: "The PDF link returns an error." };

describe("newTicketSchema", () => {
  it("accepts a valid ticket and defaults priority to normal", () => {
    const result = newTicketSchema.safeParse(valid);
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ ...valid, priority: "normal" });
  });

  it("trims whitespace around subject and description", () => {
    const result = newTicketSchema.safeParse({ requesterName: "Ada", subject: "  Hello there  ", description: "  Body  " });
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

  it("rejects an empty description and one over 5000 characters", () => {
    expect(newTicketSchema.safeParse({ ...valid, description: "" }).success).toBe(false);
    expect(newTicketSchema.safeParse({ ...valid, description: "x".repeat(5001) }).success).toBe(false);
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
