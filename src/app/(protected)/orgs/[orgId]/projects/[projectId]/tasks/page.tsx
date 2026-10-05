import { TaskListScreen } from "@/features/tasks/task-list-screen";
import { Suspense } from "react";

export default async function ProjectTasksPage({
  params,
}: {
  params: Promise<{ orgId: string; projectId: string }>;
}) {
  const { projectId } = await params;
  return (
    <Suspense
      fallback={
        <main aria-busy="true" className="p-8" role="status">
          Loading tasks…
        </main>
      }
    >
      <TaskListScreen projectId={projectId} />
    </Suspense>
  );
}
