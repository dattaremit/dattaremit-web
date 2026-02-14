import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import {
  getFundingAccount,
  createFundingAccount,
  activateFundingAccount,
  deactivateFundingAccount,
  ApiError,
} from "@/services/api";

export function useFundingAccount() {
  const { isSignedIn } = useAuth();

  return useQuery({
    queryKey: queryKeys.fundingAccount,
    queryFn: getFundingAccount,
    enabled: !!isSignedIn,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 400) return false;
      return failureCount < 2;
    },
  });
}

export function useCreateFundingAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createFundingAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fundingAccount });
      queryClient.invalidateQueries({ queryKey: queryKeys.account });
    },
  });
}

export function useActivateFundingAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: activateFundingAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fundingAccount });
      queryClient.invalidateQueries({ queryKey: queryKeys.account });
    },
  });
}

export function useDeactivateFundingAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deactivateFundingAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fundingAccount });
      queryClient.invalidateQueries({ queryKey: queryKeys.account });
    },
  });
}
