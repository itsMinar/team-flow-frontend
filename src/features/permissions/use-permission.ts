"use client";

import { useActiveOrganization } from "@/features/organizations/organization-context";
import { useOrganizationRoles } from "@/features/permissions/api";
import type { Permission } from "@/features/permissions/permissions";

export function usePermissions() {
  const organization = useActiveOrganization();
  const roles = useOrganizationRoles(organization.id);
  const roleName = organization.role?.toLocaleLowerCase();
  const activeRole = roles.data?.find(
    (role) => role.name.toLocaleLowerCase() === roleName,
  );

  return {
    can: (permission: Permission) =>
      activeRole?.permissions.includes(permission) ?? false,
    isPending: roles.isPending,
    isError: roles.isError,
  };
}

export function usePermission(permission: Permission) {
  const permissions = usePermissions();
  return {
    allowed: permissions.can(permission),
    isPending: permissions.isPending,
    isError: permissions.isError,
  };
}
