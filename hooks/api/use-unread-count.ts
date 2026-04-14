import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { getUnreadCount } from "@/services/api";

export function useUnreadCount() {
  const { isSignedIn } = useAuth();
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount,
    queryFn: getUnreadCount,
    enabled: !!isSignedIn,
  });
}
