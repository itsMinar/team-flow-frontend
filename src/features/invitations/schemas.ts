import { passwordSchema } from "@/features/auth/schemas";
import { z } from "zod";

export const invitationStatuses = [
  "pending",
  "accepted",
  "revoked",
  "expired",
] as const;

export const invitationSearchSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  page_size: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(invitationStatuses).optional(),
  email: z.string().email().optional(),
  sort: z.enum(["created_at", "expires_at", "email"]).default("created_at"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export const invitationFormSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  role_id: z.string().uuid("Choose a role"),
});

export const newInviteeSchema = z.object({
  password: passwordSchema,
  first_name: z.string().trim().min(1).max(100),
  last_name: z.string().trim().min(1).max(100),
});

export type InvitationSearch = z.infer<typeof invitationSearchSchema>;
export type InvitationFormValues = z.infer<typeof invitationFormSchema>;
export type NewInviteeValues = z.infer<typeof newInviteeSchema>;

export function parseInvitationSearchParams(params: URLSearchParams) {
  return invitationSearchSchema.safeParse(Object.fromEntries(params.entries()));
}
