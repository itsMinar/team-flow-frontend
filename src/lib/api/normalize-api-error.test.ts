import { describe, expect, it } from "vitest";
import { normalizeApiError } from "@/lib/api/normalize-api-error";

describe("normalizeApiError", () => {
  it("unwraps the OpenAPI error envelope", () => {
    const error = {
      isAxiosError: true,
      response: {
        status: 403,
        data: {
          error: {
            code: "FORBIDDEN",
            message: "Not allowed",
            details: { role: "Permission required" },
            request_id: "req-123",
          },
        },
      },
    };

    expect(normalizeApiError(error)).toEqual({
      code: "FORBIDDEN",
      message: "Not allowed",
      details: { role: "Permission required" },
      requestId: "req-123",
    });
  });

  it("does not expose transport error messages", () => {
    const normalized = normalizeApiError(
      new Error("sensitive transport detail"),
    );

    expect(normalized.code).toBe("UNKNOWN_ERROR");
    expect(normalized.message).not.toContain("sensitive transport detail");
  });
});
