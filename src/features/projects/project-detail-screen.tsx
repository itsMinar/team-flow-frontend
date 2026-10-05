"use client";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useActiveOrganization } from "@/features/organizations/organization-context";
import { PermissionGate } from "@/features/permissions/permission-gate";
import { ProjectFormDialog } from "@/features/projects/project-form-dialog";
import {
  useDeleteProject,
  useProject,
  useProjectActivity,
} from "@/features/projects/queries";
import { normalizeApiError } from "@/lib/api/normalize-api-error";
import {
  ArrowLeft,
  CalendarDays,
  ListTodo,
  Pencil,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

function displayDate(value: string | null | undefined) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(`${value.slice(0, 10)}T00:00:00Z`));
}

function actionLabel(action: string) {
  const actionName = action.split(".").at(-1) ?? action;
  return actionName.charAt(0).toUpperCase() + actionName.slice(1);
}

export function ProjectDetailScreen({ projectId }: { projectId: string }) {
  const organization = useActiveOrganization();
  const router = useRouter();
  const project = useProject(organization.id, projectId);
  const activity = useProjectActivity(organization.id, projectId);
  const remove = useDeleteProject(organization.id, projectId);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [mutationError, setMutationError] = useState("");

  if (project.isPending) {
    return (
      <main
        aria-busy="true"
        className="mx-auto max-w-7xl px-5 py-10 text-sm text-[#53665d]"
        role="status"
      >
        Loading project…
      </main>
    );
  }

  if (project.isError) {
    return (
      <main className="mx-auto max-w-7xl px-5 py-10" role="alert">
        <h1 className="text-xl font-semibold">Project unavailable</h1>
        <p className="mt-2 text-sm text-[#64756c]">
          {normalizeApiError(project.error).message}
        </p>
        <Link
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#245448] underline underline-offset-4"
          href={`/orgs/${organization.id}/projects`}
        >
          <ArrowLeft aria-hidden="true" size={16} /> Back to projects
        </Link>
      </main>
    );
  }

  const projectValue = project.data;
  const projectPath = `/orgs/${encodeURIComponent(organization.id)}/projects/${encodeURIComponent(projectValue.id)}`;

  async function confirmDelete() {
    setMutationError("");
    try {
      await remove.mutateAsync();
      router.replace(`/orgs/${encodeURIComponent(organization.id)}/projects`);
    } catch (error) {
      setMutationError(normalizeApiError(error).message);
    }
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-11">
      <Link
        className="inline-flex items-center gap-2 text-sm font-medium text-[#53665d] hover:text-[#193c35]"
        href={`/orgs/${encodeURIComponent(organization.id)}/projects`}
      >
        <ArrowLeft aria-hidden="true" size={16} /> Projects
      </Link>
      <div className="mt-6 flex flex-wrap items-start justify-between gap-5">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#587567]">
            {organization.name}
          </p>
          <h1 className="mt-2 wrap-break-word text-3xl font-semibold tracking-tight">
            {projectValue.name}
          </h1>
          <p className="mt-2 max-w-3xl whitespace-pre-wrap text-sm leading-6 text-[#64756c]">
            {projectValue.description || "No description has been added."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <PermissionGate permission="projects.update">
            <button
              className="inline-flex h-10 items-center gap-2 rounded-md border border-[#cbd4ce] bg-white px-3 text-sm font-medium hover:bg-[#f5f7f3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#346e58]"
              onClick={() => setEditOpen(true)}
              type="button"
            >
              <Pencil aria-hidden="true" size={16} /> Edit
            </button>
          </PermissionGate>
          <PermissionGate permission="projects.delete">
            <button
              className="inline-flex h-10 items-center gap-2 rounded-md border border-rose-200 bg-white px-3 text-sm font-medium text-rose-800 hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700"
              onClick={() => setDeleteOpen(true)}
              type="button"
            >
              <Trash2 aria-hidden="true" size={16} /> Delete
            </button>
          </PermissionGate>
        </div>
      </div>

      {mutationError && (
        <p
          className="mt-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900"
          role="alert"
        >
          {mutationError}
        </p>
      )}

      <section
        aria-label="Project details"
        className="mt-8 grid gap-px overflow-hidden rounded-md border border-[#d5ddd6] bg-[#d5ddd6] sm:grid-cols-4"
      >
        <div className="bg-white p-4">
          <p className="text-xs font-semibold text-[#64756c]">Status</p>
          <p className="mt-2 text-sm font-semibold">
            {projectValue.status.replaceAll("_", " ")}
          </p>
        </div>
        <div className="bg-white p-4">
          <p className="text-xs font-semibold text-[#64756c]">Priority</p>
          <p className="mt-2 text-sm font-semibold">{projectValue.priority}</p>
        </div>
        <div className="bg-white p-4">
          <p className="flex items-center gap-2 text-xs font-semibold text-[#64756c]">
            <CalendarDays aria-hidden="true" size={14} /> Start date
          </p>
          <p className="mt-2 text-sm font-semibold">
            {displayDate(projectValue.start_date)}
          </p>
        </div>
        <div className="bg-white p-4">
          <p className="flex items-center gap-2 text-xs font-semibold text-[#64756c]">
            <CalendarDays aria-hidden="true" size={14} /> Due date
          </p>
          <p className="mt-2 text-sm font-semibold">
            {displayDate(projectValue.due_date)}
          </p>
        </div>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.8fr)]">
        <section>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d5ddd6] pb-3">
            <h2 className="text-lg font-semibold">Recent activity</h2>
            <span className="text-xs text-[#64756c]">Project changes</span>
          </div>
          {activity.isPending ? (
            <div aria-busy="true" className="space-y-3 py-4" role="status">
              {[0, 1, 2].map((row) => (
                <div
                  className="h-12 animate-pulse rounded bg-white"
                  key={row}
                />
              ))}
            </div>
          ) : activity.isError ? (
            <p className="py-5 text-sm text-[#64756c]" role="status">
              Activity is temporarily unavailable.
            </p>
          ) : activity.data.data.length === 0 ? (
            <p className="py-5 text-sm text-[#64756c]">
              No activity has been recorded yet.
            </p>
          ) : (
            <ol className="divide-y divide-[#e4e9e4]">
              {activity.data.data.map((event) => (
                <li className="flex gap-3 py-4" key={event.id}>
                  <span
                    aria-hidden="true"
                    className="mt-1 size-2 shrink-0 rounded-full bg-[#6a9b78]"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {actionLabel(event.action)} project
                    </p>
                    <p className="mt-1 text-xs text-[#64756c]">
                      {event.actor_user_id ? "A team member" : "System"} ·{" "}
                      {new Date(event.created_at).toLocaleString()}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        <aside className="h-fit rounded-md border border-[#d5ddd6] bg-white p-5">
          <h2 className="text-base font-semibold">Project work</h2>
          <p className="mt-1 text-sm text-[#64756c]">
            Tasks and ownership for this project.
          </p>
          <Link
            className="mt-5 flex min-h-11 items-center justify-between gap-3 rounded-md border border-[#d5ddd6] px-3 text-sm font-medium hover:bg-[#f5f7f3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#346e58]"
            href={`${projectPath}/tasks`}
          >
            <span className="inline-flex items-center gap-2">
              <ListTodo aria-hidden="true" size={17} /> View tasks
            </span>
            <span aria-hidden="true">→</span>
          </Link>
        </aside>
      </div>

      <ProjectFormDialog
        onOpenChange={setEditOpen}
        open={editOpen}
        orgId={organization.id}
        project={projectValue}
      />
      <ConfirmDialog
        description={`This permanently removes ${projectValue.name} and its tasks.`}
        confirmLabel={remove.isPending ? "Deleting…" : "Delete project"}
        isPending={remove.isPending}
        onConfirm={() => void confirmDelete()}
        onOpenChange={setDeleteOpen}
        open={deleteOpen}
        title="Delete project?"
      />
    </main>
  );
}
