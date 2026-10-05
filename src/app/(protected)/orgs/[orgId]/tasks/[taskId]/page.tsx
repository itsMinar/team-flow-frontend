import { TaskDetailScreen } from "@/features/tasks/task-detail-screen";

export default async function TaskPage({
  params,
}: {
  params: Promise<{ orgId: string; taskId: string }>;
}) {
  const { taskId } = await params;
  return <TaskDetailScreen taskId={taskId} />;
}
