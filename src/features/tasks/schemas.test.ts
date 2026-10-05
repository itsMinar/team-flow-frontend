import { describe, expect, it } from "vitest";
import { parseTaskSearchParams } from "@/features/tasks/schemas";

describe("task URL filters", () => {
  it("uses valid pagination defaults", () => {
    const result = parseTaskSearchParams(new URLSearchParams());

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toMatchObject({
        page: 1,
        page_size: 20,
        sort: "updated_at",
        order: "desc",
      });
    }
  });

  it("rejects out-of-range pagination and invalid status", () => {
    expect(
      parseTaskSearchParams(
        new URLSearchParams("page=0&page_size=101&status=finished"),
      ).success,
    ).toBe(false);
  });

  it("parses unassigned as a real boolean", () => {
    const result = parseTaskSearchParams(
      new URLSearchParams("unassigned=false"),
    );

    expect(result.success && result.data.unassigned).toBe(false);
  });
});
