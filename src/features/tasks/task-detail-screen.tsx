"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, CalendarDays, Pencil, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { TaskFormDialog } from "@/features/tasks/task-form-dialog";
import { useActiveOrganization } from "@/features/organizations/organization-context";
import { PermissionGate } from "@/features/permissions/permission-gate";
import {
  useDeleteTask,
  useTask,
  useTaskActivity,
} from "@/features/tasks/queries";
import type { Task } from "@/features/tasks/api";
import { normalizeApiError } from "@/lib/api/normalize-api-error";

function taskDate(value: string | null | undefined) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(`${value.slice(0, 10)}T00:00:00Z`));
}

function TaskActivity({ orgId, taskId }: { orgId: string; taskId: string }) {
  const activity = useTaskActivity(orgId, taskId);

  if (activity.isPending) {
    return (
      <div aria-busy="true" className="space-y-3 py-4" role="status">
        {[0, 1, 2].map((row) => (
          <div className="h-12 animate-pulse rounded bg-white" key={row} />
        ))}
      </div>
    );
  }

  if (activity.isError) {
    return (
      <p className="py-5 text-sm text-[#64756c]" role="status">
        Task activity is temporarily unavailable.
      </p>
    );
  }

  if (activity.data.data.length === 0) {
    return (
      <p className="py-5 text-sm text-[#64756c]">
        No activity has been recorded yet.
      </p>
    );
  }

  return (
    <ol className="divide-y divide-[#e4e9e4]">
      {activity.data.data.map((event) => (
        <li className="flex gap-3 py-4" key={event.id}>
          <span
            aria-hidden="true"
            className="mt-1 size-2 shrink-0 rounded-full bg-[#6a9b78]"
          />
          <div className="min-w-0">
            <p className="text-sm font-medium">
              {event.action.replaceAll(".", " ")}
            </p>
            <p className="mt-1 text-xs text-[#64756c]">
              {event.actor_user_id ? "A team member" : "System"} ·{" "}
              {new Date(event.created_at).toLocaleString()}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function TaskDetailLoaded({ task }: { task: Task }) {
  const organization = useActiveOrganization();
  const router = useRouter();
  const remove = useDeleteTask(organization.id, task.id);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [error, setError] = useState("");
  const projectPath = `/orgs/${encodeURIComponent(organization.id)}/projects/${encodeURIComponent(task.project_id)}/tasks`;

  async function confirmDelete() {
    setError("");
    try {
      await remove.mutateAsync();
      router.replace(projectPath);
    } catch (cause) {
      setError(normalizeApiError(cause).message);
    }
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-11">
      <Link
        className="inline-flex items-center gap-2 text-sm font-medium text-[#53665d] hover:text-[#193c35]"
        href={projectPath}
      >
        <ArrowLeft aria-hidden="true" size={16} /> Project tasks
      </Link>
      <div className="mt-6 flex flex-wrap items-start justify-between gap-5">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#587567]">
            {organization.name}
          </p>
          <h1 className="mt-2 break-words text-3xl font-semibold tracking-tight">
            {task.title}
          </h1>
          <p className="mt-2 max-w-3xl whitespace-pre-wrap text-sm leading-6 text-[#64756c]">
            {task.description || "No description has been added."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <PermissionGate permission="tasks.update">
            <button
              className="inline-flex h-10 items-center gap-2 rounded-md border border-[#cbd4ce] bg-white px-3 text-sm font-medium hover:bg-[#f5f7f3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#346e58]"
              onClick={() => setEditOpen(true)}
              type="button"
            >
              <Pencil aria-hidden="true" size={16} /> Edit task
            </button>
          </PermissionGate>
          <PermissionGate permission="tasks.delete">
            <button
              className="inline-flex h-10 items-center gap-2 rounded-md border border-rose-200 bg-white px-3 text-sm font-medium text-rose-800 hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700"
              onClick={() => setDeleteOpen(true)}
              type="button"
            >
              <Trash2 aria-hidden="true" size={16} /> Delete task
            </button>
          </PermissionGate>
        </div>
      </div>

      {error && (
        <p
          className="mt-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900"
          role="alert"
        >
          {error}
        </p>
      )}

      <section
        aria-label="Task details"
        className="mt-8 grid gap-px overflow-hidden rounded-md border border-[#d5ddd6] bg-[#d5ddd6] sm:grid-cols-4"
      >
        <div className="bg-white p-4">
          <p className="text-xs font-semibold text-[#64756c]">Status</p>
          <p className="mt-2 text-sm font-semibold capitalize">
            {task.status.replaceAll("_", " ")}
          </p>
        </div>
        <div className="bg-white p-4">
          <p className="text-xs font-semibold text-[#64756c]">Priority</p>
          <p className="mt-2 text-sm font-semibold capitalize">
            {task.priority}
          </p>
        </div>
        <div className="bg-white p-4">
          <p className="text-xs font-semibold text-[#64756c]">Assignee</p>
          <p className="mt-2 text-sm font-semibold">
            {task.assignee_id ?? "Unassigned"}
          </p>
        </div>
        <div className="bg-white p-4">
          <p className="flex items-center gap-2 text-xs font-semibold text-[#64756c]">
            <CalendarDays aria-hidden="true" size={14} /> Due date
          </p>
          <p className="mt-2 text-sm font-semibold">
            {taskDate(task.due_date)}
          </p>
        </div>
      </section>

      <section className="mt-9 max-w-3xl">
        <div className="border-b border-[#d5ddd6] pb-3">
          <h2 className="text-lg font-semibold">Task activity</h2>
        </div>
        <TaskActivity orgId={organization.id} taskId={task.id} />
      </section>

      <PermissionGate permission="tasks.update">
        <TaskFormDialog
          onOpenChange={setEditOpen}
          open={editOpen}
          orgId={organization.id}
          projectId={task.project_id}
          task={task}
        />
      </PermissionGate>
      <PermissionGate permission="tasks.delete">
        <ConfirmDialog
          description={`This permanently removes ${task.title}.`}
          confirmLabel={remove.isPending ? "Deleting…" : "Delete task"}
          isPending={remove.isPending}
          onConfirm={() => void confirmDelete()}
          onOpenChange={setDeleteOpen}
          open={deleteOpen}
          title="Delete task?"
        />
      </PermissionGate>
    </main>
  );
}

export function TaskDetailScreen({ taskId }: { taskId: string }) {
  const organization = useActiveOrganization();
  const task = useTask(organization.id, taskId);

  if (task.isPending) {
    return (
      <main
        aria-busy="true"
        className="mx-auto max-w-7xl px-5 py-10 text-sm text-[#53665d]"
        role="status"
      >
        Loading task…
      </main>
    );
  }

  if (task.isError) {
    return (
      <main className="mx-auto max-w-7xl px-5 py-10" role="alert">
        <h1 className="text-xl font-semibold">Task unavailable</h1>
        <p className="mt-2 text-sm text-[#64756c]">
          {normalizeApiError(task.error).message}
        </p>
        <Link
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#245448] underline underline-offset-4"
          href={`/orgs/${encodeURIComponent(organization.id)}/tasks`}
        >
          <ArrowLeft aria-hidden="true" size={16} /> Back to tasks
        </Link>
      </main>
    );
  }

  return <TaskDetailLoaded task={task.data} />;
}
