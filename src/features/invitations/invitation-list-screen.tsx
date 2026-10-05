"use client";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/data-table";
import type { Invitation } from "@/features/invitations/api";
import { InvitationFormDialog } from "@/features/invitations/invitation-form-dialog";
import {
  useInvitations,
  useResendInvitation,
  useRevokeInvitation,
} from "@/features/invitations/queries";
import {
  invitationStatuses,
  parseInvitationSearchParams,
} from "@/features/invitations/schemas";
import { useActiveOrganization } from "@/features/organizations/organization-context";
import { PermissionGate } from "@/features/permissions/permission-gate";
import { usePermission } from "@/features/permissions/use-permission";
import { normalizeApiError } from "@/lib/api/normalize-api-error";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

function dateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function InvitationActions({
  orgId,
  invitation,
  onRevoke,
}: {
  orgId: string;
  invitation: Invitation;
  onRevoke: (invitation: Invitation) => void;
}) {
  const resend = useResendInvitation(orgId);
  const [error, setError] = useState("");

  async function resendInvitation() {
    setError("");
    try {
      await resend.mutateAsync(invitation.id);
    } catch (cause) {
      setError(normalizeApiError(cause).message);
    }
  }

  if (invitation.status !== "pending")
    return <span className="text-xs text-[#74847d]">—</span>;

  return (
    <PermissionGate permission="members.manage">
      <div className="flex flex-wrap gap-2">
        <button
          className="h-8 rounded-md border border-[#cbd4ce] px-2.5 text-xs font-medium hover:bg-[#f5f7f3] disabled:opacity-50"
          disabled={resend.isPending}
          onClick={() => void resendInvitation()}
          type="button"
        >
          {resend.isPending ? "Resending…" : "Resend"}
        </button>
        <button
          className="h-8 rounded-md border border-rose-200 px-2.5 text-xs font-medium text-rose-800 hover:bg-rose-50"
          onClick={() => onRevoke(invitation)}
          type="button"
        >
          Revoke
        </button>
        {error && (
          <span className="sr-only" role="alert">
            {error}
          </span>
        )}
      </div>
    </PermissionGate>
  );
}

