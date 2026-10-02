import { ProjectDetailScreen } from "@/features/projects/project-detail-screen";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ orgId: string; projectId: string }>;
}) {
  const { projectId } = await params;
  return <ProjectDetailScreen projectId={projectId} />;
}
