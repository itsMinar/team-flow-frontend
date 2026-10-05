"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Plus } from "lucide-react";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { PermissionGate } from "@/features/permissions/permission-gate";
import { useActiveOrganization } from "@/features/organizations/organization-context";
import type { Organization } from "@/features/organizations/api";
import { ProjectFormDialog } from "@/features/projects/project-form-dialog";
import { useProjects } from "@/features/projects/queries";
import type { Project } from "@/features/projects/api";
import {
  parseProjectSearchParams,
  projectPriorities,
  projectStatuses,
} from "@/features/projects/schemas";
import { useTeams } from "@/features/teams/api";
import type { Team } from "@/features/teams/api";
import { normalizeApiError } from "@/lib/api/normalize-api-error";

function readable(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
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

function ProjectsLoading() {
  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8">
      <div aria-busy="true" className="space-y-4" role="status">
        <div className="h-9 w-56 animate-pulse rounded bg-[#dce3dc]" />
        <div className="h-12 animate-pulse rounded bg-white" />
        <div className="h-64 animate-pulse rounded bg-white" />
      </div>
    </main>
  );
}

function projectColumns(
  organization: Organization,
  teams: Team[] | undefined,
): DataTableColumn<Project>[] {
  return [
    {
      id: "name",
      header: "Project",
      rowHeader: true,
      sortKey: "name",
      render: (project) => (
        <>
          <Link
            className="text-[#1b2d27] underline decoration-transparent underline-offset-4 hover:text-[#245448] hover:decoration-[#91ad9d] focus-visible:outline-2 focus-visible:outline-[#346e58]"
            href={`/orgs/${encodeURIComponent(organization.id)}/projects/${encodeURIComponent(project.id)}`}
          >
            {project.name}
          </Link>
          {project.description && (
            <span className="mt-1 block max-w-sm truncate text-xs font-normal text-[#64756c]">
              {project.description}
            </span>
          )}
        </>
      ),
    },
    {
      id: "status",
      header: "Status",
      render: (project) => readable(project.status),
    },
    {
      id: "priority",
      header: "Priority",
      sortKey: "priority",
      render: (project) => readable(project.priority),
    },
    {
      id: "team",
      header: "Team",
      render: (project) =>
        teams?.find((team) => team.id === project.team_id)?.name ?? "—",
    },
    {
      id: "due-date",
      header: "Due date",
      sortKey: "due_date",
      render: (project) => dateLabel(project.due_date),
    },
    {
      id: "updated-at",
      header: "Updated",
      sortKey: "updated_at",
      render: (project) => dateLabel(project.updated_at),
    },
  ];
}

