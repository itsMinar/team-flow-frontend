import type {
  CreateTaskRequest,
  OrganizationTaskParams,
  ProjectTaskParams,
  Task,
  UpdateTaskRequest,
} from "@/features/tasks/api";
import { tasksApi } from "@/features/tasks/api";
import { queryKeys } from "@/lib/query/query-keys";
import type { Paginated } from "@/types/api-envelope";
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";

export function organizationTasksQueryOptions(
  orgId: string,
  filters: OrganizationTaskParams,
) {
  return queryOptions({
    queryKey: queryKeys.taskList(orgId, filters),
    queryFn: () => tasksApi.listOrganization(orgId, filters),
  });
}

export function projectTasksQueryOptions(
  orgId: string,
  projectId: string,
  filters: ProjectTaskParams,
) {
  return queryOptions({
    queryKey: queryKeys.projectTaskList(orgId, projectId, filters),
    queryFn: () => tasksApi.listProject(orgId, projectId, filters),
  });
}

export function taskQueryOptions(orgId: string, taskId: string) {
  return queryOptions({
    queryKey: queryKeys.task(orgId, taskId),
    queryFn: () => tasksApi.get(orgId, taskId),
  });
}

export function taskActivityQueryOptions(
  orgId: string,
  taskId: string,
  page = 1,
  pageSize = 20,
) {
  const filters = { page, page_size: pageSize };
  return queryOptions({
    queryKey: queryKeys.taskActivity(orgId, taskId, filters),
    queryFn: () => tasksApi.activity(orgId, taskId, filters),
  });
}

export function useOrganizationTasks(
  orgId: string,
  filters: OrganizationTaskParams,
  enabled = true,
) {
  return useQuery({
    ...organizationTasksQueryOptions(orgId, filters),
    enabled,
  });
}

export function useProjectTasks(
  orgId: string,
  projectId: string,
  filters: ProjectTaskParams,
  enabled = true,
) {
  return useQuery({
    ...projectTasksQueryOptions(orgId, projectId, filters),
    enabled,
  });
}

export function useTask(orgId: string, taskId: string) {
  return useQuery(taskQueryOptions(orgId, taskId));
}

export function useTaskActivity(orgId: string, taskId: string) {
  return useQuery(taskActivityQueryOptions(orgId, taskId));
}

function taskListQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  orgId: string,
) {
  return queryClient
    .getQueryCache()
    .findAll()
    .filter(({ queryKey }) => {
      if (queryKey[0] !== "organizations" || queryKey[1] !== orgId) {
        return false;
      }
      return (
        (queryKey[2] === "tasks" && queryKey[3] === "list") ||
        (queryKey[2] === "projects" &&
          queryKey[4] === "tasks" &&
          queryKey[5] === "list")
      );
    });
}

function replaceTaskInList(
  list: Paginated<Task>,
  taskId: string,
  task: Task,
): Paginated<Task> {
  return {
    ...list,
    data: list.data.map((item) => (item.id === taskId ? task : item)),
  };
}

export function useCreateTask(orgId: string, projectId: string) {
  const queryClient = useQueryClient();
  const taskListsKey = ["organizations", orgId, "tasks", "list"] as const;

  return useMutation({
    mutationFn: (input: CreateTaskRequest) =>
      tasksApi.create(orgId, projectId, input),
    onSuccess: async (task) => {
      queryClient.setQueryData(queryKeys.task(orgId, task.id), task);
      await queryClient.invalidateQueries({ queryKey: taskListsKey });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.projectTaskList(orgId, projectId),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard(orgId),
      });
    },
  });
}

export function useUpdateTask(orgId: string, taskId: string) {
  const queryClient = useQueryClient();
  const detailKey = queryKeys.task(orgId, taskId);

  return useMutation({
    mutationFn: (input: UpdateTaskRequest) =>
      tasksApi.update(orgId, taskId, input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: detailKey });

      const previousDetail = queryClient.getQueryData<Task>(detailKey);
      const previousLists: Array<[QueryKey, Paginated<Task> | undefined]> =
        taskListQueries(queryClient, orgId).map((query) => [
          query.queryKey,
          query.state.data as Paginated<Task> | undefined,
        ]);
      await Promise.all(
        previousLists.map(([key]) =>
          queryClient.cancelQueries({ queryKey: key }),
        ),
      );

      if (previousDetail) {
        queryClient.setQueryData<Task>(detailKey, {
          ...previousDetail,
          ...input,
        });
      }

      for (const [key, list] of previousLists) {
        if (!list) continue;
        const cachedTask =
          previousDetail ?? list.data.find((task) => task.id === taskId);
        if (!cachedTask) continue;
        const optimisticTask: Task = { ...cachedTask, ...input };
        queryClient.setQueryData<Paginated<Task>>(
          key,
          replaceTaskInList(list, taskId, optimisticTask),
        );
      }

      return { previousDetail, previousLists };
    },
    onError: (_error, _input, context) => {
      if (!context) return;
      queryClient.setQueryData(detailKey, context.previousDetail);
      for (const [key, list] of context.previousLists) {
        queryClient.setQueryData(key, list);
      }
    },
    onSuccess: (task) => {
      queryClient.setQueryData(detailKey, task);
      for (const query of taskListQueries(queryClient, orgId)) {
        const list = query.state.data as Paginated<Task> | undefined;
        if (list) {
          queryClient.setQueryData(
            query.queryKey,
            replaceTaskInList(list, taskId, task),
          );
        }
      }
    },
    onSettled: async () => {
      await Promise.all([
        ...taskListQueries(queryClient, orgId).map((query) =>
          queryClient.invalidateQueries({ queryKey: query.queryKey }),
        ),
        queryClient.invalidateQueries({ queryKey: detailKey }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(orgId) }),
      ]);
    },
  });
}

export function useDeleteTask(orgId: string, taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => tasksApi.remove(orgId, taskId),
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: queryKeys.task(orgId, taskId) });
      await Promise.all([
        ...taskListQueries(queryClient, orgId).map((query) =>
          queryClient.invalidateQueries({ queryKey: query.queryKey }),
        ),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(orgId) }),
      ]);
    },
  });
}
