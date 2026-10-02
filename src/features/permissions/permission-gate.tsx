"use client";

import type { ReactNode } from "react";
import { usePermission } from "@/features/permissions/use-permission";
import type { Permission } from "@/features/permissions/permissions";

export function PermissionGate({
  permission,
  children,
  fallback = null,
}: {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const access = usePermission(permission);
  if (access.isPending || access.isError || !access.allowed) return fallback;
  return children;
}
