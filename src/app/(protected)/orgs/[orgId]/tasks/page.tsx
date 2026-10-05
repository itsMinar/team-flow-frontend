import { Suspense } from "react";
import { TaskListScreen } from "@/features/tasks/task-list-screen";

export default function OrganizationTasksPage() {
  return (
    <Suspense
      fallback={
        <main aria-busy="true" className="p-8" role="status">
          Loading tasks…
        </main>
      }
    >
      <TaskListScreen />
    </Suspense>
  );
}
