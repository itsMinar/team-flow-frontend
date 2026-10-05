import { permissionKeys } from "@/features/permissions/permissions";
import { z } from "zod";

export const roleFormSchema = z.object({
  name: z.string().trim().min(1, "Role name is required").max(100),
  description: z.string().max(500).default(""),
  permissions: z.array(z.enum(permissionKeys)).max(20),
});

export type RoleFormValues = z.infer<typeof roleFormSchema>;
export type RoleFormInput = z.input<typeof roleFormSchema>;
