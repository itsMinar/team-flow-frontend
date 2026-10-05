import { z } from "zod";

export const apiKeySearchSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  page_size: z.coerce.number().int().min(1).max(100).default(20),
  include_revoked: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  sort: z
    .enum(["created_at", "expires_at", "last_used_at"])
    .default("created_at"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export const createAPIKeySchema = z.object({
  name: z.string().trim().min(1, "Key name is required").max(100),
  expires_in_days: z.coerce.number().int().min(0).default(0),
});

export type APIKeySearch = z.infer<typeof apiKeySearchSchema>;
export type CreateAPIKeyValues = z.infer<typeof createAPIKeySchema>;
export type CreateAPIKeyInput = z.input<typeof createAPIKeySchema>;

export function parseAPIKeySearchParams(params: URLSearchParams) {
  return apiKeySearchSchema.safeParse(Object.fromEntries(params.entries()));
}
