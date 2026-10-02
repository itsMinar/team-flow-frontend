import { mapApiErrorToForm } from "@/features/auth/form-errors";
import type { RegisterValues } from "@/features/auth/schemas";
import type { UseFormSetError } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";

describe("mapApiErrorToForm", () => {
  it("maps known validation fields and returns unmatched messages", () => {
    const setError = vi.fn<UseFormSetError<RegisterValues>>();
    const error = {
      isAxiosError: true,
      response: {
        status: 400,
        data: {
          error: {
            code: "VALIDATION_ERROR",
            message: "Check the submitted fields",
            details: {
              email: "Email is already used",
              server_only_field: "This field is invalid",
            },
          },
        },
      },
    };

    const message = mapApiErrorToForm<RegisterValues>(
      error,
      ["email", "password", "first_name", "last_name", "organization_name"],
      setError,
    );

    expect(setError).toHaveBeenCalledWith("email", {
      type: "server",
      message: "Email is already used",
    });
    expect(message).toBe("This field is invalid");
  });
});
