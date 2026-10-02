import { describe, expect, it } from "vitest";
import { parseProjectSearchParams } from "@/features/projects/schemas";

describe("project URL filters", () => {
  it("applies default pagination and sorting", () => {
    const result = parseProjectSearchParams(new URLSearchParams());

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        page: 1,
        page_size: 20,
        sort: "updated_at",
        order: "desc",
      });
    }
  });

  it("rejects invalid page and page size instead of clamping", () => {
    expect(
      parseProjectSearchParams(new URLSearchParams("page=0&page_size=101"))
        .success,
    ).toBe(false);
  });

  it("rejects unsupported server sort keys", () => {
    expect(
      parseProjectSearchParams(new URLSearchParams("sort=organization_id"))
        .success,
    ).toBe(false);
  });
});
