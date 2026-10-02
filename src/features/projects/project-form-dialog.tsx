"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Dialog } from "@/components/shared/dialog";
import { mapApiErrorToForm } from "@/features/auth/form-errors";
import type { Project } from "@/features/projects/api";
import type {
  ProjectFormInput,
  ProjectFormValues,
} from "@/features/projects/schemas";
import {
  projectFormSchema,
  projectPriorities,
  projectStatuses,
} from "@/features/projects/schemas";
import {
  useCreateProject,
  useUpdateProject,
} from "@/features/projects/queries";
import { useState } from "react";

const statusLabels: Record<(typeof projectStatuses)[number], string> = {
  planning: "Planning",
  active: "Active",
  on_hold: "On hold",
  completed: "Completed",
  archived: "Archived",
};

const priorityLabels: Record<(typeof projectPriorities)[number], string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export function ProjectFormDialog({
  orgId,
  project,
  open,
  onOpenChange,
}: {
  orgId: string;
  project?: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createProject = useCreateProject(orgId);
  const updateProject = useUpdateProject(orgId, project?.id ?? "");
  const [formError, setFormError] = useState("");
  const form = useForm<ProjectFormInput, unknown, ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    values: {
      name: project?.name ?? "",
      description: project?.description ?? "",
      status: (project?.status as ProjectFormValues["status"]) ?? "planning",
      priority:
        (project?.priority as ProjectFormValues["priority"]) ?? "medium",
      start_date: project?.start_date ?? "",
      due_date: project?.due_date ?? "",
    },
    mode: "onBlur",
  });
  const isPending = createProject.isPending || updateProject.isPending;

  async function onSubmit(values: ProjectFormValues) {
    setFormError("");
    const request = {
      name: values.name,
      description: values.description || null,
      status: values.status,
      priority: values.priority,
      start_date: values.start_date || null,
      due_date: values.due_date || null,
    };

    try {
      if (project) await updateProject.mutateAsync(request);
      else await createProject.mutateAsync(request);
      onOpenChange(false);
    } catch (error) {
      setFormError(
        mapApiErrorToForm<ProjectFormValues>(
          error,
          [
            "name",
            "description",
            "status",
            "priority",
            "start_date",
            "due_date",
          ],
          form.setError,
        ),
      );
    }
  }

  return (
    <Dialog
      description="Keep project details and dates up to date."
      onOpenChange={onOpenChange}
      open={open}
      title={project ? "Edit project" : "Create project"}
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
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="project-name">
            Project name
          </label>
          <input
            {...form.register("name")}
            aria-invalid={Boolean(form.formState.errors.name)}
            autoFocus
            className="h-11 w-full rounded-md border border-[#cbd4ce] px-3 text-sm outline-none focus-visible:border-[#346e58] focus-visible:ring-2 focus-visible:ring-[#346e58]/20"
            id="project-name"
            maxLength={150}
            required
          />
          {form.formState.errors.name && (
            <p className="text-sm text-rose-700" role="alert">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="project-description">
            Description
          </label>
          <textarea
            {...form.register("description")}
            className="min-h-24 w-full resize-y rounded-md border border-[#cbd4ce] px-3 py-2 text-sm outline-none focus-visible:border-[#346e58] focus-visible:ring-2 focus-visible:ring-[#346e58]/20"
            id="project-description"
            maxLength={5000}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 text-sm font-medium">
            <span className="block">Status</span>
            <select
              {...form.register("status")}
              className="h-11 w-full rounded-md border border-[#cbd4ce] bg-white px-3 outline-none focus-visible:border-[#346e58] focus-visible:ring-2 focus-visible:ring-[#346e58]/20"
            >
              {projectStatuses.map((status) => (
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
              className="h-11 w-full rounded-md border border-[#cbd4ce] bg-white px-3 outline-none focus-visible:border-[#346e58] focus-visible:ring-2 focus-visible:ring-[#346e58]/20"
            >
              {projectPriorities.map((priority) => (
                <option key={priority} value={priority}>
                  {priorityLabels[priority]}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 text-sm font-medium">
            <span className="block">Start date</span>
            <input
              {...form.register("start_date")}
              className="h-11 w-full rounded-md border border-[#cbd4ce] bg-white px-3 outline-none focus-visible:border-[#346e58] focus-visible:ring-2 focus-visible:ring-[#346e58]/20"
              type="date"
            />
          </label>
          <label className="space-y-1.5 text-sm font-medium">
            <span className="block">Due date</span>
            <input
              {...form.register("due_date")}
              className="h-11 w-full rounded-md border border-[#cbd4ce] bg-white px-3 outline-none focus-visible:border-[#346e58] focus-visible:ring-2 focus-visible:ring-[#346e58]/20"
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
            {isPending
              ? "Saving…"
              : project
                ? "Save changes"
                : "Create project"}
          </button>
        </footer>
      </form>
    </Dialog>
  );
}
