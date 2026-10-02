import { describe, expect, it } from "vitest";
import { safeNextPath } from "@/features/auth/navigation";

describe("safeNextPath", () => {
  it("keeps internal destinations and rejects external redirects", () => {
    expect(safeNextPath("/orgs/acme?tab=projects")).toBe(
      "/orgs/acme?tab=projects",
    );
    expect(safeNextPath("//outside.example")).toBe("/orgs");
    expect(safeNextPath("https://outside.example")).toBe("/orgs");
    expect(safeNextPath(null)).toBe("/orgs");
  });
});
