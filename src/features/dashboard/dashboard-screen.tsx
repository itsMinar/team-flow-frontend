"use client";

import Link from "next/link";
import { Activity, ArrowUpRight, ListTodo, PanelsTopLeft } from "lucide-react";
import { useActiveOrganization } from "@/features/organizations/organization-context";
import { PermissionGate } from "@/features/permissions/permission-gate";
import { useDashboardOverview } from "@/features/dashboard/api";
import { normalizeApiError } from "@/lib/api/normalize-api-error";

function formatTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function DashboardScreen() {
  const organization = useActiveOrganization();
  const overview = useDashboardOverview(organization.id);
  const basePath = `/orgs/${encodeURIComponent(organization.id)}`;

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-9 sm:px-8 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#587567]">
            {organization.name}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Overview
          </h1>
          <p className="mt-1 text-sm text-[#64756c]">
            A current view of work across this organization.
          </p>
        </div>
        <Link
          className="inline-flex h-10 items-center gap-2 rounded-md border border-[#cbd4ce] bg-white px-3 text-sm font-medium hover:bg-[#f5f7f3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#346e58]"
          href={`${basePath}/projects`}
        >
          All projects <ArrowUpRight aria-hidden="true" size={16} />
        </Link>
      </div>

      {overview.isPending ? (
        <div
          aria-busy="true"
          className="mt-8 grid gap-px overflow-hidden rounded-md border border-[#d5ddd6] bg-[#d5ddd6] sm:grid-cols-2"
          role="status"
        >
          <div className="h-32 animate-pulse bg-white" />
          <div className="h-32 animate-pulse bg-white" />
        </div>
      ) : overview.isError ? (
        <div
          className="mt-8 rounded-md border border-rose-200 bg-rose-50 p-5 text-sm text-rose-900"
          role="alert"
        >
          <p className="font-semibold">Overview could not be loaded</p>
          <p className="mt-1">{normalizeApiError(overview.error).message}</p>
        </div>
      ) : (
        <>
          <section
            aria-label="Workspace totals"
            className="mt-8 grid gap-px overflow-hidden rounded-md border border-[#d5ddd6] bg-[#d5ddd6] sm:grid-cols-2"
          >
            <Link
              className="flex min-h-32 items-center justify-between bg-white p-6 transition hover:bg-[#f9faf8] focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#346e58]"
              href={`${basePath}/projects`}
            >
              <div>
                <p className="text-sm font-medium text-[#64756c]">Projects</p>
                <p className="mt-2 text-4xl font-semibold tabular-nums">
                  {overview.data.projectCount}
                </p>
              </div>
              <PanelsTopLeft
                aria-hidden="true"
                className="text-[#6a9b78]"
                size={25}
              />
            </Link>
            <Link
              className="flex min-h-32 items-center justify-between bg-white p-6 transition hover:bg-[#f9faf8] focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#346e58]"
              href={`${basePath}/tasks`}
            >
              <div>
                <p className="text-sm font-medium text-[#64756c]">Tasks</p>
                <p className="mt-2 text-4xl font-semibold tabular-nums">
                  {overview.data.taskCount}
                </p>
              </div>
              <ListTodo
                aria-hidden="true"
                className="text-[#6a9b78]"
                size={25}
              />
            </Link>
          </section>

          <section className="mt-10">
            <div className="flex items-center justify-between border-b border-[#d5ddd6] pb-3">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Activity aria-hidden="true" size={19} /> Recent updates
              </h2>
              <span className="text-xs text-[#64756c]">
                Latest changed items
              </span>
            </div>
            {overview.data.recentProjects.length === 0 &&
            overview.data.recentTasks.length === 0 ? (
              <p className="py-8 text-sm text-[#64756c]">
                Work will appear here once this organization has projects or
                tasks.
              </p>
            ) : (
              <ul className="divide-y divide-[#e4e9e4]">
                {overview.data.recentProjects.map((project) => (
                  <li className="py-4" key={`project-${project.id}`}>
                    <Link
                      className="flex flex-wrap items-center justify-between gap-3 hover:text-[#245448]"
                      href={`${basePath}/projects/${encodeURIComponent(project.id)}`}
                    >
                      <span>
                        <span className="block text-sm font-medium">
                          {project.name}
                        </span>
                        <span className="mt-1 block text-xs text-[#64756c]">
                          Project · {project.status.replaceAll("_", " ")}
                        </span>
                      </span>
                      <time
                        className="text-xs text-[#64756c]"
                        dateTime={project.updated_at}
                      >
                        {formatTime(project.updated_at)}
                      </time>
                    </Link>
                  </li>
                ))}
                {overview.data.recentTasks.map((task) => (
                  <li className="py-4" key={`task-${task.id}`}>
                    <Link
                      className="flex flex-wrap items-center justify-between gap-3 hover:text-[#245448]"
                      href={`${basePath}/tasks/${encodeURIComponent(task.id)}`}
                    >
                      <span>
                        <span className="block text-sm font-medium">
                          {task.title}
                        </span>
                        <span className="mt-1 block text-xs text-[#64756c]">
                          Task · {task.status.replaceAll("_", " ")}
                        </span>
                      </span>
                      <time
                        className="text-xs text-[#64756c]"
                        dateTime={task.updated_at}
                      >
                        {formatTime(task.updated_at)}
                      </time>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <PermissionGate permission="projects.create">
            <div className="mt-8 border-t border-[#d5ddd6] pt-5 text-sm">
              <Link
                className="font-semibold text-[#245448] underline underline-offset-4"
                href={`${basePath}/projects?create=1`}
              >
                Create a project
              </Link>
            </div>
          </PermissionGate>
        </>
      )}
    </main>
  );
}
