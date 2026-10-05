import { TeamDetailScreen } from "@/features/teams/team-detail-screen";

export default async function TeamPage({
  params,
}: {
  params: Promise<{ orgId: string; teamId: string }>;
}) {
  const { teamId } = await params;
  return <TeamDetailScreen teamId={teamId} />;
}
