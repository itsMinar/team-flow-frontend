import { parseAuditSearchParams } from "@/features/audit/schemas";
import { describe, expect, it } from "vitest";

describe("audit URL filters", () => {
  it("defaults to the first page and rejects invalid pagination", () => {
    const defaults = parseAuditSearchParams(new URLSearchParams());
    expect(defaults.success).toBe(true);
    if (defaults.success)
      expect(defaults.data).toEqual({ page: 1, page_size: 20 });
    expect(
      parseAuditSearchParams(new URLSearchParams("page_size=101")).success,
    ).toBe(false);
  });

  it("rejects since filters older than the backend 90-day window", () => {
    const since = new Date(Date.now() - 91 * 24 * 60 * 60 * 1000).toISOString();
    expect(
      parseAuditSearchParams(
        new URLSearchParams(`since=${encodeURIComponent(since)}`),
      ).success,
    ).toBe(false);
  });
});
