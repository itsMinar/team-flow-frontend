import { TaskListScreen } from "@/features/tasks/task-list-screen";
import { Suspense } from "react";

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
