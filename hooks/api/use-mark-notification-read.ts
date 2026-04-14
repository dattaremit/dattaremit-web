import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markNotificationAsRead } from "@/services/api";
import { queryKeys } from "@/constants/query-keys";

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}
