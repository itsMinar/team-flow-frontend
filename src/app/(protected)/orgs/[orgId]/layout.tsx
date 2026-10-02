import type { ReactNode } from "react";
import { OrganizationBoundary } from "@/features/organizations/organization-boundary";

export default async function OrganizationLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  return <OrganizationBoundary orgId={orgId}>{children}</OrganizationBoundary>;
}
