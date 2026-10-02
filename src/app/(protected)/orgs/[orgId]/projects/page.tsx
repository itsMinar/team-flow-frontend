import { Suspense } from "react";
import {
  ProjectListScreen,
  ProjectsLoading,
} from "@/features/projects/project-list-screen";

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  await params;
  return (
    <Suspense fallback={<ProjectsLoading />}>
      <ProjectListScreen />
    </Suspense>
  );
}
