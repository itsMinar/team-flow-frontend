import { authApi } from "@/features/auth/api";
import { useAuthStore } from "@/lib/api/auth-store";
import { queryKeys } from "@/lib/query/query-keys";
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

export const currentUserQueryOptions = queryOptions({
  queryKey: queryKeys.currentUser,
  queryFn: authApi.currentUser,
});

export function useCurrentUser() {
  return useQuery(currentUserQueryOptions);
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (session) => {
      useAuthStore.getState().setSession(session);
      queryClient.setQueryData(queryKeys.currentUser, session.user);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (session) => {
      useAuthStore.getState().setSession(session);
      queryClient.setQueryData(queryKeys.currentUser, session.user);
    },
  });
}

export function useLogout() {
  return useMutation({ mutationFn: authApi.logout });
}

export function useLogoutAll() {
  return useMutation({ mutationFn: authApi.logoutAll });
}
