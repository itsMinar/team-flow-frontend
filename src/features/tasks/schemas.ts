import { z } from "zod";

export const taskStatuses = [
  "todo",
  "in_progress",
  "blocked",
  "in_review",
  "done",
  "cancelled",
] as const;

export const taskPriorities = ["low", "medium", "high", "urgent"] as const;

export const taskSortKeys = [
  "created_at",
  "updated_at",
  "title",
  "due_date",
  "priority",
  "status",
] as const;

const optionalQueryBoolean = z
  .enum(["true", "false"])
  .transform((value) => value === "true")
  .optional();

export const taskSearchSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  page_size: z.coerce.number().int().min(1).max(100).default(20),
  project_id: z.string().uuid().optional(),
  status: z.enum(taskStatuses).optional(),
  priority: z.enum(taskPriorities).optional(),
  assignee_id: z.string().uuid().optional(),
  unassigned: optionalQueryBoolean,
  sort: z.enum(taskSortKeys).default("updated_at"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export const taskFormSchema = z.object({
  title: z.string().trim().min(1, "Task title is required").max(200),
  description: z.string().max(5000).default(""),
  status: z.enum(taskStatuses).default("todo"),
  priority: z.enum(taskPriorities).default("medium"),
  assignee_id: z.string().uuid().or(z.literal("")).default(""),
  due_date: z.string().default(""),
});

export type TaskSearch = z.infer<typeof taskSearchSchema>;
export type TaskFormValues = z.infer<typeof taskFormSchema>;
export type TaskFormInput = z.input<typeof taskFormSchema>;

export function parseTaskSearchParams(params: URLSearchParams) {
  return taskSearchSchema.safeParse(Object.fromEntries(params.entries()));
}
