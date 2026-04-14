import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markAllNotificationsAsRead } from "@/services/api";
import { queryKeys } from "@/constants/query-keys";

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}
