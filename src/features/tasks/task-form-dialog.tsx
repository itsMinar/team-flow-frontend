"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Dialog } from "@/components/shared/dialog";
import { mapApiErrorToForm } from "@/features/auth/form-errors";
import { useMembers } from "@/features/members/api";
import type { Task } from "@/features/tasks/api";
import { useCreateTask, useUpdateTask } from "@/features/tasks/queries";
import {
  taskFormSchema,
  taskPriorities,
  taskStatuses,
  type TaskFormInput,
  type TaskFormValues,
} from "@/features/tasks/schemas";

const statusLabels: Record<(typeof taskStatuses)[number], string> = {
  todo: "To do",
  in_progress: "In progress",
  blocked: "Blocked",
  in_review: "In review",
  done: "Done",
  cancelled: "Cancelled",
};

export function TaskFormDialog({
  orgId,
  projectId,
  task,
  open,
  onOpenChange,
}: {
  orgId: string;
  projectId: string;
  task?: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const members = useMembers(orgId);
  const createTask = useCreateTask(orgId, projectId);
  const updateTask = useUpdateTask(orgId, task?.id ?? "");
  const [formError, setFormError] = useState("");
  const form = useForm<TaskFormInput, unknown, TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    values: {
      title: task?.title ?? "",
      description: task?.description ?? "",
      status: (task?.status as TaskFormValues["status"]) ?? "todo",
      priority: (task?.priority as TaskFormValues["priority"]) ?? "medium",
      assignee_id: task?.assignee_id ?? "",
      due_date: task?.due_date ?? "",
    },
    mode: "onBlur",
  });
  const isPending = createTask.isPending || updateTask.isPending;

  async function onSubmit(values: TaskFormValues) {
    setFormError("");
    const input = {
      title: values.title,
      description: values.description || null,
      status: values.status,
      priority: values.priority,
      assignee_id: values.assignee_id || null,
      due_date: values.due_date || null,
    };

    try {
      if (task) await updateTask.mutateAsync(input);
      else await createTask.mutateAsync(input);
      onOpenChange(false);
    } catch (error) {
      setFormError(
        mapApiErrorToForm<TaskFormValues>(
          error,
          [
            "title",
            "description",
            "status",
            "priority",
            "assignee_id",
            "due_date",
          ],
          form.setError,
        ),
      );
    }
  }

  const activeMembers = members.data?.filter(
    (member) => member.status.toLowerCase() === "active",
  );

  return (
    <Dialog
      description="Add the task details and assign a teammate."
      onOpenChange={onOpenChange}
      open={open}
      title={task ? "Edit task" : "Create task"}
    >
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        {formError && (
          <p
            className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900"
            role="alert"
          >
            {formError}
          </p>
        )}
        <label
          className="block space-y-1.5 text-sm font-medium"
          htmlFor="task-title"
        >
          Task title
          <input
            {...form.register("title")}
            aria-invalid={Boolean(form.formState.errors.title)}
            autoFocus
            className="h-11 w-full rounded-md border border-[#cbd4ce] px-3 text-sm font-normal outline-none focus-visible:border-[#346e58] focus-visible:ring-2 focus-visible:ring-[#346e58]/20"
            id="task-title"
            maxLength={200}
            required
          />
          {form.formState.errors.title && (
            <span
              className="block text-sm font-normal text-rose-700"
              role="alert"
            >
              {form.formState.errors.title.message}
            </span>
          )}
        </label>
        <label
          className="block space-y-1.5 text-sm font-medium"
          htmlFor="task-description"
        >
          Description
          <textarea
            {...form.register("description")}
            className="min-h-24 w-full resize-y rounded-md border border-[#cbd4ce] px-3 py-2 text-sm font-normal outline-none focus-visible:border-[#346e58] focus-visible:ring-2 focus-visible:ring-[#346e58]/20"
            id="task-description"
            maxLength={5000}
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 text-sm font-medium">
            <span className="block">Status</span>
            <select
              {...form.register("status")}
              className="h-11 w-full rounded-md border border-[#cbd4ce] bg-white px-3 text-sm font-normal focus-visible:outline-2 focus-visible:outline-[#346e58]"
            >
              {taskStatuses.map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5 text-sm font-medium">
            <span className="block">Priority</span>
            <select
              {...form.register("priority")}
              className="h-11 w-full rounded-md border border-[#cbd4ce] bg-white px-3 text-sm font-normal focus-visible:outline-2 focus-visible:outline-[#346e58]"
            >
              {taskPriorities.map((priority) => (
                <option key={priority} value={priority}>
                  {priority[0]?.toUpperCase()}
                  {priority.slice(1)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 text-sm font-medium">
            <span className="block">Assignee</span>
            <select
              {...form.register("assignee_id")}
              className="h-11 w-full rounded-md border border-[#cbd4ce] bg-white px-3 text-sm font-normal focus-visible:outline-2 focus-visible:outline-[#346e58]"
            >
              <option value="">Unassigned</option>
              {activeMembers?.map((member) => (
                <option key={member.user_id} value={member.user_id}>
                  {member.first_name} {member.last_name} · {member.email}
                </option>
              ))}
            </select>
            {members.isError && (
              <span className="block text-xs font-normal text-[#64756c]">
                Member choices are unavailable; you can leave this unassigned.
              </span>
            )}
          </label>
          <label className="space-y-1.5 text-sm font-medium">
            <span className="block">Due date</span>
            <input
              {...form.register("due_date")}
              className="h-11 w-full rounded-md border border-[#cbd4ce] bg-white px-3 text-sm font-normal focus-visible:outline-2 focus-visible:outline-[#346e58]"
              type="date"
            />
          </label>
        </div>
        <footer className="flex justify-end gap-3 border-t border-[#e4e9e4] pt-4">
          <button
            className="h-10 rounded-md border border-[#cbd4ce] px-4 text-sm font-medium hover:bg-[#f5f7f3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#346e58]"
            onClick={() => onOpenChange(false)}
            type="button"
          >
            Cancel
          </button>
          <button
            className="h-10 rounded-md bg-[#193c35] px-4 text-sm font-semibold text-white hover:bg-[#245448] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#193c35] disabled:opacity-60"
            disabled={isPending || form.formState.isSubmitting}
            type="submit"
          >
            {isPending ? "Saving…" : task ? "Save changes" : "Create task"}
          </button>
        </footer>
      </form>
    </Dialog>
  );
}
