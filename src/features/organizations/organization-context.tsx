"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Organization } from "@/features/organizations/api";

const OrganizationContext = createContext<Organization | null>(null);

export function OrganizationProvider({
  organization,
  children,
}: {
  organization: Organization;
  children: ReactNode;
}) {
  return (
    <OrganizationContext value={organization}>{children}</OrganizationContext>
  );
}

export function useActiveOrganization(): Organization {
  const organization = useContext(OrganizationContext);
  if (!organization) {
    throw new Error(
      "useActiveOrganization must be used within an organization route",
    );
  }
  return organization;
}
