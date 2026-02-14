import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { getActivities } from "@/services/api";
import type { ActivityQueryParams } from "@/types/api";

export function useActivities(params?: ActivityQueryParams) {
  const { isSignedIn } = useAuth();

  return useQuery({
    queryKey: queryKeys.activities.list(params as Record<string, unknown>),
    queryFn: () => getActivities(params),
    enabled: !!isSignedIn,
  });
}
