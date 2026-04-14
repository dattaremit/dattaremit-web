import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteNotification } from "@/services/api";
import { queryKeys } from "@/constants/query-keys";

export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}
