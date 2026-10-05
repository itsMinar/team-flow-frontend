"use client";

import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/data-table";
import type { Member } from "@/features/members/api";
import { useAssignMemberRole, useMembers } from "@/features/members/api";
import { useActiveOrganization } from "@/features/organizations/organization-context";
import { useOrganizationRoles } from "@/features/permissions/api";
import { PermissionGate } from "@/features/permissions/permission-gate";
import { normalizeApiError } from "@/lib/api/normalize-api-error";
import Link from "next/link";
import { useState } from "react";

type MemberRow = Member & { id: string };

function MemberRoleControl({ member }: { member: Member }) {
  const organization = useActiveOrganization();
  const roles = useOrganizationRoles(organization.id);
  const assignRole = useAssignMemberRole(organization.id);
  const [error, setError] = useState("");
  const currentRole = roles.data?.find((role) => role.name === member.role);

  if (roles.isError) {
    return (
      <span className="text-xs text-[#64756c]" role="status">
        Role options unavailable
      </span>
    );
  }

  async function changeRole(roleId: string) {
    if (!roleId) return;
    setError("");
    try {
      await assignRole.mutateAsync({
        membershipId: member.membership_id,
        roleId,
      });
    } catch (cause) {
      setError(normalizeApiError(cause).message);
    }
  }

  return (
    <PermissionGate permission="members.manage">
      <div>
        <label
          className="sr-only"
          htmlFor={`member-role-${member.membership_id}`}
        >
          Role for {member.first_name} {member.last_name}
        </label>
        <select
          aria-describedby={
            error ? `member-role-error-${member.membership_id}` : undefined
          }
          className="h-9 min-w-32 rounded-md border border-[#cbd4ce] bg-white px-2 text-sm focus-visible:outline-2 focus-visible:outline-[#346e58] disabled:opacity-60"
          disabled={roles.isPending || assignRole.isPending || !currentRole}
          id={`member-role-${member.membership_id}`}
          onChange={(event) => void changeRole(event.target.value)}
          value={currentRole?.id ?? ""}
        >
          {roles.data?.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
        {error && (
          <span
            className="sr-only"
            id={`member-role-error-${member.membership_id}`}
            role="alert"
          >
            {error}
          </span>
        )}
      </div>
    </PermissionGate>
  );
}

function memberColumns(): DataTableColumn<MemberRow>[] {
  return [
    {
      id: "name",
      header: "Member",
      rowHeader: true,
      render: (member) => (
        <span>
          {member.first_name} {member.last_name}
        </span>
      ),
    },
    { id: "email", header: "Email", render: (member) => member.email },
    {
      id: "role",
      header: "Role",
      render: (member) => <MemberRoleControl member={member} />,
    },
    { id: "status", header: "Status", render: (member) => member.status },
    {
      id: "joined",
      header: "Joined",
      render: (member) =>
        member.joined_at
          ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
              new Date(member.joined_at),
            )
          : "—",
    },
  ];
}

export function MemberListScreen() {
  const organization = useActiveOrganization();
  const members = useMembers(organization.id);
  const rows: MemberRow[] = (members.data ?? []).map((member) => ({
    ...member,
    id: member.membership_id,
  }));

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-9 sm:px-8 sm:py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#587567]">
        {organization.name}
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Members</h1>
      <p className="mt-1 text-sm text-[#64756c]">
        People with access to this organization.
      </p>
      <nav
        aria-label="Member settings"
        className="mt-6 flex gap-5 border-b border-[#d5ddd6]"
      >
        <span
          aria-current="page"
          className="border-b-2 border-[#346e58] pb-3 text-sm font-semibold text-[#193c35]"
        >
          Members
        </span>
        <PermissionGate permission="roles.read">
          <Link
            className="pb-3 text-sm font-medium text-[#53665d] hover:text-[#193c35]"
            href={`/orgs/${encodeURIComponent(organization.id)}/roles`}
          >
            Roles
          </Link>
        </PermissionGate>
      </nav>

      {members.isPending ? (
        <div aria-busy="true" className="mt-6 space-y-3" role="status">
          {[0, 1, 2].map((row) => (
            <div className="h-14 animate-pulse rounded bg-white" key={row} />
          ))}
        </div>
      ) : members.isError ? (
        <p
          className="mt-6 rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900"
          role="alert"
        >
          {normalizeApiError(members.error).message}
        </p>
      ) : rows.length === 0 ? (
        <p className="mt-6 border-y border-[#d5ddd6] py-10 text-center text-sm text-[#64756c]">
          No organization members found.
        </p>
      ) : (
        <section
          aria-label="Organization members"
          className="mt-6 overflow-hidden rounded-md border border-[#d5ddd6] bg-white"
        >
          <DataTable
            caption={`Members of ${organization.name}`}
            columns={memberColumns()}
            rows={rows}
          />
        </section>
      )}
    </main>
  );
}
