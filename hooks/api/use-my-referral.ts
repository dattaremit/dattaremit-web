import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { getMyReferral, ApiError } from "@/services/api";

export function useMyReferral() {
  const { isSignedIn } = useAuth();

  return useQuery({
    queryKey: queryKeys.referral,
    queryFn: getMyReferral,
    enabled: !!isSignedIn,
    staleTime: 60_000,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
  });
}
