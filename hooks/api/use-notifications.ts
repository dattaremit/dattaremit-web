import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { getNotifications } from "@/services/api";
import type { NotificationFilters } from "@/types/notification";

export function useNotifications(params?: NotificationFilters) {
  const { isSignedIn } = useAuth();
  return useQuery({
    queryKey: queryKeys.notifications.list(params as Record<string, unknown> | undefined),
    queryFn: () => getNotifications(params),
    enabled: !!isSignedIn,
  });
}
