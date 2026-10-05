"use client";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useActiveOrganization } from "@/features/organizations/organization-context";
import type { OrganizationRole } from "@/features/permissions/api";
import { useOrganizationRoles } from "@/features/permissions/api";
import { PermissionGate } from "@/features/permissions/permission-gate";
import { useDeleteRole } from "@/features/roles/api";
import { RoleFormDialog } from "@/features/roles/role-form-dialog";
import { normalizeApiError } from "@/lib/api/normalize-api-error";
import Link from "next/link";
import { useState } from "react";

function RoleRow({
  role,
  onEdit,
  onDelete,
}: {
  role: OrganizationRole;
  onEdit: (role: OrganizationRole) => void;
  onDelete: (role: OrganizationRole) => void;
}) {
  return (
    <li className="flex flex-wrap items-start justify-between gap-4 border-b border-[#e4e9e4] py-5">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-semibold">{role.name}</h2>
          {role.is_system && (
            <span className="rounded-sm bg-[#edf1ec] px-2 py-1 text-xs text-[#53665d]">
              System role
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-[#64756c]">
          {role.description || "No description"}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {role.permissions.map((permission) => (
            <span
              className="rounded-sm border border-[#d5ddd6] px-2 py-1 text-xs text-[#53665d]"
              key={permission}
            >
              {permission}
            </span>
          ))}
        </div>
      </div>
      {!role.is_system && (
        <PermissionGate permission="roles.manage">
          <div className="flex gap-2">
            <button
              className="h-9 rounded-md border border-[#cbd4ce] px-3 text-sm font-medium hover:bg-[#f5f7f3]"
              onClick={() => onEdit(role)}
              type="button"
            >
              Edit
            </button>
            <button
              className="h-9 rounded-md border border-rose-200 px-3 text-sm font-medium text-rose-800 hover:bg-rose-50"
              onClick={() => onDelete(role)}
              type="button"
            >
              Delete
            </button>
          </div>
        </PermissionGate>
      )}
    </li>
  );
}

export function RoleListScreen() {
  const organization = useActiveOrganization();
  const roles = useOrganizationRoles(organization.id);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState<OrganizationRole | undefined>();
  const [roleToDelete, setRoleToDelete] = useState<OrganizationRole | null>(
    null,
  );
  const [mutationError, setMutationError] = useState("");
  const deleteRole = useDeleteRole(organization.id, roleToDelete?.id ?? "");

  async function confirmDelete() {
    if (!roleToDelete) return;
    setMutationError("");
    try {
      await deleteRole.mutateAsync();
      setRoleToDelete(null);
    } catch (error) {
      setMutationError(normalizeApiError(error).message);
    }
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-9 sm:px-8 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#587567]">
            {organization.name}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Roles</h1>
          <p className="mt-1 text-sm text-[#64756c]">
            System roles are fixed. Custom roles define organization
            permissions.
          </p>
        </div>
        <PermissionGate permission="roles.manage">
          <button
            className="h-10 rounded-md bg-[#193c35] px-4 text-sm font-semibold text-white hover:bg-[#245448]"
            onClick={() => {
              setRoleToEdit(undefined);
              setDialogOpen(true);
            }}
            type="button"
          >
            Create role
          </button>
        </PermissionGate>
      </div>
      <nav
        aria-label="Member settings"
        className="mt-6 flex gap-5 border-b border-[#d5ddd6]"
      >
        <PermissionGate permission="members.read">
          <Link
            className="pb-3 text-sm font-medium text-[#53665d] hover:text-[#193c35]"
            href={`/orgs/${encodeURIComponent(organization.id)}/members`}
          >
            Members
          </Link>
        </PermissionGate>
        <span
          aria-current="page"
          className="border-b-2 border-[#346e58] pb-3 text-sm font-semibold text-[#193c35]"
        >
          Roles
        </span>
      </nav>
      {mutationError && (
        <p
          className="mt-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900"
          role="alert"
        >
          {mutationError}
        </p>
      )}
      {roles.isPending ? (
        <div aria-busy="true" className="mt-6 space-y-3" role="status">
          {[0, 1, 2].map((row) => (
            <div className="h-24 animate-pulse rounded bg-white" key={row} />
          ))}
        </div>
      ) : roles.isError ? (
        <p
          className="mt-6 rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900"
          role="alert"
        >
          {normalizeApiError(roles.error).message}
        </p>
      ) : (
        <ul className="mt-2">
          {roles.data.map((role) => (
            <RoleRow
              key={role.id}
              onDelete={setRoleToDelete}
              onEdit={(selected) => {
                setRoleToEdit(selected);
                setDialogOpen(true);
              }}
              role={role}
            />
          ))}
        </ul>
      )}
      <PermissionGate permission="roles.manage">
        <RoleFormDialog
          onOpenChange={setDialogOpen}
          open={dialogOpen}
          orgId={organization.id}
          role={roleToEdit}
        />
        <ConfirmDialog
          description={`Delete the custom role ${roleToDelete?.name ?? ""}?`}
          confirmLabel={deleteRole.isPending ? "Deleting…" : "Delete role"}
          isPending={deleteRole.isPending}
          onConfirm={() => void confirmDelete()}
          onOpenChange={(open) => !open && setRoleToDelete(null)}
          open={Boolean(roleToDelete)}
          title="Delete role?"
        />
      </PermissionGate>
    </main>
  );
}