export function ProjectListScreen() {
  const organization = useActiveOrganization();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const parsed = parseProjectSearchParams(searchParams);
  const filters = parsed.success
    ? parsed.data
    : {
        page: 1,
        page_size: 20,
        sort: "updated_at" as const,
        order: "desc" as const,
      };
  const projects = useProjects(organization.id, filters, parsed.success);
  const teams = useTeams(organization.id);
  const [dialogOpen, setDialogOpen] = useState(false);
  const createFromUrl = searchParams.get("create") === "1";

  function changeFilter(key: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.set("page", "1");
    router.replace(`${pathname}?${next.toString()}`);
  }

  function changePage(page: number) {
    const next = new URLSearchParams(searchParams.toString());
    next.set("page", String(page));
    router.replace(`${pathname}?${next.toString()}`);
  }

  function changeCreateDialog(open: boolean) {
    setDialogOpen(open);
    if (!open && searchParams.has("create")) {
      const next = new URLSearchParams(searchParams.toString());
      next.delete("create");
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    }
  }

  function toggleSort(sort: string) {
    const current = filters.sort;
    const order = current === sort && filters.order === "asc" ? "desc" : "asc";
    const next = new URLSearchParams(searchParams.toString());
    next.set("sort", sort);
    next.set("order", order);
    next.set("page", "1");
    router.replace(`${pathname}?${next.toString()}`);
  }

  if (!parsed.success) {
    return (
      <main className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8">
        <section
          className="rounded-md border border-rose-200 bg-rose-50 p-5 text-sm text-rose-900"
          role="alert"
        >
          <h1 className="font-semibold">Project filters are invalid</h1>
          <p className="mt-1">
            Page must be positive, page size must be 1–100, and filters must
            match supported values.
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

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-9 sm:px-8 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#587567]">
            {organization.name}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Projects
          </h1>
          <p className="mt-1 text-sm text-[#64756c]">
            Plan and track work across your teams.
          </p>
        </div>
        <PermissionGate permission="projects.create">
          <button
            className="inline-flex h-11 items-center gap-2 rounded-md bg-[#193c35] px-4 text-sm font-semibold text-white hover:bg-[#245448] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#193c35]"
            onClick={() => changeCreateDialog(true)}
            type="button"
          >
            <Plus aria-hidden="true" size={17} />
            New project
          </button>
        </PermissionGate>
      </div>

      <section
        aria-label="Project filters"
        className="mt-8 grid gap-3 rounded-md border border-[#d5ddd6] bg-white p-4 sm:grid-cols-2 lg:grid-cols-5"
      >
        <label className="text-xs font-semibold text-[#53665d]">
          Status
          <select
            className="mt-1.5 h-10 w-full rounded-md border border-[#cbd4ce] bg-white px-3 text-sm font-normal text-[#1b2d27] focus-visible:outline-2 focus-visible:outline-[#346e58]"
            onChange={(event) => changeFilter("status", event.target.value)}
            value={filters.status ?? ""}
          >
            <option value="">All statuses</option>
            {projectStatuses.map((status) => (
              <option key={status} value={status}>
                {readable(status)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold text-[#53665d]">
          Priority
          <select
            className="mt-1.5 h-10 w-full rounded-md border border-[#cbd4ce] bg-white px-3 text-sm font-normal text-[#1b2d27] focus-visible:outline-2 focus-visible:outline-[#346e58]"
            onChange={(event) => changeFilter("priority", event.target.value)}
            value={filters.priority ?? ""}
          >
            <option value="">All priorities</option>
            {projectPriorities.map((priority) => (
              <option key={priority} value={priority}>
                {readable(priority)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold text-[#53665d]">
          Team
          <select
            className="mt-1.5 h-10 w-full rounded-md border border-[#cbd4ce] bg-white px-3 text-sm font-normal text-[#1b2d27] focus-visible:outline-2 focus-visible:outline-[#346e58]"
            onChange={(event) => changeFilter("team_id", event.target.value)}
            value={filters.team_id ?? ""}
          >
            <option value="">All teams</option>
            {teams.data?.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
            {teams.isError && (
              <option disabled value="unavailable">
                Teams unavailable
              </option>
            )}
          </select>
        </label>
        <label className="text-xs font-semibold text-[#53665d]">
          Sort by
          <select
            className="mt-1.5 h-10 w-full rounded-md border border-[#cbd4ce] bg-white px-3 text-sm font-normal text-[#1b2d27] focus-visible:outline-2 focus-visible:outline-[#346e58]"
            onChange={(event) => changeFilter("sort", event.target.value)}
            value={filters.sort}
          >
            <option value="updated_at">Recently updated</option>
            <option value="name">Name</option>
            <option value="created_at">Date created</option>
            <option value="due_date">Due date</option>
            <option value="priority">Priority</option>
          </select>
        </label>
        <label className="text-xs font-semibold text-[#53665d]">
          Per page
          <select
            className="mt-1.5 h-10 w-full rounded-md border border-[#cbd4ce] bg-white px-3 text-sm font-normal text-[#1b2d27] focus-visible:outline-2 focus-visible:outline-[#346e58]"
            onChange={(event) => changeFilter("page_size", event.target.value)}
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

      <section className="mt-4 overflow-hidden rounded-md border border-[#d5ddd6] bg-white">
        {projects.isPending ? (
          <div aria-busy="true" className="space-y-3 p-5" role="status">
            {[0, 1, 2, 3].map((row) => (
              <div
                className="h-12 animate-pulse rounded bg-[#edf1ec]"
                key={row}
              />
            ))}
          </div>
        ) : projects.isError ? (
          <div className="p-6 text-sm" role="alert">
            <p className="font-semibold">Projects could not be loaded</p>
            <p className="mt-1 text-[#64756c]">
              {normalizeApiError(projects.error).message}
            </p>
            <button
              className="mt-3 font-semibold text-[#245448] underline underline-offset-4"
              onClick={() => void projects.refetch()}
              type="button"
            >
              Try again
            </button>
          </div>
        ) : projects.data.data.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <h2 className="text-lg font-semibold">No projects match</h2>
            <p className="mt-1 text-sm text-[#64756c]">
              Change a filter or create a project to get started.
            </p>
          </div>
        ) : (
          <DataTable
            caption={`Projects in ${organization.name}`}
            columns={projectColumns(organization, teams.data)}
            onSort={toggleSort}
            order={filters.order}
            pagination={{
              page: projects.data.pagination.page,
              pageSize: projects.data.pagination.page_size,
              total: projects.data.pagination.total,
              totalPages: projects.data.pagination.total_pages,
              onPageChange: changePage,
            }}
            rows={projects.data.data}
            sortBy={filters.sort}
          />
        )}
      </section>

      <PermissionGate permission="projects.create">
        <ProjectFormDialog
          onOpenChange={changeCreateDialog}
          open={dialogOpen || createFromUrl}
          orgId={organization.id}
        />
      </PermissionGate>
    </main>
  );
}

export { ProjectsLoading };
