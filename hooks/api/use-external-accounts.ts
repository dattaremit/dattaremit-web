import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import {
  getExternalAccounts,
  createExternalAccount,
  deleteExternalAccount,
} from "@/services/api";

export function useExternalAccounts() {
  const { isSignedIn } = useAuth();

  return useQuery({
    queryKey: queryKeys.externalAccounts.all,
    queryFn: getExternalAccounts,
    enabled: !!isSignedIn,
  });
}

export function useCreateExternalAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createExternalAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.externalAccounts.all,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.activities.all });
    },
  });
}

export function useDeleteExternalAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteExternalAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.externalAccounts.all,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.activities.all });
    },
  });
}
