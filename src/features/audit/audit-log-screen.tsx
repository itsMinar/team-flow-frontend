"use client";

import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { useAuditLogs, type AuditEntry } from "@/features/audit/api";
import { parseAuditSearchParams } from "@/features/audit/schemas";
import { useActiveOrganization } from "@/features/organizations/organization-context";
import { PermissionGate } from "@/features/permissions/permission-gate";
import { usePermission } from "@/features/permissions/use-permission";
import { normalizeApiError } from "@/lib/api/normalize-api-error";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function shortened(value: string | undefined) {
  if (!value) return "—";
  return value.length > 14 ? `${value.slice(0, 8)}…${value.slice(-4)}` : value;
}

export function AuditLogScreen() {
  const organization = useActiveOrganization();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const parsed = parseAuditSearchParams(searchParams);
  const filters = parsed.success ? parsed.data : { page: 1, page_size: 20 };
  const access = usePermission("audit.read");
  const logs = useAuditLogs(
    organization.id,
    filters,
    parsed.success && access.allowed,
  );

  function changeParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.set("page", "1");
    router.replace(`${pathname}?${next.toString()}`);
  }

  function changePage(page: number) {
    changeParam("page", String(page));
  }

  const columns: DataTableColumn<AuditEntry>[] = [
    {
      id: "time",
      header: "Time",
      render: (entry) => formatDate(entry.created_at),
    },
    {
      id: "action",
      header: "Action",
      rowHeader: true,
      render: (entry) => entry.action,
    },
    {
      id: "outcome",
      header: "Outcome",
      render: (entry) => (
        <span
          className={`rounded-sm px-2 py-1 text-xs font-medium ${entry.outcome === "success" ? "bg-[#e5f1e7] text-[#23543a]" : entry.outcome === "denied" ? "bg-amber-100 text-amber-900" : "bg-rose-100 text-rose-900"}`}
        >
          {entry.outcome}
        </span>
      ),
    },
    {
      id: "actor",
      header: "Actor",
      render: (entry) => shortened(entry.actor_user_id),
    },
    {
      id: "target",
      header: "Target",
      render: (entry) =>
        entry.target_type
          ? `${entry.target_type}${entry.target_id ? ` · ${shortened(entry.target_id)}` : ""}`
          : "—",
    },
  ];

  if (access.isPending) {
    return (
      <main
        aria-busy="true"
        className="mx-auto max-w-7xl px-5 py-10 text-sm text-[#53665d]"
        role="status"
      >
        Checking audit access…
      </main>
    );
  }

  if (access.isError || !access.allowed) {
    return (
      <main
        className="mx-auto max-w-7xl px-5 py-10 text-sm text-[#64756c]"
        role="status"
      >
        You do not have access to the audit log.
      </main>
    );
  }

  return (
    <PermissionGate
      permission="audit.read"
      fallback={
        <main className="mx-auto max-w-7xl px-5 py-10 text-sm text-[#64756c]">
          You do not have access to the audit log.
        </main>
      }
    >
      <main className="mx-auto w-full max-w-7xl px-5 py-9 sm:px-8 sm:py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#587567]">
          {organization.name}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Audit log
        </h1>
        <p className="mt-1 text-sm text-[#64756c]">
          Security-relevant activity from the last 90 days.
        </p>
        {!parsed.success ? (
          <section
            className="mt-7 rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900"
            role="alert"
          >
            <p>
              Audit filters are invalid. Pagination and time range must match
              the API limits.
            </p>
            <button
              className="mt-2 font-semibold underline"
              onClick={() => router.replace(pathname)}
              type="button"
            >
              Clear filters
            </button>
          </section>
        ) : (
          <>
            <section
              aria-label="Audit filters"
              className="mt-7 grid gap-3 rounded-md border border-[#d5ddd6] bg-white p-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              <label className="text-xs font-semibold text-[#53665d]">
                Action
                <input
                  className="mt-1.5 h-10 w-full rounded-md border border-[#cbd4ce] px-3 text-sm font-normal"
                  maxLength={100}
                  onChange={(event) =>
                    changeParam("action", event.target.value)
                  }
                  placeholder="Filter action"
                  value={filters.action ?? ""}
                />
              </label>
              <label className="text-xs font-semibold text-[#53665d]">
                Outcome
                <select
                  className="mt-1.5 h-10 w-full rounded-md border border-[#cbd4ce] bg-white px-3 text-sm font-normal"
                  onChange={(event) =>
                    changeParam("outcome", event.target.value)
                  }
                  value={filters.outcome ?? ""}
                >
                  <option value="">All outcomes</option>
                  <option value="success">Success</option>
                  <option value="failure">Failure</option>
                  <option value="denied">Denied</option>
                </select>
              </label>
              <label className="text-xs font-semibold text-[#53665d]">
                Actor user ID
                <input
                  className="mt-1.5 h-10 w-full rounded-md border border-[#cbd4ce] px-3 text-sm font-normal"
                  onChange={(event) =>
                    changeParam("actor_user_id", event.target.value)
                  }
                  placeholder="UUID"
                  value={filters.actor_user_id ?? ""}
                />
              </label>
              <label className="text-xs font-semibold text-[#53665d]">
                Since
                <input
                  className="mt-1.5 h-10 w-full rounded-md border border-[#cbd4ce] px-3 text-sm font-normal"
                  max={new Date().toISOString()}
                  onChange={(event) =>
                    changeParam(
                      "since",
                      event.target.value
                        ? new Date(
                            `${event.target.value}T00:00:00Z`,
                          ).toISOString()
                        : "",
                    )
                  }
                  type="date"
                  value={filters.since?.slice(0, 10) ?? ""}
                />
              </label>
            </section>
            <section
              aria-label="Audit events"
              className="mt-4 overflow-hidden rounded-md border border-[#d5ddd6] bg-white"
            >
              {logs.isPending ? (
                <div aria-busy="true" className="space-y-3 p-5" role="status">
                  {[0, 1, 2].map((row) => (
                    <div
                      className="h-12 animate-pulse rounded bg-[#edf1ec]"
                      key={row}
                    />
                  ))}
                </div>
              ) : logs.isError ? (
                <p className="p-5 text-sm text-rose-900" role="alert">
                  {normalizeApiError(logs.error).message}
                </p>
              ) : logs.data.data.length === 0 ? (
                <p className="px-6 py-12 text-center text-sm text-[#64756c]">
                  No audit events match these filters.
                </p>
              ) : (
                <DataTable
                  caption={`Audit events for ${organization.name}`}
                  columns={columns}
                  pagination={{
                    page: logs.data.pagination.page,
                    pageSize: logs.data.pagination.page_size,
                    total: logs.data.pagination.total,
                    totalPages: logs.data.pagination.total_pages,
                    onPageChange: changePage,
                  }}
                  rows={logs.data.data}
                />
              )}
            </section>
          </>
        )}
      </main>
    </PermissionGate>
  );
}
