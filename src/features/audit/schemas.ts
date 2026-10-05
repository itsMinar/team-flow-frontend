import { z } from "zod";

const maxAuditAge = 90 * 24 * 60 * 60 * 1000;

export const auditSearchSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  page_size: z.coerce.number().int().min(1).max(100).default(20),
  action: z.string().max(100).optional(),
  outcome: z.enum(["success", "failure", "denied"]).optional(),
  actor_user_id: z.string().uuid().optional(),
  since: z
    .string()
    .datetime({ offset: true })
    .refine((value) => {
      const age = Date.now() - new Date(value).getTime();
      return age <= maxAuditAge && age >= 0;
    }, "Choose a time within the last 90 days")
    .optional(),
});

export type AuditSearch = z.infer<typeof auditSearchSchema>;

export function parseAuditSearchParams(params: URLSearchParams) {
  return auditSearchSchema.safeParse(Object.fromEntries(params.entries()));
}
