import { z } from "zod";

export const projectStatuses = [
  "planning",
  "active",
  "on_hold",
  "completed",
  "archived",
] as const;

export const projectPriorities = ["low", "medium", "high", "urgent"] as const;

export const projectSortKeys = [
  "created_at",
  "updated_at",
  "name",
  "due_date",
  "priority",
] as const;

export const projectSearchSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  page_size: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(projectStatuses).optional(),
  priority: z.enum(projectPriorities).optional(),
  team_id: z.string().uuid().optional(),
  sort: z.enum(projectSortKeys).default("updated_at"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export const projectFormSchema = z.object({
  name: z.string().trim().min(1, "Project name is required").max(150),
  description: z.string().max(5000).default(""),
  status: z.enum(projectStatuses),
  priority: z.enum(projectPriorities),
  start_date: z.string().default(""),
  due_date: z.string().default(""),
});

export type ProjectSearch = z.infer<typeof projectSearchSchema>;
export type ProjectFormValues = z.infer<typeof projectFormSchema>;
export type ProjectFormInput = z.input<typeof projectFormSchema>;

export function parseProjectSearchParams(params: URLSearchParams) {
  return projectSearchSchema.safeParse(Object.fromEntries(params.entries()));
}
