import { passwordSchema, registerSchema } from "@/features/auth/schemas";
import { describe, expect, it } from "vitest";

describe("auth form schemas", () => {
  it("matches the backend's UTF-8 password byte and strength rules", () => {
    expect(passwordSchema.safeParse("Abcdefg1").success).toBe(true);
    expect(passwordSchema.safeParse("a".repeat(71) + "1").success).toBe(true);
    expect(passwordSchema.safeParse("a".repeat(72) + "1").success).toBe(false);
    expect(passwordSchema.safeParse("é".repeat(3) + "a1").success).toBe(true);
    expect(passwordSchema.safeParse("abcdefgh").success).toBe(false);
  });

  it("accepts the backend's 8-byte minimum at registration", () => {
    const result = registerSchema.safeParse({
      email: "owner@example.com",
      password: "Abcdefg1",
      first_name: "Ada",
      last_name: "Lovelace",
      organization_name: "Analytical Engine",
    });

    expect(result.success).toBe(true);
  });
});