export function InvitationListScreen() {
  const organization = useActiveOrganization();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const parsed = parseInvitationSearchParams(searchParams);
  const access = usePermission("members.manage");
  const filters = parsed.success
    ? parsed.data
    : {
        page: 1,
        page_size: 20,
        sort: "created_at" as const,
        order: "desc" as const,
      };
  const invitations = useInvitations(
    organization.id,
    filters,
    parsed.success && access.allowed,
  );
  const revoke = useRevokeInvitation(organization.id);
  const [formOpen, setFormOpen] = useState(false);
  const [invitationToRevoke, setInvitationToRevoke] =
    useState<Invitation | null>(null);
  const [error, setError] = useState("");

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

  async function confirmRevoke() {
    if (!invitationToRevoke) return;
    setError("");
    try {
      await revoke.mutateAsync(invitationToRevoke.id);
      setInvitationToRevoke(null);
    } catch (cause) {
      setError(normalizeApiError(cause).message);
    }
  }

  const columns: DataTableColumn<Invitation>[] = [
    {
      id: "email",
      header: "Email",
      rowHeader: true,
      sortKey: "email",
      render: (invitation) => invitation.email,
    },
    {
      id: "role",
      header: "Role",
      render: (invitation) => invitation.role_name ?? "—",
    },
    {
      id: "status",
      header: "Status",
      render: (invitation) => invitation.status,
    },
    {
      id: "created",
      header: "Sent",
      sortKey: "created_at",
      render: (invitation) => dateTime(invitation.created_at),
    },
    {
      id: "expires",
      header: "Expires",
      sortKey: "expires_at",
      render: (invitation) => dateTime(invitation.expires_at),
    },
    {
      id: "actions",
      header: "Actions",
      render: (invitation) => (
        <InvitationActions
          invitation={invitation}
          onRevoke={setInvitationToRevoke}
          orgId={organization.id}
        />
      ),
    },
  ];

  if (access.isPending) {
    return (
      <main
        aria-busy="true"
        className="mx-auto max-w-7xl px-5 py-10 text-sm text-[#53665d]"
        role="status"
      >
        Checking invitation access…
      </main>
    );
  }

  if (access.isError || !access.allowed) {
    return (
      <main
        className="mx-auto max-w-7xl px-5 py-10 text-sm text-[#64756c]"
        role="status"
      >
        You do not have permission to manage invitations.
      </main>
    );
  }

  if (!parsed.success) {
    return (
      <main className="mx-auto max-w-7xl px-5 py-10">
        <p
          className="rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900"
          role="alert"
        >
          Invitation filters are invalid. Page size must be 1–100.
        </p>
        <button
          className="mt-3 text-sm font-semibold underline"
          onClick={() => router.replace(pathname)}
          type="button"
        >
          Clear filters
        </button>
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
            Invitations
          </h1>
          <p className="mt-1 text-sm text-[#64756c]">
            Invite people into this organization and manage pending access.
          </p>
        </div>
        <PermissionGate permission="members.manage">
          <button
            className="h-10 rounded-md bg-[#193c35] px-4 text-sm font-semibold text-white hover:bg-[#245448]"
            onClick={() => setFormOpen(true)}
            type="button"
          >
            Invite teammate
          </button>
        </PermissionGate>
      </div>
      <section
        aria-label="Invitation filters"
        className="mt-7 grid gap-3 rounded-md border border-[#d5ddd6] bg-white p-4 sm:grid-cols-3"
      >
        <label className="text-xs font-semibold text-[#53665d]">
          Status
          <select
            className="mt-1.5 h-10 w-full rounded-md border border-[#cbd4ce] bg-white px-3 text-sm font-normal"
            onChange={(event) => changeParam("status", event.target.value)}
            value={filters.status ?? ""}
          >
            <option value="">All statuses</option>
            {invitationStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold text-[#53665d]">
          Email
          <input
            className="mt-1.5 h-10 w-full rounded-md border border-[#cbd4ce] px-3 text-sm font-normal"
            onChange={(event) => changeParam("email", event.target.value)}
            placeholder="Filter by email"
            type="email"
            value={filters.email ?? ""}
          />
        </label>
        <label className="text-xs font-semibold text-[#53665d]">
          Per page
          <select
            className="mt-1.5 h-10 w-full rounded-md border border-[#cbd4ce] bg-white px-3 text-sm font-normal"
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
      {error && (
        <p
          className="mt-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900"
          role="alert"
        >
          {error}
        </p>
      )}
      <section
        aria-label="Invitations"
        className="mt-4 overflow-hidden rounded-md border border-[#d5ddd6] bg-white"
      >
        {invitations.isPending ? (
          <div aria-busy="true" className="space-y-3 p-5" role="status">
            {[0, 1, 2].map((row) => (
              <div
                className="h-12 animate-pulse rounded bg-[#edf1ec]"
                key={row}
              />
            ))}
          </div>
        ) : invitations.isError ? (
          <p className="p-5 text-sm text-rose-900" role="alert">
            {normalizeApiError(invitations.error).message}
          </p>
        ) : invitations.data.data.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-[#64756c]">
            No invitations match these filters.
          </p>
        ) : (
          <DataTable
            caption={`Invitations for ${organization.name}`}
            columns={columns}
            onSort={(sort) => changeParam("sort", sort)}
            order={filters.order}
            pagination={{
              page: invitations.data.pagination.page,
              pageSize: invitations.data.pagination.page_size,
              total: invitations.data.pagination.total,
              totalPages: invitations.data.pagination.total_pages,
              onPageChange: changePage,
            }}
            rows={invitations.data.data}
            sortBy={filters.sort}
          />
        )}
      </section>
      <PermissionGate permission="members.manage">
        <InvitationFormDialog
          onOpenChange={setFormOpen}
          open={formOpen}
          orgId={organization.id}
        />
        <ConfirmDialog
          description={`Revoke the invitation for ${invitationToRevoke?.email ?? ""}? The emailed link will stop working.`}
          confirmLabel={revoke.isPending ? "Revoking…" : "Revoke invitation"}
          isPending={revoke.isPending}
          onConfirm={() => void confirmRevoke()}
          onOpenChange={(open) => !open && setInvitationToRevoke(null)}
          open={Boolean(invitationToRevoke)}
          title="Revoke invitation?"
        />
      </PermissionGate>
    </main>
  );
}
