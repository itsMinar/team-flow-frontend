import { redirect } from "next/navigation";

export default async function OrganizationIndex({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  redirect(`/orgs/${encodeURIComponent(orgId)}/dashboard`);
}
