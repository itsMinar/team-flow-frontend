"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { TaskFormDialog } from "@/features/tasks/task-form-dialog";
import { useActiveOrganization } from "@/features/organizations/organization-context";
import { PermissionGate } from "@/features/permissions/permission-gate";
import type {
  OrganizationTaskParams,
  ProjectTaskParams,
  Task,
} from "@/features/tasks/api";
import {
  useOrganizationTasks,
  useProjectTasks,
  useUpdateTask,
} from "@/features/tasks/queries";
import { parseTaskSearchParams, taskStatuses } from "@/features/tasks/schemas";
import { useMembers } from "@/features/members/api";
import { normalizeApiError } from "@/lib/api/normalize-api-error";

const statusLabels: Record<(typeof taskStatuses)[number], string> = {
  todo: "To do",
  in_progress: "In progress",
  blocked: "Blocked",
  in_review: "In review",
  done: "Done",
  cancelled: "Cancelled",
};

function humanize(value: string) {
  return value.replaceAll("_", " ");
}

function dateLabel(value: string | null | undefined) {
  if (!value) return "No due date";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value.slice(0, 10)}T00:00:00Z`));
}

function TaskStatusControl({ task }: { task: Task }) {
  const organization = useActiveOrganization();
  const update = useUpdateTask(organization.id, task.id);
  const [error, setError] = useState("");

  async function changeStatus(status: string) {
    setError("");
    const nextStatus = taskStatuses.find((candidate) => candidate === status);
    if (!nextStatus) return;

    try {
      await update.mutateAsync({ status: nextStatus });
    } catch (cause) {
      setError(normalizeApiError(cause).message);
    }
  }

  return (
    <PermissionGate permission="tasks.update">
      <div>
        <label className="sr-only" htmlFor={`task-status-${task.id}`}>
          Status for {task.title}
        </label>
        <select
          aria-describedby={error ? `task-status-error-${task.id}` : undefined}
          className="h-9 max-w-36 rounded-md border border-[#cbd4ce] bg-white px-2 text-xs capitalize focus-visible:outline-2 focus-visible:outline-[#346e58] disabled:opacity-60"
          disabled={update.isPending}
          id={`task-status-${task.id}`}
          onChange={(event) => void changeStatus(event.target.value)}
          value={task.status}
        >
          {taskStatuses.map((status) => (
            <option key={status} value={status}>
              {statusLabels[status]}
            </option>
          ))}
        </select>
        {error && (
          <span
            className="sr-only"
            id={`task-status-error-${task.id}`}
            role="alert"
          >
            {error}
          </span>
        )}
      </div>
    </PermissionGate>
  );
}

function taskColumns(
  organizationId: string,
  memberNames: Map<string, string>,
): DataTableColumn<Task>[] {
  return [
    {
      id: "title",
      header: "Task",
      rowHeader: true,
      sortKey: "title",
      render: (task) => (
        <Link
          className="font-medium text-[#1b2d27] underline decoration-transparent underline-offset-4 hover:text-[#245448] hover:decoration-[#91ad9d] focus-visible:outline-2 focus-visible:outline-[#346e58]"
          href={`/orgs/${encodeURIComponent(organizationId)}/tasks/${encodeURIComponent(task.id)}`}
        >
          {task.title}
        </Link>
      ),
    },
    {
      id: "project",
      header: "Project",
      render: (task) => (
        <Link
          className="text-[#53665d] underline decoration-[#bdc9bf] underline-offset-4 hover:text-[#245448]"
          href={`/orgs/${encodeURIComponent(organizationId)}/projects/${encodeURIComponent(task.project_id)}/tasks`}
        >
          {task.project_id.slice(0, 8)}
        </Link>
      ),
    },
    {
      id: "status",
      header: "Status",
      sortKey: "status",
      render: (task) => <TaskStatusControl task={task} />,
    },
    {
      id: "priority",
      header: "Priority",
      sortKey: "priority",
      render: (task) => humanize(task.priority),
    },
    {
      id: "assignee",
      header: "Assignee",
      render: (task) =>
        task.assignee_id
          ? (memberNames.get(task.assignee_id) ?? "Assigned")
          : "Unassigned",
    },
    {
      id: "due-date",
      header: "Due date",
      sortKey: "due_date",
      render: (task) => dateLabel(task.due_date),
    },
  ];
}

export function TaskListScreen({ projectId }: { projectId?: string }) {
  const organization = useActiveOrganization();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const parsed = parseTaskSearchParams(searchParams);
  const filters = parsed.success
    ? parsed.data
    : {
        page: 1,
        page_size: 20,
        sort: "updated_at" as const,
        order: "desc" as const,
      };
  const organizationFilters: OrganizationTaskParams = {
    page: filters.page,
    page_size: filters.page_size,
    project_id: filters.project_id,
    status: filters.status,
    priority: filters.priority,
    assignee_id: filters.assignee_id,
    unassigned: filters.unassigned,
    sort: filters.sort,
    order: filters.order,
  };
  const projectFilters: ProjectTaskParams = {
    page: filters.page,
    page_size: filters.page_size,
    status: filters.status,
    priority: filters.priority,
    assignee_id: filters.assignee_id,
    unassigned: filters.unassigned,
    sort: filters.sort,
    order: filters.order,
  };
  const organizationTasks = useOrganizationTasks(
    organization.id,
    organizationFilters,
    !projectId && parsed.success,
  );
  const projectTasks = useProjectTasks(
    organization.id,
    projectId ?? "",
    projectFilters,
    Boolean(projectId) && parsed.success,
  );
  const members = useMembers(organization.id);
  const [dialogOpen, setDialogOpen] = useState(false);
  const taskPage = projectId ? projectTasks : organizationTasks;
  const tasks = taskPage.data?.data ?? [];
  const memberNames = new Map(
    (members.data ?? []).map((member) => [
      member.user_id,
      `${member.first_name} ${member.last_name}`,
    ]),
  );
  const view = searchParams.get("view") === "board" ? "board" : "table";
  const basePath = `/orgs/${encodeURIComponent(organization.id)}`;

  function changeParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.set("page", "1");
    router.replace(`${pathname}?${next.toString()}`);
  }

  function setView(nextView: "table" | "board") {
    const next = new URLSearchParams(searchParams.toString());
    next.set("view", nextView);
    router.replace(`${pathname}?${next.toString()}`);
  }

  function changePage(page: number) {
    changeParam("page", String(page));
  }

  if (!parsed.success) {
    return (
      <main className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8">
        <section
          className="rounded-md border border-rose-200 bg-rose-50 p-5 text-sm text-rose-900"
          role="alert"
        >
          <h1 className="font-semibold">Task filters are invalid</h1>
          <p className="mt-1">
            Page, page size, and filter values must match the supported API
            contract.
          </p>
          <button
            className="mt-3 font-semibold underline underline-offset-4"
            onClick={() => router.replace(pathname)}
            type="button"
          >
            Clear filters
          </button>
        </section>
      </main>
    );
  }

  const projectName = projectId ? "Project tasks" : "All tasks";

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-9 sm:px-8 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#587567]">
            {organization.name}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {projectName}
          </h1>
          <p className="mt-1 text-sm text-[#64756c]">
            Track status, priority, and ownership.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div
            aria-label="Task view"
            className="inline-flex rounded-md border border-[#cbd4ce] bg-white p-1"
            role="group"
          >
            <button
              aria-pressed={view === "table"}
              className={`h-8 rounded px-3 text-sm ${view === "table" ? "bg-[#193c35] text-white" : "text-[#53665d] hover:bg-[#f5f7f3]"}`}
              onClick={() => setView("table")}
              type="button"
            >
              Table
            </button>
            <button
              aria-pressed={view === "board"}
              className={`h-8 rounded px-3 text-sm ${view === "board" ? "bg-[#193c35] text-white" : "text-[#53665d] hover:bg-[#f5f7f3]"}`}
              onClick={() => setView("board")}
              type="button"
            >
              Board
            </button>
          </div>
          {projectId && (
            <PermissionGate permission="tasks.create">
              <button
                className="h-10 rounded-md bg-[#193c35] px-4 text-sm font-semibold text-white hover:bg-[#245448] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#193c35]"
                onClick={() => setDialogOpen(true)}
                type="button"
              >
                New task
              </button>
            </PermissionGate>
          )}
        </div>
      </div>

      <section
        aria-label="Task filters"
        className="mt-8 grid gap-3 rounded-md border border-[#d5ddd6] bg-white p-4 sm:grid-cols-2 lg:grid-cols-5"
      >
        <label className="text-xs font-semibold text-[#53665d]">
          Status
          <select
            className="mt-1.5 h-10 w-full rounded-md border border-[#cbd4ce] bg-white px-3 text-sm font-normal text-[#1b2d27]"
            onChange={(event) => changeParam("status", event.target.value)}
            value={filters.status ?? ""}
          >
            <option value="">All statuses</option>
            {taskStatuses.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold text-[#53665d]">
          Priority
          <select
            className="mt-1.5 h-10 w-full rounded-md border border-[#cbd4ce] bg-white px-3 text-sm font-normal text-[#1b2d27]"
            onChange={(event) => changeParam("priority", event.target.value)}
            value={filters.priority ?? ""}
          >
            <option value="">All priorities</option>
            {["low", "medium", "high", "urgent"].map((priority) => (
              <option key={priority} value={priority}>
                {humanize(priority)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold text-[#53665d]">
          Assignee
          <select
            className="mt-1.5 h-10 w-full rounded-md border border-[#cbd4ce] bg-white px-3 text-sm font-normal text-[#1b2d27]"
            onChange={(event) => changeParam("assignee_id", event.target.value)}
            value={filters.assignee_id ?? ""}
          >
            <option value="">All assignees</option>
            {members.data
              ?.filter((member) => member.status.toLowerCase() === "active")
              .map((member) => (
                <option key={member.user_id} value={member.user_id}>
                  {member.first_name} {member.last_name}
                </option>
              ))}
          </select>
        </label>
        <label className="flex min-h-10 items-center gap-2 pt-4 text-sm text-[#53665d]">
          <input
            checked={filters.unassigned === true}
            onChange={(event) => {
              const next = new URLSearchParams(searchParams.toString());
              next.delete("assignee_id");
              if (event.target.checked) next.set("unassigned", "true");
              else next.delete("unassigned");
              next.set("page", "1");
              router.replace(`${pathname}?${next.toString()}`);
            }}
            type="checkbox"
          />
          Unassigned only
        </label>
        <label className="text-xs font-semibold text-[#53665d]">
          Per page
          <select
            className="mt-1.5 h-10 w-full rounded-md border border-[#cbd4ce] bg-white px-3 text-sm font-normal text-[#1b2d27]"
            onChange={(event) => changeParam("page_size", event.target.value)}
            value={String(filters.page_size)}
          >
            {[10, 20, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section
        aria-label="Tasks"
        className="mt-4 overflow-hidden rounded-md border border-[#d5ddd6] bg-white"
      >
        {taskPage.isPending ? (
          <div aria-busy="true" className="space-y-3 p-5" role="status">
            {[0, 1, 2, 3].map((row) => (
              <div
                className="h-12 animate-pulse rounded bg-[#edf1ec]"
                key={row}
              />
            ))}
          </div>
        ) : taskPage.isError ? (
          <div className="p-6 text-sm" role="alert">
            <p className="font-semibold">Tasks could not be loaded</p>
            <p className="mt-1 text-[#64756c]">
              {normalizeApiError(taskPage.error).message}
            </p>
            <button
              className="mt-3 font-semibold text-[#245448] underline underline-offset-4"
              onClick={() => void taskPage.refetch()}
              type="button"
            >
              Try again
            </button>
          </div>
        ) : tasks.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <h2 className="text-lg font-semibold">No tasks match</h2>
            <p className="mt-1 text-sm text-[#64756c]">
              Change a filter or create a task in a project.
            </p>
          </div>
        ) : view === "table" ? (
          <DataTable
            caption={`Tasks in ${organization.name}`}
            columns={taskColumns(organization.id, memberNames)}
            onSort={(sort) => changeParam("sort", sort)}
            order={filters.order}
            pagination={
              taskPage.data
                ? {
                    page: taskPage.data.pagination.page,
                    pageSize: taskPage.data.pagination.page_size,
                    total: taskPage.data.pagination.total,
                    totalPages: taskPage.data.pagination.total_pages,
                    onPageChange: changePage,
                  }
                : undefined
            }
            rows={tasks}
            sortBy={filters.sort}
          />
        ) : (
          <div
            aria-label="Tasks grouped by status"
            className="flex gap-4 overflow-x-auto p-4"
            role="region"
            tabIndex={0}
          >
            {taskStatuses.map((status) => {
              const matchingTasks = tasks.filter(
                (task) => task.status === status,
              );
              return (
                <section
                  aria-label={`${statusLabels[status]} tasks`}
                  className="w-[min(82vw,300px)] shrink-0 rounded-md border border-[#d5ddd6] bg-[#f5f7f3] p-3"
                  key={status}
                >
                  <header className="flex items-center justify-between gap-2 border-b border-[#d5ddd6] pb-3">
                    <h2 className="text-sm font-semibold">
                      {statusLabels[status]}
                    </h2>
                    <span className="rounded-sm bg-white px-2 py-0.5 text-xs tabular-nums text-[#64756c]">
                      {matchingTasks.length}
                    </span>
                  </header>
                  <ul className="mt-3 space-y-3">
                    {matchingTasks.map((task) => (
                      <li
                        className="rounded-md border border-[#d5ddd6] bg-white p-3"
                        key={task.id}
                      >
                        <Link
                          className="text-sm font-semibold text-[#1b2d27] underline decoration-transparent underline-offset-4 hover:text-[#245448] hover:decoration-[#91ad9d]"
                          href={`${basePath}/tasks/${encodeURIComponent(task.id)}`}
                        >
                          {task.title}
                        </Link>
                        <p className="mt-2 text-xs capitalize text-[#64756c]">
                          {humanize(task.priority)} priority ·{" "}
                          {task.assignee_id
                            ? (memberNames.get(task.assignee_id) ?? "Assigned")
                            : "Unassigned"}
                        </p>
                        <div className="mt-3">
                          <TaskStatusControl task={task} />
                        </div>
                      </li>
                    ))}
                    {matchingTasks.length === 0 && (
                      <li className="py-5 text-center text-xs text-[#74847d]">
                        No tasks
                      </li>
                    )}
                  </ul>
                </section>
              );
            })}
          </div>
        )}
      </section>

      {projectId && (
        <PermissionGate permission="tasks.create">
          <TaskFormDialog
            onOpenChange={setDialogOpen}
            open={dialogOpen}
            orgId={organization.id}
            projectId={projectId}
          />
        </PermissionGate>
      )}
    </main>
  );
}
